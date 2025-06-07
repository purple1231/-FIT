const express = require('express');
const router = express.Router();
const db = require('../../db/db');

router.post('/detail', async (req, res) => {
  const itemId = req.body.itemId;
  console.log('✅ /api/v1/detail POST 요청 수신됨, itemId:', itemId);

  try {
    console.log('🔍🔍🔍🔍 DB에 쿼리 보내는 중...');
    const [results] = await db.query('SELECT * FROM cloth WHERE id = ?', [itemId]);
    console.log('📊📊📊📊 쿼리 결과:', results);

    if (!results || results.length === 0) {
      console.log('❗️❗️❗️❗️해당 ID의 상품 없음:', itemId);
      return res.status(404).send('상품을 찾을 수 없습니다.');
    }

    const item = results[0];
    console.log('🎯🎯🎯🎯 상품 조회 성공:', item);
    res.render('detail', { item });
  } catch (err) {
    console.error('❌ DB 오류:', err);
    res.status(500).send('DB 오류 발생');
  }
});

module.exports = router;