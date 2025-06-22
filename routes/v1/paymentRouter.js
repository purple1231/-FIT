const express = require('express');
const router = express.Router();
const db = require('../../db/db');


// POST /payment
router.post('/payment', (req, res) => {
    try {
        const items = JSON.parse(req.body.itemsJson);
        const user = req.session.user; // 세션에서 유저 정보 불러오기

        if (!user) {
            return res.status(401).send('로그인이 필요합니다.');
        }

        // 🔸 총 결제 금액 계산 (수량 * 가격 합산)
        const totalPrice = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        // 🔸 payment.ejs로 데이터 전달
        res.render('payment', { items, user, totalPrice });
    } catch (error) {
        console.error('❌ 결제 페이지 렌더링 실패:', error);
        res.status(400).send('결제 정보를 불러오는 중 오류 발생');
    }
});

module.exports = router;
