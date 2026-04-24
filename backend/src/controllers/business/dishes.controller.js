const db = require('../../config/db');

const getDishes = async (req, res) => {
    try {
        const bizId = req.businessId;
        const { category, food_type, search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        let where = ['business_id = $1'];
        let params = [bizId];
        let idx = 2;
        if (category) { where.push(`category = $${idx++}`); params.push(category); }
        if (food_type) { where.push(`food_type = $${idx++}`); params.push(food_type); }
        if (search) { where.push(`dish_name ILIKE $${idx++}`); params.push(`%${search}%`); }

        const countResult = await db.query(`SELECT COUNT(*) FROM dishes WHERE ${where.join(' AND ')}`, params);
        const total = parseInt(countResult.rows[0].count);

        params.push(limit, offset);
        const result = await db.query(
            `SELECT * FROM dishes WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx+1}`,
            params
        );
        res.json({ success: true, data: result.rows, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const addDish = async (req, res) => {
    try {
        const { dish_name, category, food_type, price, description, is_available, is_best_seller } = req.body;
        const photo_url = req.file ? `/uploads/businesses/${req.file.filename}` : null;
        const result = await db.query(
            `INSERT INTO dishes (business_id, dish_name, category, food_type, price, description, photo_url, is_available, is_best_seller)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [req.businessId, dish_name, category, food_type, price, description || null, photo_url,
             is_available !== 'false', is_best_seller === 'true']
        );
        res.status(201).json({ success: true, dish: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const updateDish = async (req, res) => {
    try {
        const { dishId } = req.params;
        const { dish_name, category, food_type, price, description, is_available, is_best_seller } = req.body;
        const existing = await db.query('SELECT * FROM dishes WHERE id = $1 AND business_id = $2', [dishId, req.businessId]);
        if (existing.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Dish not found' } });

        const photo_url = req.file ? `/uploads/businesses/${req.file.filename}` : existing.rows[0].photo_url;
        const result = await db.query(
            `UPDATE dishes SET dish_name=$1, category=$2, food_type=$3, price=$4, description=$5, photo_url=$6, is_available=$7, is_best_seller=$8, updated_at=NOW()
             WHERE id=$9 AND business_id=$10 RETURNING *`,
            [dish_name, category, food_type, price, description, photo_url,
             is_available !== 'false', is_best_seller === 'true', dishId, req.businessId]
        );
        res.json({ success: true, dish: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const deleteDish = async (req, res) => {
    try {
        const { dishId } = req.params;
        await db.query('DELETE FROM dishes WHERE id = $1 AND business_id = $2', [dishId, req.businessId]);
        res.json({ success: true, message: 'Dish deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const toggleDishAvailability = async (req, res) => {
    try {
        const { dishId } = req.params;
        const { is_available } = req.body;
        await db.query('UPDATE dishes SET is_available=$1, updated_at=NOW() WHERE id=$2 AND business_id=$3', [is_available, dishId, req.businessId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

module.exports = { getDishes, addDish, updateDish, deleteDish, toggleDishAvailability };
