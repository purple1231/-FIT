const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function processTryOn(avatarUrl, clothingUrl, cartId) {
  try {
    // 이미지 다운로드 함수
    const downloadImage = async (url, savePath) => {
      const response = await axios.get(url, { responseType: 'stream' });
      const writer = fs.createWriteStream(savePath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    };

    // 임시 디렉토리 생성
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 이미지 다운로드
    const avatarPath = path.join(tempDir, `avatar_${cartId}.jpg`);
    const clothingPath = path.join(tempDir, `clothing_${cartId}.jpg`);
    
    await downloadImage(avatarUrl, avatarPath);
    await downloadImage(clothingUrl, clothingPath);

    // API 요청 준비
    const form = new FormData();
    form.append('avatar_image', fs.createReadStream(avatarPath), {
      filename: `avatar_${cartId}.jpg`,
      contentType: 'image/jpeg'
    });
    
    form.append('clothing_image', fs.createReadStream(clothingPath), {
      filename: `clothing_${cartId}.jpg`,
      contentType: 'image/jpeg'
    });

    // API 호출
    const apiUrl = 'https://try-on-diffusion.p.rapidapi.com/try-on-file';
    const response = await axios.post(apiUrl, form, {
      headers: {
        ...form.getHeaders(),
        'X-RapidAPI-Key': 'd0d8c1c378msh37b6ef14ffd5e06p107260jsn92c6d5778a76',
        'X-RapidAPI-Host': 'try-on-diffusion.p.rapidapi.com'
      },
      responseType: 'arraybuffer'
    });

    // 결과 이미지 저장
    const aiDir = path.join(__dirname, '../public/images/ai');
    if (!fs.existsSync(aiDir)) {
      fs.mkdirSync(aiDir, { recursive: true });
    }

    const resultPath = path.join(aiDir, `tryon_${cartId}.png`);
    fs.writeFileSync(resultPath, response.data);

    return `/images/ai/tryon_${cartId}.png`;
  } catch (error) {
    console.error('Try-On processing error:', error);
    throw error;
  }
}

module.exports = { processTryOn };