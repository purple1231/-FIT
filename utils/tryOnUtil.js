const fetch = require('node-fetch');

const API_KEY   = '';
const BASE_URL  = 'https://api.fashn.ai/v1';
const NGROK_URL = 'https://<your-ngrok-subdomain>.ngrok.io'; // 절대경로 보정용

function ensureAbsoluteUrl(url) {
  return url.startsWith('http') ? url : NGROK_URL + url;
}

async function processTryOn(avatarUrl, clothingUrl, cartId, userId, type) {
  try {
    if (!type) throw new Error('❗ 옷 타입이 필요합니다 (tops, bottoms 등)');
    console.log('type!!!!!❗!!!❗!!!!!!!!❗!!!❗!!!:', type);
    const category        = type === 'pants' ? 'bottoms' : 'tops';
    const fullAvatarUrl   = ensureAbsoluteUrl(avatarUrl);
    const fullClothingUrl = ensureAbsoluteUrl(clothingUrl);

    /* ── 1. Fashn /run 호출 ──────────────────────────────── */
    const runRes = await fetch(`${BASE_URL}/run`, {
      method : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY.trim()}`
      },
      body: JSON.stringify({
        model_image  : fullAvatarUrl,
        garment_image: fullClothingUrl,
        category,
        mode: 'balanced'
      })
    });
    const runText = await runRes.text();
    let runData;
    try {
      runData = JSON.parse(runText);
    } catch (e) {
      console.error('❌ Try-On API에서 JSON이 아닌 응답:', runText.slice(0, 300));
      throw new Error('Try-On API에서 JSON이 아닌 응답을 받았습니다.');
    }
    if (!runRes.ok || !runData.id) throw new Error(runData.error || 'Try-On 실행 실패');

    const predictionId = runData.id;
    console.log('🚀 Prediction started, ID:', predictionId);

    /* ── 2. /status/:id 폴링 ─────────────────────────────── */
    let fashnOutput;
    for (let i = 0; i < 20; i++) {
      const stRes  = await fetch(`${BASE_URL}/status/${predictionId}`, {
        headers: { 'Authorization': `Bearer ${API_KEY.trim()}` }
      });
      const status = await stRes.json();

      if (status.status === 'completed') {
        fashnOutput = Array.isArray(status.output) ? status.output[0] : status.output;
        console.log('✅ 완성! Fashn URL:', fashnOutput);
        break;
      }
      if (['starting','in_queue','processing'].includes(status.status)) {
        console.log(`⌛ (${i+1}/20) 진행 중: ${status.status}`);
        await new Promise(r => setTimeout(r, 3000));
      } else {
        throw new Error(status.error || 'Prediction failed');
      }
    }

    if (!fashnOutput) throw new Error('Prediction timeout or failed');

    // 👉 Cloudinary 없이 Fashn URL 직접 반환
    return fashnOutput;
  } catch (error) {
    if (error.response) {
      console.error('Try-On API Error:', error.response.status, error.response.data);
      return res.status(error.response.status).json({
        error: 'API 요청 실패',
        details: error.response.data
      });
    }
    console.error('Try-On API Error:', error.message);
    res.status(500).json({ 
      error: '가상 피팅 실패',
      message: error.message 
    });
  }
}

module.exports = { processTryOn };
