const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../../db/db');

router.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // 이메일 중복 확인
    const [emailUsers] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    if (emailUsers.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: '이미 사용 중인 이메일입니다.'
      });
    }

    // 아이디 중복 확인
    const [nameUsers] = await db.query('SELECT * FROM user WHERE username = ?', [username]);
    if (nameUsers.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: '이미 사용 중인 이름입니다.'
      });
    }

    // 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    await db.query(
      'INSERT INTO user (email, username, password) VALUES (?, ?, ?)',
      [email, username, hashedPassword]
    );
    // 회원가입 성공 로그
    console.log('회원가입 성공:', {
      email: email,
      username: username
    });

    res.json({ 
      success: true,
      message: '회원가입이 완료되었습니다.'
    });

  } catch (error) {
    console.error('회원가입 에러:', error);
    res.status(500).json({ 
      success: false,
      message: '회원가입 처리 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;