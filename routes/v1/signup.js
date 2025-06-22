const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const db = require("../../db/db") // DB 연결 설정

// images 폴더가 없으면 생성
const uploadDir = "public/images"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 파일 업로드 설정 - images 폴더로 변경
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/") // images 폴더로 변경
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("이미지 파일만 업로드 가능합니다."))
    }
  },
})

// POST /signup - 회원가입 처리
router.post("/signup", upload.single("profileImage"), async (req, res) => {
  console.log("✅ 회원가입 요청 받음:", req.body)

  try {
    const { email, username, name, phone, height, weight, password } = req.body

    // 필수 필드 검증
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "이메일, 아이디, 비밀번호는 필수입니다.",
      })
    }

    // 이메일 중복 체크
    const [emailCheck] = await db.execute("SELECT id FROM user WHERE email = ?", [email])

    if (emailCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: "이미 사용 중인 이메일입니다.",
      })
    }

    // 아이디 중복 체크
    const [usernameCheck] = await db.execute("SELECT id FROM user WHERE username = ?", [username])

    if (usernameCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: "이미 사용 중인 아이디입니다.",
      })
    }

    // 비밀번호 해싱
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // 프로필 이미지 URL 생성 - images 경로로 변경
    let profileImageUrl = null
    if (req.file) {
      profileImageUrl = `images/${req.file.filename}` // images/ 경로로 변경
    }

    // 사용자 생성 - height, weight 필드 추가
    const [result] = await db.execute(
      `
            INSERT INTO user (email, username, password, name, phone, height, weight, my_url, role, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'customer', NOW())
        `,
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

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "파일 크기는 5MB 이하여야 합니다.",
      })
    }

    res.status(500).json({
      success: false,
      message: "회원가입 중 오류가 발생했습니다.",
    })
  }
})

module.exports = router
