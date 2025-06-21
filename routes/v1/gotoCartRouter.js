const express = require('express');
const router = express.Router();
const db = require('../../db/db');
const { processTryOn } = require('../../utils/tryOnUtil');

// POST /api/v1/cartgo
router.post('/cartgo', async (req, res) => {
  console.log('시작');
  const { user_id, cloth_id, quantity, size, name, image_url } = req.body;
  const avatarUrl = req.session.user?.my_url; // 세션에서 아바타 URL 가져오기

  if (!user_id || !cloth_id || !size) {
    return res.status(400).json({ error: 'user_id, cloth_id, size는 필수입니다.' });
  }

  if (!avatarUrl || !image_url) {
    return res.status(400).json({ error: '아바타 이미지와 의류 이미지 URL이 필요합니다.' });
  }

  try {
    // 동일한 항목이 이미 있는지 확인
    const [rows] = await db.query(
      `SELECT * FROM cart WHERE user_id = ? AND cloth_id = ? AND size = ?`,
      [user_id, cloth_id, size]
    );

    if (rows.length > 0) {
      console.log('이미 장바구니에 존재하는 상품입니다.');
      return res.status(409).json({ error: '이미 장바구니에 존재하는 상품입니다.' });
    }

    // 장바구니에 먼저 추가
    const [result] = await db.query(
      `INSERT INTO cart (user_id, cloth_id, quantity, size, name, image_url, tryon_image)
       VALUES (?, ?, ?, ?, ?, ?, NULL)`,
      [user_id, cloth_id, quantity || 1, size, name || null, image_url]
    );

    const cartId = result.insertId;

    const baseUrl = 'http://localhost:3000'; // 배포 서버라면 그 주소로 바꿔// 배포 시 실제 도메인으로 교체

    const avatarUrlFull = avatarUrl.startsWith('http')
      ? avatarUrl
      : `${baseUrl}${avatarUrl}`;

    const clothingUrlFull = image_url.startsWith('http')
      ? image_url
      : `${baseUrl}${image_url}`;


    console.log('avatarUrl:', avatarUrl);
    console.log('image_url:', image_url);

    // 가상 피팅 처리 (비동기로 실행)
    processTryOn(avatarUrlFull, clothingUrlFull, cartId)
      .then(async (tryonImagePath) => {
      await db.query(
        `UPDATE cart SET ai_cloth_url = ? WHERE id = ?`,
        [tryonImagePath, cartId]
      );
      console.log(`🔄 가상 피팅 이미지 업데이트 완료 (Cart ID: ${cartId})`);
      })
      .catch(err => {
        console.error(`❌ 가상 피팅 처리 실패 (Cart ID: ${cartId}):`, err);
      });

    console.log('🛒 장바구니 추가 성공:', result);
    res.status(200).json({ 
      success: true, 
      message: '장바구니에 추가되었습니다. 가상 피팅 결과는 잠시 후 확인할 수 있습니다.' 
    });
  } catch (err) {
    console.error('❌ 장바구니 추가 실패:', err);
    res.status(500).json({ success: false, error: '장바구니 추가 중 오류 발생' });
  }
});

module.exports = router;