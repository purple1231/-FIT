const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function processTryOn(avatarUrl, clothingUrl, cartId, userId) {
  try {
    const downloadImage = async (url, savePath) => {
      const response = await axios.get(url, { responseType: 'stream' });
      const writer = fs.createWriteStream(savePath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    };

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const avatarPath = path.join(tempDir, `avatar_u${userId}_c${cartId}.jpg`);
    const clothingPath = path.join(tempDir, `clothing_u${userId}_c${cartId}.jpg`);

    await downloadImage(avatarUrl, avatarPath);
    await downloadImage(clothingUrl, clothingPath);

    const form = new FormData();
    form.append('avatar_image', fs.createReadStream(avatarPath), {
      filename: `avatar_u${userId}_c${cartId}.jpg`,
      contentType: 'image/jpeg'
    });

    form.append('clothing_image', fs.createReadStream(clothingPath), {
      filename: `clothing_u${userId}_c${cartId}.jpg`,
      contentType: 'image/jpeg'
    });

    const apiUrl = 'https://try-on-diffusion.p.rapidapi.com/try-on-file';
    const response = await axios.post(apiUrl, form, {
      headers: {
        ...form.getHeaders(),
        'X-RapidAPI-Key': 'd0d8c1c378msh37b6ef14ffd5e06p107260jsn92c6d5778a76',
        'X-RapidAPI-Host': 'try-on-diffusion.p.rapidapi.com'
      },
      responseType: 'arraybuffer'
    });

    const aiDir = path.join(__dirname, '../public/images/ai');
    if (!fs.existsSync(aiDir)) {
      fs.mkdirSync(aiDir, { recursive: true });
    }

    const resultFileName = `tryon_u${userId}_c${cartId}.png`;
    const resultPath = path.join(aiDir, resultFileName);
    fs.writeFileSync(resultPath, response.data);

    return `/images/ai/${resultFileName}`;
  } catch (error) {
    console.error('Try-On processing error:', error);
    throw error;
  }
}


module.exports = { processTryOn };