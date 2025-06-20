const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// 이미지 저장 경로 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'), // public/uploads 폴더 사용
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)) // 파일명 중복 방지
});
const upload = multer({ storage });

// GET: 업로드 페이지 보여주기
router.get('/upload', (req, res) => {
  res.render('apitest2', { imageUrl: null }); // 너가 만든 ejs 파일 중 하나를 사용
});

// POST: 이미지 업로드 처리
router.post('/upload', upload.single('image'), (req, res) => {
  const imageUrl = '/uploads/' + req.file.filename; // public 기준 경로
  res.render('apitest2', { imageUrl }); // 업로드된 이미지 경로를 다시 렌더링
});

module.exports = router;
