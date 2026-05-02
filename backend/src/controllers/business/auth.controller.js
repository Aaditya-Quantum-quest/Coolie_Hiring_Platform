const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const { BUSINESS_JWT_SECRET } = require('../../middleware/authBusiness.middleware');
const { sendBusinessRegistrationEmail } = require('../../utils/mailer');


const register = async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const {
            business_type, business_name, full_name, email, password,
            gst_number, description, year_established,
            full_address, city, state, pincode, latitude, longitude, nearest_station_id,
            phone_primary, phone_alternate, whatsapp_number, website_url,
            opening_time, closing_time, days_open, closed_on_holidays, payment_modes,
            // Restaurant
            cuisine_types, food_type, specialty_dishes, dining_options,
            avg_cost_for_two, seating_capacity, has_ac, has_parking, has_wifi,
            has_family_seating, has_private_dining,
            // Hotel
            total_rooms, star_rating, check_in_time, check_out_time,
            extra_bed_available, extra_bed_charge, amenities, room_types
        } = req.body;

        if (!email || !password || !business_name || !business_type || !phone_primary) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, error: { message: 'Missing required fields' } });
        }

        const existing = await client.query('SELECT id FROM business_owners WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ success: false, error: { message: 'Email already registered' } });
        }

        const password_hash = await bcrypt.hash(password, 12);
        const ownerResult = await client.query(
            `INSERT INTO business_owners (full_name, email, password_hash, phone_primary, phone_alternate, whatsapp_number, website_url)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
            [full_name, email, password_hash, phone_primary, phone_alternate || null, whatsapp_number || null, website_url || null]
        );
        const owner_id = ownerResult.rows[0].id;

        const logoUrl = req.files?.logo?.[0] ? `/uploads/businesses/${req.files.logo[0].filename}` : null;
        const coverUrl = req.files?.cover?.[0] ? `/uploads/businesses/${req.files.cover[0].filename}` : null;

        // Safe parsers: prevent "null" strings or invalid values from reaching typed DB columns
        const safeInt = (v) => { const n = parseInt(v); return isNaN(n) ? null : n; };
        const safeFloat = (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; };
        const safeJson = (v) => { try { return (v && v !== 'null') ? JSON.parse(v) : null; } catch { return null; } };

        const bizResult = await client.query(
            `INSERT INTO businesses (owner_id, business_type, business_name, description, gst_number, year_established,
             logo_url, cover_photo_url, latitude, longitude, full_address, city, state, pincode, nearest_station_id,
             opening_time, closing_time, days_open, closed_on_holidays, payment_modes, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,'pending') RETURNING id`,
            [owner_id, business_type, business_name, description || null, gst_number || null,
             safeInt(year_established), logoUrl, coverUrl,
             safeFloat(latitude), safeFloat(longitude), full_address || null, city || null, state || null,
             pincode || null, safeInt(nearest_station_id), opening_time || null, closing_time || null,
             safeJson(days_open), closed_on_holidays === 'true',
             safeJson(payment_modes)]
        );
        const business_id = bizResult.rows[0].id;

        if (business_type === 'restaurant') {
            const normalizedFoodType = food_type ? food_type.toLowerCase() : null;
            await client.query(
                `INSERT INTO restaurant_details (business_id, cuisine_types, food_type, specialty_dishes,
                 dining_options, avg_cost_for_two, seating_capacity, has_ac, has_parking, has_wifi, has_family_seating, has_private_dining)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
                [business_id, safeJson(cuisine_types), normalizedFoodType,
                 safeJson(specialty_dishes),
                 safeJson(dining_options),
                 safeInt(avg_cost_for_two), safeInt(seating_capacity),
                 has_ac === 'true', has_parking === 'true', has_wifi === 'true',
                 has_family_seating === 'true', has_private_dining === 'true']
            );
        } else if (business_type === 'hotel') {
            await client.query(
                `INSERT INTO hotel_details (business_id, total_rooms, star_rating, check_in_time, check_out_time,
                 extra_bed_available, extra_bed_charge, amenities)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
                [business_id, safeInt(total_rooms), safeInt(star_rating),
                 check_in_time || null, check_out_time || null,
                 extra_bed_available === 'true', safeInt(extra_bed_charge),
                 safeJson(amenities)]
            );

            if (room_types) {
                const parsedRooms = safeJson(room_types);
                if (parsedRooms && Array.isArray(parsedRooms)) {
                    for (const room of parsedRooms) {
                        const r_type = typeof room === 'string' ? room : room.room_type;
                        const r_price = typeof room === 'string' ? 0 : (safeInt(room.price_per_night) || 0);
                        const r_total = typeof room === 'string' ? null : safeInt(room.total_rooms_of_type);
                        const r_extra = typeof room === 'string' ? false : (room.extra_bed_available === true || room.extra_bed_available === 'true');
                        const r_charge = typeof room === 'string' ? null : safeInt(room.extra_bed_charge);

                        await client.query(
                            `INSERT INTO room_types (business_id, room_type, price_per_night, total_rooms_of_type, extra_bed_available, extra_bed_charge)
                             VALUES ($1,$2,$3,$4,$5,$6)`,
                            [business_id, r_type, r_price, r_total, r_extra, r_charge]
                        );
                    }
                }
            }
        }

        // Handle gallery photos
        if (req.files?.gallery) {
            for (const file of req.files.gallery) {
                await client.query(
                    `INSERT INTO business_photos (business_id, photo_url, photo_type) VALUES ($1,$2,'gallery')`,
                    [business_id, `/uploads/businesses/${file.filename}`]
                );
            }
        }

        await client.query('COMMIT');

        // Send confirmation email (fire-and-forget)
        sendBusinessRegistrationEmail(email, full_name, business_name).catch(e =>
            console.warn('[MAILER] Business registration email failed:', e.message)
        );

        res.status(201).json({
            success: true,
            message: 'Registration submitted for approval. You will receive an email within 24-48 hours.'
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Business registration error:', err);
        res.status(500).json({ success: false, error: { message: 'Registration failed. Please try again.' } });
    } finally {
        client.release();
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: { message: 'Email and password required' } });
        }

        const result = await db.query(
            `SELECT bo.*, b.id as business_id, b.business_type, b.status, b.rejection_reason, 
                    b.business_name, b.verification_level, b.verification_status
             FROM business_owners bo
             JOIN businesses b ON b.owner_id = bo.id
             WHERE bo.email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: { message: 'Invalid email or password' } });
        }

        const owner = result.rows[0];
        const valid = await bcrypt.compare(password, owner.password_hash);
        if (!valid) {
            return res.status(401).json({ success: false, error: { message: 'Invalid email or password' } });
        }

        // Gate login: only allow if Level 1 is approved
        if (!owner.verification_level || owner.verification_level < 1) {
            return res.status(403).json({ 
                success: false, 
                error: { 
                    message: 'Your business is pending admin approval. You will receive an email once approved.',
                    code: 'PENDING_APPROVAL'
                } 
            });
        }

        if (owner.verification_status === 'rejected') {
            return res.status(403).json({ success: false, error: { message: 'Your application was rejected.', reason: owner.rejection_reason, code: 'REJECTED' } });
        }

        const token = jwt.sign(
            { owner_id: owner.id, business_id: owner.business_id, business_type: owner.business_type, role: 'owner' },
            BUSINESS_JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            verification_level: owner.verification_level,
            owner: { id: owner.id, full_name: owner.full_name, email: owner.email },
            business: { id: owner.business_id, name: owner.business_name, type: owner.business_type, status: owner.status, verification_level: owner.verification_level }
        });
    } catch (err) {
        console.error('Business login error:', err);
        res.status(500).json({ success: false, error: { message: 'Login failed' } });
    }
};

const changePassword = async (req, res) => {
    try {
        const { old_password, new_password } = req.body;
        const result = await db.query('SELECT password_hash FROM business_owners WHERE id = $1', [req.owner.id]);
        const valid = await bcrypt.compare(old_password, result.rows[0].password_hash);
        if (!valid) return res.status(400).json({ success: false, error: { message: 'Incorrect current password' } });
        const hash = await bcrypt.hash(new_password, 12);
        await db.query('UPDATE business_owners SET password_hash = $1 WHERE id = $2', [hash, req.owner.id]);
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const getStations = async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, code, city, state FROM stations ORDER BY name');
        res.json({ success: true, stations: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

module.exports = { register, login, changePassword, getStations };
