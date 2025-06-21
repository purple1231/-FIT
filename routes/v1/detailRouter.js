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
        const user = req.session.user || null;

        // 🔻 유저가 로그인된 경우에만 장바구니 개수 조회
        let cartCount = 0;
        if (user && user.id) {
            const [cartItems] = await db.query('SELECT COUNT(*) AS count FROM cart WHERE user_id = ?', [user.id]);
            cartCount = cartItems[0].count;
        }

        console.log('🎯🎯🎯🎯 상품 조회 성공:', item);
        console.log('🛒🛒🛒 장바구니 개수:', cartCount);

        res.render('detail', { item, user, cartCount }); // cartCount 전달!
    } catch (err) {
        console.error('❌ DB 오류:', err);
        res.status(500).send('DB 오류 발생');
    }
});

module.exports = router;
