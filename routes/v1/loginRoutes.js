const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../../db/db');

// 로그인 처리
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. 사용자 존재 여부 확인
    const [users] = await db.query('SELECT * FROM user WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: '아이디 또는 비밀번호가 잘못되었습니다.'
      });
    }

    const user = users[0];
    
    // 2. 비밀번호 검증
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: '아이디 또는 비밀번호가 잘못되었습니다.'
      });
    }

    // 3. 로그인 성공
    res.json({ 
      success: true,
      message: '로그인 성공',
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({ 
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

module.exports = router;