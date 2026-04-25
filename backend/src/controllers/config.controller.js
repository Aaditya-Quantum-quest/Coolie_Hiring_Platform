const db = require('../config/db');

exports.getTrains = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM trains ORDER BY id ASC');
        // map to match frontend shape: { no, name, from, to, platform, status, arr, delay }
        const trains = result.rows.map(t => ({
            no: t.train_no,
            name: t.name,
            from: t.from_station,
            to: t.to_station,
            platform: t.platform,
            status: t.status,
            arr: t.arrival_time ? t.arrival_time.substring(0, 5) : '00:00',
            delay: t.delay_minutes
        }));
        res.status(200).json({ success: true, trains });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPricing = async (req, res) => {
    try {
        const tiersResult = await db.query('SELECT * FROM price_tiers');
        const surgesResult = await db.query('SELECT * FROM festival_surges WHERE is_active = true');
        
        const priceTable = {};
        tiersResult.rows.forEach(t => {
            priceTable[t.size] = {
                label: t.label,
                base: t.base_price,
                maxDiscount: t.max_discount,
                floor: t.floor_price
            };
        });

        const festivalSurges = {};
        surgesResult.rows.forEach(s => {
            festivalSurges[s.festival_name] = s.surge_percentage;
        });

        res.status(200).json({ success: true, priceTable, festivalSurges });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBusyHours = async (req, res) => {
    try {
        const result = await db.query('SELECT day_of_week, hour_of_day, busy_level FROM busy_hours ORDER BY day_of_week, hour_of_day');
        
        // Frontend expects an array of 7 arrays (Mon-Sun), each with 24 hours.
        // DB has 0=Mon, 6=Sun
        const busyHours = Array.from({ length: 7 }, () => Array(24).fill(0));
        
        result.rows.forEach(row => {
            busyHours[row.day_of_week][row.hour_of_day] = row.busy_level;
        });

        res.status(200).json({ success: true, busyHours });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
