const express = require('express');
const router = express.Router();
const db = require('../../db/db');


const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');


// -------------------------------------------------
//  파일 업로드(실제 착샷) – public/uploads/reviews/ 에 저장
// -------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../public/uploads/reviews');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // 예: review_1719323999999.jpg
    const ext = path.extname(file.originalname);
    cb(null, 'review_' + Date.now() + ext);
  }
});
const upload = multer({ storage });





/* =========================================================
   1) 상세 페이지
   ========================================================= */

router.post('/detail', async (req, res) => {
    const itemId = req.body.itemId;
    console.log('✅ /api/v1/detail POST 요청 수신됨, itemId:', itemId);

    try {
        console.log('🔍 DB에 쿼리 보내는 중...');
        const [results] = await db.query('SELECT * FROM cloth WHERE id = ?', [itemId]);

        if (!results || results.length === 0) {
            console.log('❗️ 해당 ID의 상품 없음:', itemId);
            return res.status(404).send('상품을 찾을 수 없습니다.');
        }

        const item = results[0];
        const user = req.session.user || null;

        // 🔻 유저가 로그인된 경우에만 장바구니 개수 조회
        let cartCount = 0;
        let canReview = false; // 🆕 리뷰 작성 가능 여부
        let myTryonImage = null;
        let reviews = [];

        if (user && user.id) {
            // 장바구니 개수 조회
            const [cartItems] = await db.query(
                'SELECT COUNT(*) AS count FROM cart WHERE user_id = ?', [user.id]
            );
            cartCount = cartItems[0].count;






            // 백엔드에서 리뷰 불러오기
            const [fetchedReviews] = await db.query(
                `SELECT r.*, u.username 
                FROM review r
                JOIN user u ON r.user_name = u.username
                WHERE r.cloth_id = ?
                ORDER BY r.created_at DESC`, [itemId]
            );
            reviews = fetchedReviews;





            // 🆕 구매 여부 확인
            const [purchased] = await db.query(
                'SELECT * FROM alreadybought WHERE user_id = ? AND cloth_id = ?',
                [user.id, itemId]
            );
            if (purchased.length > 0) {
                canReview = true;

                // AI 착샷 불러오기 (리뷰 가능자에게만)
                const [aiImages] = await db.query(
                    'SELECT ai_cloth_url FROM cart WHERE user_id = ? AND cloth_id = ? AND ai_cloth_url IS NOT NULL ORDER BY added_at DESC LIMIT 1',
                    [user.id, itemId]
                );
                if (aiImages.length > 0) {
                    myTryonImage = aiImages[0].ai_cloth_url;
                }






            }
        }
        else{
            // 백엔드에서 리뷰 불러오기 로그아웃 되어있어도 해줘야제ㅔㅔㅔ
            const [fetchedReviews] = await db.query(
                `SELECT r.*, u.username 
                FROM review r
                JOIN user u ON r.user_name = u.username
                WHERE r.cloth_id = ?
                ORDER BY r.created_at DESC`, [itemId]
            );
            reviews = fetchedReviews;
        }

        console.log('🎯 상품 조회 성공:', item);
        console.log('🛒 장바구니 개수:', cartCount);
        console.log('✅ 리뷰 가능 여부:', canReview);

        res.render('detail', { item, user, cartCount, canReview, myTryonImage, reviews });
    } catch (err) {
        console.error('❌ DB 오류:', err);
        res.status(500).send('DB 오류 발생');
    }
});








/* =========================================================
   2) 리뷰 저장 POST  (ai_image_url 필수, real_image_url 선택)
   프론트에서 action="/api/v1/detail/review" 로 보내면 된다.
   ========================================================= */
router.post(
  '/review',
  upload.single('real_image'),      // <input type="file" name="real_image">
  async (req, res) => {
    try {
      const { cloth_id, user_id, rating, content, ai_image_url } = req.body;
      console.log('🔥 ai_image_url:', ai_image_url);

      // -------------- 유효성 체크 ----------------
      if (!cloth_id || !user_id) {
        return res.status(400).json({ error: 'cloth_id, user_id는 필수입니다.' });
      }
      if (!ai_image_url) {
        return res.status(400).json({ error: 'AI 착샷(ai_image_url)이 필요합니다.' });
      }
      // 사용자가 실제로 이 옷을 샀는지 한 번 더 체크(보안)
      const [purchased] = await db.query(
        'SELECT 1 FROM alreadybought WHERE user_id = ? AND cloth_id = ? LIMIT 1',
        [user_id, cloth_id]
      );
      if (purchased.length === 0) {
        return res.status(403).json({ error: '구매한 사용자만 리뷰를 남길 수 있습니다.' });
      }

      // -------------- DB 저장 -------------------
      const realImageUrl = req.file
        ? '/uploads/reviews/' + req.file.filename   // public 경로 기준
        : null;

      await db.query(
        `INSERT INTO review
         (cloth_id, user_name, rating, content, ai_image_url, real_image_url)
         VALUES (?,      (SELECT username FROM user WHERE id = ? LIMIT 1),
                 ?,       ?,       ?,              ?)`,
        [cloth_id, user_id, rating || null, content || null, ai_image_url, realImageUrl]
      );

      return res.redirect('back');   // 다시 상세 페이지로
    } catch (err) {
      console.error('리뷰 저장 오류:', err);
      res.status(500).json({ error: '리뷰 저장 중 서버 오류' });
    }
  }
);

















module.exports = router;
