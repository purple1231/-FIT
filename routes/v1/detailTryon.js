const express = require('express');
const router = express.Router();
const db = require('../../db/db');
const { processTryOn } = require('../../utils/tryOnUtil');

router.post('/tryon-preview', async (req, res) => {
  const { cloth_id, type, image_url } = req.body;
  const avatarUrl = req.session.user?.my_url;
  const user_id = req.session.user?.id;

  if (!type) {
    return res.status(400).json({ error: '옷 타입(type)이 필요합니다.' });
  }
  if (!cloth_id || !image_url) {
    return res.status(400).json({ error: 'cloth_id, image_url은 필수입니다.' });
  }
  if (!avatarUrl) {
    return res.status(400).json({ error: '아바타 이미지가 필요합니다.' });
  }

  try {
    const baseUrl = 'https://cdn.fashn.ai';
    const avatarUrlFull = avatarUrl.startsWith('http') ? avatarUrl : `${baseUrl}${avatarUrl}`;
    const clothingUrlFull = image_url.startsWith('http') ? image_url : `${baseUrl}${image_url}`;

    console.log('🎨 Try-On Preview 시작');
    console.log('아바타:', avatarUrlFull);
    console.log('의류 이미지:', clothingUrlFull);

    const tryonImagePath = await processTryOn(avatarUrlFull, clothingUrlFull, null, user_id, type);

    const imageUrl = typeof tryonImagePath === 'string' ? tryonImagePath : tryonImagePath?.image || '';

    console.log('✅ Try-On Preview 성공:', imageUrl);

    res.status(200).json({ success: true, image_url: imageUrl });
  } catch (err) {
    console.error('❌ Try-On Preview 실패:', err);
    res.status(500).json({ success: false, error: '가상 피팅 이미지 생성 실패' });
  }
});

module.exports = router;
