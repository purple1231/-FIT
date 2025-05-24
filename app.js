const path = require('path');
const express = require('express');
const app = express();
const userRoutes1 = require('./routes/v1/userRoutes');

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API 라우트
app.use('/api/v1', userRoutes1);

// 프론트 페이지 라우트
app.get('/', (req, res) => {
  res.redirect('/users');
});

app.get('/users', (req, res) => {
  res.render('users');
});

app.get('/login', (req,res) => {
  res.render('login')
})

app.get('/test', (req, res) => {
  res.render('test');
});



// 404 처리
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

app.listen(3000, () => {
  console.log('Express REST API 서버가 http://localhost:3000 에서 실행 중입니다.');
});












// 1. AI 이용해서 옷파는 사이트 

// 2.
























