const express = require('express');
const router = express.Router();
const db = require('../../db/db');
const { processTryOn } = require('../../utils/tryOnUtil');

// POST /api/v1/cartgo
router.post('/cartgo', async (req, res) => {
  console.log('시작');
  const { user_id, cloth_id, quantity, size, name, image_url, type } = req.body;
  const avatarUrl = req.session.user?.my_url;

  if (!type) {
    return res.status(400).json({ error: '옷 타입(type)이 필요합니다.' });
  }
  if (!user_id || !cloth_id || !size) {
    return res.status(400).json({ error: 'user_id, cloth_id, size는 필수입니다.' });
  }
  if (!avatarUrl || !image_url) {
    return res.status(400).json({ error: '아바타 이미지와 의류 이미지 URL이 필요합니다.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT * FROM cart WHERE user_id = ? AND cloth_id = ? AND size = ?`,
      [user_id, cloth_id, size]
    );

    if (rows.length > 0) {
      console.log('이미 장바구니에 존재하는 상품입니다.');
      return res.status(409).json({ error: '이미 장바구니에 존재하는 상품입니다.' });
    }

    const [result] = await db.query(
      `INSERT INTO cart (user_id, cloth_id, quantity, size, name, image_url, tryon_image)
       VALUES (?, ?, ?, ?, ?, ?, NULL)`,
      [user_id, cloth_id, quantity || 1, size, name || null, image_url]
    );

    const cartId = result.insertId;
    const baseUrl = 'https://cdn.fashn.ai'; // 배포용 base URL

    const avatarUrlFull = avatarUrl.startsWith('http') ? avatarUrl : `${baseUrl}${avatarUrl}`;
    const clothingUrlFull = image_url.startsWith('http') ? image_url : `${baseUrl}${image_url}`;

    console.log('avatarUrl:', avatarUrl);
    console.log('image_url:', image_url);

    processTryOn(avatarUrlFull, clothingUrlFull, cartId, user_id, type)
      .then(async (tryonImagePath) => {
        await db.query(`UPDATE cart SET ai_cloth_url = ? WHERE id = ?`, [tryonImagePath, cartId]);
        console.log(`🔄 가상 피팅 이미지 업데이트 완료 (Cart ID: ${cartId})`);

        try {
          const [recs] = await db.query(
            `SELECT id, cloth_top_image_url, cloth_bot_image_url, ai_image_url FROM recommand WHERE user_id = ?`,
            [user_id]
          );

          console.log(`📦 추천 레코드 ${recs.length}개 발견`);

          for (const rec of recs) {
            if (rec.ai_image_url) {
              console.log(`➡️ recommand ${rec.id}: ai_image_url 이미 존재 → 건너뜀`);
              continue;
            }

            const topUrl = rec.cloth_top_image_url.startsWith('http') ? rec.cloth_top_image_url : `${baseUrl}${rec.cloth_top_image_url}`;
            const botUrl = rec.cloth_bot_image_url.startsWith('http') ? rec.cloth_bot_image_url : `${baseUrl}${rec.cloth_bot_image_url}`;

            try {
              const topFitted = await processTryOn(avatarUrlFull, topUrl, null, user_id, 'shirt');
              const topFittedUrl = typeof topFitted === 'string' ? topFitted : topFitted?.image || '';
              console.log(`🔄 상의 가상 피팅 완료 (${rec.id}번째): ${topFittedUrl}`);

              const finalFitted = await processTryOn(topFittedUrl.startsWith('http') ? topFittedUrl : `${baseUrl}${topFittedUrl}`, botUrl, null, user_id, 'pants');
              const finalFittedUrl = typeof finalFitted === 'string' ? finalFitted : finalFitted?.image || '';
              console.log(`🔄 하의 가상 피팅 완료 (${rec.id}번째): ${topFittedUrl}`);

              await db.query(`UPDATE recommand SET ai_image_url = ? WHERE id = ?`, [finalFittedUrl, rec.id]);
              console.log(`✅ recommand ${rec.id} → ai_image_url 업데이트 완료`);
            } catch (fitErr) {
              console.error(`⚠️ recommand ${rec.id} 처리 중 오류:`, fitErr);
            }
          }

          console.log('✅✅✅✅✅✅ 모든 추천 이미지 생성 완료');
        } catch (recErr) {
          console.error('❌ 추천 이미지 생성 실패:', recErr);
        }
      })
      .catch(err => {
        console.error(`❌ 가상 피팅 처리 실패 (Cart ID: ${cartId}):`, err);
      });

    console.log('🛒 장바구니 추가 성공:', result);
    res.status(200).json({ success: true, message: '장바구니에 추가되었습니다. 가상 피팅 결과는 잠시 후 확인할 수 있습니다.' });
  } catch (err) {
    console.error('❌ 장바구니 추가 실패:', err);
    res.status(500).json({ success: false, error: '장바구니 추가 중 오류 발생' });
  }
});

module.exports = router;