const express = require('express');
const path = require('path');
const session = require('express-session'); // 세션 관리 추가

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// 정적 파일 서빙 설정
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 세션 설정 (로그인 상태 유지용)
app.use(session({
  secret: 'your-secret-key', // 세션 암호화 키
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // HTTPS 사용시 true로 변경
    maxAge: 1000 * 60 * 60 * 24 // 24시간 유지
  }
}));



// 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));




console.log("✅ cartRouter 라우트 등록 전");
const cartRouter = require("./routes/v1/cart");
app.use("/cart", cartRouter);
console.log("✅ cartRouter 라우트 등록 후");



// 라우트 설정
const loginRoutes = require('./routes/v1/loginRoutes');
const userRoutes = require('./routes/v1/userRoutes');
const tryonRoutes = require('./routes/v1/tryon');
const detailRouter = require('./routes/v1/detailRouter');
const gotoCartRouter = require('./routes/v1/gotoCartRouter'); // 장바구니 라우트 추가
const clothRouter = require('./routes/v1/clothRouter');
const checkClothRouter = require('./routes/v1/checkCloth');
const signupRouter = require('./routes/v1/signup');

console.log('✅ detailRouter:', detailRouter); // 확인용

app.use('/api/v1', tryonRoutes); // 가상 피팅 라우트 추가
app.use('/api/v1', loginRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', detailRouter);
app.use('/api/v1', gotoCartRouter); // 장바구니 라우트 추가
app.use('/api/v1', clothRouter);
app.use('/api/v1', checkClothRouter); // 옷 체크 라우트 추가
app.use('/api/v1', signupRouter);





// 페이지 라우트
app.get('/', (req, res) => res.render('test'));
app.get('/login', (req, res) => res.render('login'));
app.get('/test', (req, res) => res.render('test'));
app.get('/users', (req, res) => res.render('users'));
app.get('/apitest', (req, res) => res.render('apitest'));
app.get('/mainImsi', (req, res) => res.render('mainImsi'));

app.get('/home', (req, res) => {
  try {
    res.render('home'); // 또는: res.render('home', { user: {}, products: [] })
  } catch (error) {
    console.error('홈 렌더링 에러:', error.message);
    res.status(500).send('서버 렌더링 오류 발생');
  }
});

app.get('/signup', (req, res) => {
  res.render('signup', {
    title: '회원가입',
    shopName: 'Fashion Store',
    cartCount: 0
  });
});


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
























