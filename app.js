const express = require("express")
const path = require("path")
const session = require("express-session") // 세션 관리 추가
const db = require("./db/db")

const app = express()

// 미들웨어 설정
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
// 정적 파일 서빙 설정
app.use("/images", express.static(path.join(__dirname, "public/images")))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// 세션 설정 (로그인 상태 유지용)
app.use(
  session({
    secret: "your-secret-key", // 세션 암호화 키
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // HTTPS 사용시 true로 변경
      maxAge: 1000 * 60 * 60 * 24, // 24시간 유지
    },
  }),
)

// 뷰 엔진 설정
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

console.log("✅ cartRouter 라우트 등록 전")
const cartRouter = require("./routes/v1/cart")
app.use("/cart", cartRouter)
console.log("✅ cartRouter 라우트 등록 후")

// 라우트 설정
const loginRoutes = require("./routes/v1/loginRoutes")
const userRoutes = require("./routes/v1/userRoutes")
const tryonRoutes = require("./routes/v1/tryon")
const detailRouter = require("./routes/v1/detailRouter")
const gotoCartRouter = require("./routes/v1/gotoCartRouter") // 장바구니 라우트 추가
const clothRouter = require("./routes/v1/clothRouter")
const checkClothRouter = require("./routes/v1/checkCloth")
const paumentRouter = require("./routes/v1/paymentRouter") // 결제 라우트 추가
const endRouter = require("./routes/v1/endRouter") // 결제 완료 라우트 추가
const signupRouter = require("./routes/v1/signup")
const mypageRouter = require("./routes/v1/mypage") // 마이페이지 라우터 추가

console.log("✅ detailRouter:", detailRouter) // 확인용

app.use("/api/v1", tryonRoutes) // 가상 피팅 라우트 추가
app.use("/api/v1", loginRoutes)
app.use("/api/v1", userRoutes)
app.use("/api/v1", detailRouter)
app.use("/api/v1", gotoCartRouter) // 장바구니 라우트 추가
app.use("/api/v1", clothRouter)
app.use("/api/v1", checkClothRouter) // 옷 체크 라우트 추가
app.use("/api/v1", paumentRouter) // 결제 라우트 추가
app.use("/api/v1", endRouter) // 결제 완료 라우트 추가

app.use("/api/v1", signupRouter)
app.use("/mypage", mypageRouter) // 마이페이지 라우터 등록

// 장바구니 개수 조회 API 추가
app.get("/api/v1/cart-count", async (req, res) => {
  const userId = req.session.user?.id

  if (!userId) {
    return res.json({ count: 0 })
  }

  try {
    const [cartItems] = await db.execute("SELECT COUNT(*) AS count FROM cart WHERE user_id = ?", [userId])
    const cartCount = cartItems[0].count
    res.json({ count: cartCount })
  } catch (err) {
    console.error("Cart count error:", err)
    res.json({ count: 0 })
  }
})

// 페이지 라우트
app.get("/", (req, res) => res.render("test"))
app.get("/login", (req, res) => res.render("login"))
app.get("/test", (req, res) => res.render("test"))
app.get("/users", (req, res) => res.render("users"))
app.get("/apitest", (req, res) => res.render("apitest"))
app.get("/mainImsi", (req, res) => res.render("mainImsi"))

// 홈 페이지 렌더링
// 로그인된 사용자만 접근 가능
app.get("/home", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).send("로그인이 필요합니다")
    }

    const userId = req.session.user.id
    console.log("🔍 현재 사용자 ID:", userId) // 디버깅용

    // 사용자 정보 조회 (프로필 이미지 포함)
    const [userRows] = await db.execute("SELECT id, username, email, name, my_url FROM user WHERE id = ?", [userId])
    const user = userRows[0] || req.session.user

    // 장바구니 개수 조회 (기본값 설정)
    let cartCount = 0
    try {
      const [cartItems] = await db.execute("SELECT COUNT(*) AS count FROM cart WHERE user_id = ?", [userId])
      cartCount = cartItems[0]?.count || 0
      console.log("🛒 장바구니 개수:", cartCount) // 디버깅용
    } catch (cartError) {
      console.error("장바구니 개수 조회 오류:", cartError)
      cartCount = 0 // 에러 시 기본값
    }

    // 상품 목록 조회 (기본값 설정)
    let clothRows = []
    let recommended = []
    try {
      const [clothResult] = await db.query(
        `
        SELECT * FROM cloth
        WHERE id NOT IN (
          SELECT cloth_id FROM cart WHERE user_id = ?
        )
      `,
        [userId],
      )
      clothRows = clothResult || []

<<<<<<< HEAD
    // ✅ 상의 2개, 하의 2개 추천
    const shirts = clothRows.filter(item => item.type === 'shirt').slice(0, 2)
    const pants = clothRows.filter(item => item.type === 'pants').slice(0, 2)
    const recommended = [...shirts, ...pants]
=======
      // 랜덤 추천 2개 선택
      recommended = clothRows.sort(() => Math.random() - 0.5).slice(0, 2)
>>>>>>> 0fb379f2d2656bd393f8c48f914a85cd5e472128

      console.log("👕 상품 개수:", clothRows.length) // 디버깅용
      console.log("⭐ 추천 상품 개수:", recommended.length) // 디버깅용
    } catch (clothError) {
      console.error("상품 조회 오류:", clothError)
      clothRows = []
      recommended = []
    }

    res.render("home", {
      user: user,
      cartCount: cartCount, // 항상 숫자값 보장
      products: clothRows,
<<<<<<< HEAD
      recommended, // 🔥 4개 전달
=======
      recommended: recommended,
>>>>>>> 0fb379f2d2656bd393f8c48f914a85cd5e472128
    })
  } catch (error) {
    console.error("홈 렌더링 에러:", error.message)
    // 에러 시에도 기본값으로 렌더링
    res.render("home", {
      user: req.session.user || { username: "Guest" },
      cartCount: 0,
      products: [],
      recommended: [],
    })
  }
})

app.get("/signup", (req, res) => {
  res.render("signup", {
    title: "회원가입",
    shopName: "Fashion Store",
    cartCount: 0,
  })
})

// 404 처리
app.use((req, res) => {
  res.status(404).render("404")
})

// 서버 시작
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`)
})
