const express = require('express');
const path = require('path');
const session = require('express-session'); // 세션 관리 추가

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 세션 설정 (로그인 상태 유지용)
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // HTTPS 사용시 true로 변경
}));

// 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 라우트 설정
const loginRoutes = require('./routes/v1/loginRoutes');
const userRoutes = require('./routes/v1/userRoutes');

app.use('/api/v1', loginRoutes);
app.use('/api/v1', userRoutes);

// 페이지 라우트
app.get('/', (req, res) => res.render('home'));
app.get('/login', (req, res) => res.render('login'));

// 404 처리
app.use((req, res) => {
  res.status(404).render('404');
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});












// 1. AI 이용해서 옷파는 사이트 

// 2.
























