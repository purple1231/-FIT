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
const { DateTime } = require("luxon"); // ⬅️ luxon을 최상단에서 import
const minmin = 99990; // 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)
// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)
// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)
// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)
// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)
// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)
// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)// 추천 간격 (분 단위)


app.get("/home", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).send("로그인이 필요합니다");
    }

    const userId = req.session.user.id;
    console.log("🔍 현재 사용자 ID:", userId);

    // 사용자 정보 조회
    const [userRows] = await db.execute(
      "SELECT id, username, email, name, my_url FROM user WHERE id = ?",
      [userId]
    );
    const user = userRows[0] || req.session.user;

    // 장바구니 개수 조회
    let cartCount = 0;
    try {
      const [cartItems] = await db.execute(
        "SELECT COUNT(*) AS count FROM cart WHERE user_id = ?",
        [userId]
      );
      cartCount = cartItems[0]?.count || 0;
      console.log("🛒 장바구니 개수:", cartCount);
    } catch (cartError) {
      console.error("장바구니 개수 조회 오류:", cartError);
    }

    // 상품 목록 조회
    let clothRows = [];
    try {
      const [clothResult] = await db.query(
        `SELECT * FROM cloth
         WHERE id NOT IN (
           SELECT cloth_id FROM cart WHERE user_id = ?
         )`,
        [userId]
      );
      clothRows = clothResult || [];
      console.log("👕 상품 개수:", clothRows.length);
    } catch (clothError) {
      console.error("상품 조회 오류:", clothError);
    }

    // 추천 로직
    let recommended = [];
    let ai_image = [];

    try {
      const [recommandRows] = await db.query(
        `SELECT * FROM recommand WHERE user_id = ? ORDER BY recommand_at DESC`,
        [userId]
      );

      let needsNewRecommendation = recommandRows.length < 2;

      if (!needsNewRecommendation) {
        const now = DateTime.now().setZone("Asia/Seoul");
        const nowTime = now.toFormat("HH:mm");
        const lastRecommandAt = recommandRows[0].recommand_at;

        const nowDateTime = DateTime.fromFormat(nowTime, "HH:mm", { zone: "Asia/Seoul" });
        const lastDateTime = DateTime.fromFormat(lastRecommandAt, "HH:mm", { zone: "Asia/Seoul" });

        if (nowDateTime.isValid && lastDateTime.isValid) {
          const diffMinutes = nowDateTime.diff(lastDateTime, "minutes").minutes;
          console.log(`🕓 추천 시간 차이: ${diffMinutes.toFixed(2)}분`);
          if (diffMinutes > minmin) {
            needsNewRecommendation = true;
          } else {
            console.log("🧊 기존 추천 유지");
          }
        } else {
          console.warn("❌ 시간 포맷 파싱 실패, 새 추천 강제 실행");
          needsNewRecommendation = true;
        }
      }

      if (needsNewRecommendation) {
        console.log("🔄 새 추천 생성 시작");

        const shuffledShirts = clothRows.filter(item => item.type === "shirt").sort(() => Math.random() - 0.5);
        const shuffledPants = clothRows.filter(item => item.type === "pants").sort(() => Math.random() - 0.5);

        const top1 = shuffledShirts[0];
        const top2 = shuffledShirts[1];
        const bot1 = shuffledPants[0];
        const bot2 = shuffledPants[1];

        console.log("👕 추천 상의:", top1, top2);
        console.log("👖 추천 하의:", bot1, bot2);

        await db.query("DELETE FROM recommand WHERE user_id = ?", [userId]);

        const currentTime = DateTime.now().setZone("Asia/Seoul").toFormat("HH:mm");

        await db.query(
          `INSERT INTO recommand (
            user_id, cloth_top_image_url, cloth_bot_image_url, recommand_at,
            top_id, bottom_id, top_price, bottom_price, top_name, bottom_name
          ) VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId, top1.image_url, bot1.image_url, currentTime,
            top1.id, bot1.id, top1.price, bot1.price, top1.name, bot1.name,

            userId, top2.image_url, bot2.image_url, currentTime,
            top2.id, bot2.id, top2.price, bot2.price, top2.name, bot2.name
          ]
        );

        recommended.push(top1, bot1, top2, bot2);
        console.log("✅ 추천 2개 새로 생성 완료:", [
          { top: top1.image_url, bot: bot1.image_url },
          { top: top2.image_url, bot: bot2.image_url }
        ]);
      } else {
        console.log("📦 recommand 테이블의 기존 추천 사용");

        recommandRows.slice(0, 2).forEach(row => {
          recommended.push(
            {
              id: row.top_id,
              type: "shirt",
              image_url: row.cloth_top_image_url,
              price: row.top_price,
              name: row.top_name
            },
            {
              id: row.bottom_id,
              type: "pants",
              image_url: row.cloth_bot_image_url,
              price: row.bottom_price,
              name: row.bottom_name
            }
          );

          if (row.ai_image_url) {
            ai_image.push(row.ai_image_url);
          }
        });

        console.log("🟢 추천 상품 불러오기 완료:", recommended);
        console.log("🎨 AI 이미지:", ai_image);
      }
    } catch (recommendErr) {
      console.error("추천 처리 오류:", recommendErr);
    }

    // 홈 렌더링
    res.render("home", {
      user,
      cartCount,
      products: clothRows,
      recommended,
      ai_image,
      session: req.session
    });
  } catch (error) {
    console.error("홈 렌더링 에러:", error.message);
    res.render("home", {
      user: req.session.user || { username: "Guest" },
      cartCount: 0,
      products: [],
      recommended: [],
      ai_image: [],
      session: req.session
    });
  }
});


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
