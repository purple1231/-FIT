const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../../db/db');

// 로그인 처리
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. 사용자 존재 여부 확인
    const [users] = await db.query('SELECT * FROM user WHERE email = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: '아이디가 잘못되었습니다.'
      });
    }

    const user = users[0];
    // 비밀번호는 bcrypt 해시로만 출력 (원본 비밀번호는 알 수 없음)
    console.log('로그인 시도:', {
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: user.password // 이미 bcrypt 해시된 값
    });
    console.log('입력된 비밀번호(bcrypt hash):', await bcrypt.hash(password, 10));

    
    // 2. 비밀번호 검증
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: '비밀번호가 잘못되었습니다.'
      });
    }

    // 3. 세션에 사용자 정보 저장
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      my_url: user.my_url,  // 추가된 부분
      loggedIn: true
    };
    // 세션 저장 후 로그로 확인
    console.log('세션에 저장된 사용자 정보:', req.session.user);

    // 4. 응답
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
      message: '네트워크 에러 발생, 잠시 후 다시 시도해주세요.'
    });
  }
});

module.exports = router;