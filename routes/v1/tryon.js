const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

//API Key 설정
const RAPID_API_KEY = ""; 
const RAPID_API_HOST = "try-on-diffusion.p.rapidapi.com";

const upload = multer({ dest: 'uploads/' });

// Try-on API 엔드포인트
router.post('/tryon', upload.fields([
  { name: 'avatar_image', maxCount: 1 },
  { name: 'clothing_image', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Received files:', req.files);
    
    if (!req.files['avatar_image'] || !req.files['clothing_image']) {
      return res.status(400).json({ error: '필수 파일이 누락되었습니다.' });
    }

    const form = new FormData();
    
    // 파일 스트림 추가
    form.append('avatar_image', 
      fs.createReadStream(req.files['avatar_image'][0].path), 
      {
        filename: req.files['avatar_image'][0].originalname,
        contentType: req.files['avatar_image'][0].mimetype
      }
    );
    
    form.append('clothing_image', 
      fs.createReadStream(req.files['clothing_image'][0].path),
      {
        filename: req.files['clothing_image'][0].originalname,
        contentType: req.files['clothing_image'][0].mimetype
      }
    );

    const apiUrl = 'https://try-on-diffusion.p.rapidapi.com/try-on-file';
    
    const response = await axios.post(apiUrl, form, {
      headers: {
        ...form.getHeaders(),
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST,
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'arraybuffer',
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    // 성공 응답
    res.set('Content-Type', 'image/png');
    res.send(response.data);

  } catch (error) {
    console.error('Try-On API Error:', error.response?.data || error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'API 요청 실패',
        details: error.response.data
      });
    }
    
    res.status(500).json({ 
      error: '가상 피팅 실패',
      message: error.message 
    });
  } finally {
    // 임시 파일 정리
    if (req.files['avatar_image']) {
      fs.unlinkSync(req.files['avatar_image'][0].path);
    }
    if (req.files['clothing_image']) {
      fs.unlinkSync(req.files['clothing_image'][0].path);
    }
  }
});

module.exports = router;
