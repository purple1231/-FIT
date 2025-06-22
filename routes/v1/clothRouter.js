// routes/v1/detailRouter.js
const express = require('express');
const router = express.Router();
const db = require('../../db/db'); // 실제 경로에 맞게 수정

// GET /api/v1/cloth
router.get('/cloth', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cloth');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'DB 오류', details: err.message });
    }
});

module.exports = router;
