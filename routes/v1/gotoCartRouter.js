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
    // 동일한 항목이 이미 있는지 확인
    const [rows] = await db.query(
      `SELECT * FROM cart WHERE user_id = ? AND cloth_id = ?`,
      [user_id, cloth_id, size]
    );

    if (rows.length > 0) {
      return res.status(409).json({ error: '이미 장바구니에 존재하는 상품입니다.' });
    }

    const [result] = await db.query(
      `INSERT INTO cart (user_id, cloth_id, quantity, size, name)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, cloth_id, quantity || 1, size, name || null]
    );

    console.log('🛒 장바구니 추가 성공:', result);
    res.status(200).json({ success: true, message: '장바구니에 추가되었습니다.' });
  } catch (err) {
    console.error('❌ 장바구니 추가 실패:', err);
    res.status(500).json({ success: false, error: '장바구니 추가 중 오류 발생........ㅅㅂ' });
  }
});

module.exports = router;
