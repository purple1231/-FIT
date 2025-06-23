const express = require('express');
const router = express.Router();
const db = require('../../db/db');

router.post('/end', async (req, res) => {
    try {
        const user = req.session.user;

        if (!user) {
            return res.status(401).send('로그인이 필요합니다.');
        }

        const items = JSON.parse(req.body.itemsJson);
        if (!items || items.length === 0) {
            return res.status(400).send('구매할 아이템이 없습니다.');
        }

        console.log('🛒 구매할 아이템들:', items);

        for (const item of items) {
            // 이름으로 cloth_id 찾아오기
            const [rows] = await db.query(
                'SELECT id FROM cloth WHERE name = ? LIMIT 1',
                [item.name]
            );

            if (rows.length === 0) {
                console.warn(`❌ cloth 테이블에 '${item.name}'에 해당하는 상품이 없습니다.`);
                continue;
            }

            const clothId = rows[0].id;

            // alreadybought 테이블에 저장
            await db.query(
                'INSERT INTO alreadybought (user_id, user_name, cloth_id) VALUES (?, ?, ?)',
                [user.id, user.username, clothId]
            );
        }


        // 장바구니 비우기
        await db.query('UPDATE cart SET already = 1 WHERE user_id = ?', [user.id]);

        res.render('end'); // 결제 완료 페이지 렌더링
    } catch (err) {
        console.error('❌ /end 처리 중 오류:', err);
        res.status(500).send('서버 오류');
    }
});

module.exports = router;
