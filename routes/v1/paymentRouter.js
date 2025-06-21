const express = require('express');
const router = express.Router();

// POST /payment
router.post('/payment', (req, res) => {
    try {
        const items = JSON.parse(req.body.itemsJson);
        const user = req.session.user; // 세션에 있는 로그인 유저 정보 불러오기

        if (!user) {
            return res.status(401).send('로그인 필요');
        }

        res.render('payment', { items, user });
    } catch (error) {
        console.error('결제 페이지 렌더링 실패:', error);
        res.status(400).send('결제 정보를 불러오는 중 오류 발생');
    }
});

module.exports = router;