const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const db = require("../../db/db")
const multer = require("multer")
const { v2: cloudinary } = require("cloudinary")
const { CloudinaryStorage } = require("multer-storage-cloudinary")

// 🔧 Cloudinary 설정
cloudinary.config({
  cloud_name: 'dplzmk1ex',
  api_key: '',
  api_secret: '' // 실사용 시 .env에 넣는 걸 권장
})

// 📁 Cloudinary 저장소 설정
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profileImages', // Cloudinary에서 저장될 폴더 이름
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    public_id: (req, file) => `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}`
  },
})

const upload = multer({ storage })

// POST /signup - 회원가입 처리
router.post("/signup", upload.single("profileImage"), async (req, res) => {
  console.log("✅ 회원가입 요청 받음:", req.body)

  try {
    const { email, username, name, phone, height, weight, password } = req.body

    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "이메일, 아이디, 비밀번호는 필수입니다.",
      })
    }

    const [emailCheck] = await db.execute("SELECT id FROM user WHERE email = ?", [email])
    if (emailCheck.length > 0) {
      return res.status(400).json({ success: false, message: "이미 사용 중인 이메일입니다." })
    }

    const [usernameCheck] = await db.execute("SELECT id FROM user WHERE username = ?", [username])
    if (usernameCheck.length > 0) {
      return res.status(400).json({ success: false, message: "이미 사용 중인 아이디입니다." })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // ✅ 프로필 이미지 Cloudinary URL 저장
    let profileImageUrl = null
    if (req.file && req.file.path) {
      profileImageUrl = req.file.path // Cloudinary에서 제공하는 URL
    }

    const [result] = await db.execute(
      `INSERT INTO user (email, username, password, name, phone, height, weight, my_url, role, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'customer', NOW())`,
      [email, username, hashedPassword, name || null, phone || null, height || null, weight || null, profileImageUrl],
    )

    console.log("✅ 회원가입 성공:", result.insertId)

    res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      userId: result.insertId,
    })
  } catch (error) {
    console.error("❌ 회원가입 오류:", error)

    res.status(500).json({
      success: false,
      message: "회원가입 중 오류가 발생했습니다.",
    })
  }
})

module.exports = router
