const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const db = require("../../db/db")

// images 폴더가 없으면 생성
const uploadDir = "public/images"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/")
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

// GET /mypage - 마이페이지 렌더링
router.get("/", async (req, res) => {
  const userId = req.session.user?.id

  if (!userId) {
    return res.redirect("/login")
  }

  try {
    // 사용자 정보 조회
    const [userRows] = await db.execute(
      "SELECT id, username, email, name, phone, height, weight, address, my_url, created_at FROM user WHERE id = ?",
      [userId],
    )

    if (userRows.length === 0) {
      return res.redirect("/login")
    }

    const user = userRows[0]

    // 장바구니 개수 조회
    const [cartItems] = await db.execute("SELECT COUNT(*) AS count FROM cart WHERE user_id = ?", [userId])
    const cartCount = cartItems[0].count

    res.render("mypage", {
      title: "마이페이지",
      shopName: "Fashion Store",
      user: user,
      cartCount: cartCount,
    })
  } catch (err) {
    console.error("마이페이지 로드 오류:", err)
    res.status(500).send("페이지를 불러올 수 없습니다.")
  }
})

// POST /api/v1/update-profile - 프로필 업데이트
router.post("/api/v1/update-profile", upload.single("profileImage"), async (req, res) => {
  const userId = req.session.user?.id

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "로그인이 필요합니다.",
    })
  }

  try {
    const { name, phone, height, weight, address, currentPassword, newPassword } = req.body

    // 현재 사용자 정보 조회
    const [userRows] = await db.execute("SELECT password FROM user WHERE id = ?", [userId])

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
      })
    }

    const updateFields = []
    const updateValues = []

    // 기본 정보 업데이트
    if (name !== undefined) {
      updateFields.push("name = ?")
      updateValues.push(name || null)
    }
    if (phone !== undefined) {
      updateFields.push("phone = ?")
      updateValues.push(phone || null)
    }
    if (height !== undefined) {
      updateFields.push("height = ?")
      updateValues.push(height || null)
    }
    if (weight !== undefined) {
      updateFields.push("weight = ?")
      updateValues.push(weight || null)
    }
    if (address !== undefined) {
      updateFields.push("address = ?")
      updateValues.push(address || null)
    }

    // 프로필 이미지 업데이트
    if (req.file) {
      const profileImageUrl = `images/${req.file.filename}`
      updateFields.push("my_url = ?")
      updateValues.push(profileImageUrl)
    }

    // 비밀번호 변경
    if (newPassword && currentPassword) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userRows[0].password)

      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "현재 비밀번호가 올바르지 않습니다.",
        })
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "새 비밀번호는 8자 이상이어야 합니다.",
        })
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10)
      updateFields.push("password = ?")
      updateValues.push(hashedNewPassword)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "업데이트할 정보가 없습니다.",
      })
    }

    // 사용자 정보 업데이트
    updateValues.push(userId)
    const updateQuery = `UPDATE user SET ${updateFields.join(", ")} WHERE id = ?`

    await db.execute(updateQuery, updateValues)

    // 업데이트된 사용자 정보 조회
    const [updatedUserRows] = await db.execute(
      "SELECT id, username, email, name, phone, height, weight, address, my_url FROM user WHERE id = ?",
      [userId],
    )

    // 세션 업데이트
    req.session.user = {
      ...req.session.user,
      name: updatedUserRows[0].name,
      my_url: updatedUserRows[0].my_url,
    }

    res.json({
      success: true,
      message: "프로필이 성공적으로 업데이트되었습니다.",
      user: updatedUserRows[0],
    })
  } catch (error) {
    console.error("프로필 업데이트 오류:", error)

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "파일 크기는 5MB 이하여야 합니다.",
      })
    }

    res.status(500).json({
      success: false,
      message: "프로필 업데이트 중 오류가 발생했습니다.",
    })
  }
})

module.exports = router
