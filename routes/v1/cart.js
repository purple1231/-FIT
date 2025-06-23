const express = require("express")
const router = express.Router()
const db = require("../../db/db") // DB 연결 설정

// GET /cart - 장바구니 페이지 렌더링
router.get("/", async (req, res) => {
  const userId = req.session.user?.id

  if (!userId) {
    return res.redirect("/login")
  }

  try {
    const [cartRows] = await db.execute(
      `
        SELECT c.id AS cart_id, c.quantity, c.ai_cloth_url, cl.name, cl.price, cl.image_url
        FROM cart c
        LEFT JOIN cloth cl ON c.cloth_id = cl.id
        WHERE c.user_id = ? AND c.already != 1
      `,
      [userId],
    )

    const cartItems = cartRows.map((item) => ({
      id: item.cart_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image_url, // 기본 이미지는 항상 cloth 테이블의 image_url
      ai_image: item.ai_cloth_url, // AI 이미지는 별도로 전달
    }))

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal > 100000 ? 0 : 3000 // 예시: 10만원 이상 무료배송
    const discount = subtotal > 200000 ? 10000 : 0 // 예시: 20만원 이상 1만원 할인
    const total = subtotal + shipping - discount

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

    res.render("cart", {
      title: "장바구니",
      shopName: "My Fit Shop",
      cartItems,
      summary: { subtotal, shipping, discount, total },
      cartCount,
      formatPrice: (value) => Number(value).toLocaleString(),
    })
  } catch (err) {
    console.error("Cart error:", err)
    res.status(500).send("장바구니를 불러오지 못했습니다.")
  }
})

// PUT /cart/update/:id - 장바구니 수량 수정
router.put("/update/:id", async (req, res) => {
  const userId = req.session.user?.id
  const cartId = req.params.id
  const { quantity } = req.body

  if (!userId) return res.status(401).send("로그인이 필요합니다.")

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).send("잘못된 수량입니다.")
  }

  try {
    const [result] = await db.execute(`UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?`, [
      quantity,
      cartId,
      userId,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).send("장바구니 항목을 찾을 수 없습니다.")
    }

    res.sendStatus(200)
  } catch (err) {
    console.error("Quantity update error:", err)
    res.status(500).send("수량 업데이트 실패")
  }
})

// DELETE /cart/remove/:id - 장바구니 상품 삭제
router.delete("/remove/:id", async (req, res) => {
  const userId = req.session.user?.id
  const cartId = req.params.id

  if (!userId) return res.status(401).send("로그인이 필요합니다.")

  try {
    const [result] = await db.execute(`DELETE FROM cart WHERE id = ? AND user_id = ?`, [cartId, userId])

    if (result.affectedRows === 0) {
      return res.status(404).send("삭제할 상품을 찾을 수 없습니다.")
    }

    res.sendStatus(200)
  } catch (err) {
    console.error("Remove item error:", err)
    res.status(500).send("상품 삭제 실패")
  }
})

module.exports = router
