const express = require('express');
const router = express.Router();
const db = require('../../db/db');

// POST /api/v1/cart
router.post('/cart', async (req, res) => {

    console.log('시작');
  const { user_id, cloth_id, quantity, size, name } = req.body;

  if (!user_id || !cloth_id || !size) {
    return res.status(400).json({ error: 'user_id, cloth_id, size는 필수입니다.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO cart (user_id, cloth_id, quantity, size, name)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, cloth_id, quantity || 1, size, name || null]
    );

    console.log('🛒 장바구니 추가 성공:', result);
    res.status(200).json({ message: '장바구니에 추가되었습니다.' });
  } catch (err) {
    console.error('❌ 장바구니 추가 실패:', err);
    res.status(500).json({ error: '장바구니 추가 중 오류 발생' });
  }
});

module.exports = router;
