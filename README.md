# Fit (AI Virtual Try-On Service)

## 사용자의 아바타 이미지와 의류 이미지를 AI로 합성하여 실시간 가상 피팅을 제공하는 프로젝트 입니다.

------

# 🛠 Tech Stack

Frontend
 * Engine: EJS (Embedded JavaScript templates)
 * Styling: CSS3, HTML5

Backend
 * Runtime: Node.js
 * Framework: Express.js

Database & Media
 * Database: MySQL (mysql2/promise)
 * Cloud Storage: Cloudinary (Profile Image Hosting)
 * API: Fashn.ai API (AI Try-On), RapidAPI

------

# 📂 Project Structure
```
├── app.js                # 서버 엔트리 포인트
├── db
│    └── db.js            # MySQL Connection Pool 설정
├── routes
│    └── v1               # API 및 페이지 라우터
│         ├── login.js    # 로그인/회원가입 로직
│         ├── cart.js     # 장바구니 관리 (AI 피팅 결과 반영)
│         ├── detail.js   # 상품 상세 및 리뷰 시스템
│         ├── mypage.js   # 사용자 프로필 관리 (Cloudinary 연동)
│         └── tryon.js    # AI 가상 피팅 API 통신 로직
├── utils
│    └── tryOnUtil.js     # Fashn.ai API Polling 유틸리티
├── public
│    ├── uploads          # 로컬 이미지 업로드 경로
│    └── css              # 스타일시트
└── views                 # EJS 템플릿 파일 (.ejs)
```
------

# 🖥 페이지별 상세 기능 (Page Features)

1. 회원가입 및 로그인 (Signup & Login)
   - Bcrypt 암호화: 보안을 위해 사용자 비밀번호를 해싱하여 DB에 저장합니다.
   - 프로필 업로드: 회원가입 시 Multer와 Cloudinary를 연동하여 사용자의 아바타 이미지를 클라우드에 저장하고 관리합니다.

3. 상품 상세 페이지 (Product Detail)
   - 리뷰 시스템: 구매 확정된 사용자만 리뷰를 작성할 수 있으며, AI 가상 피팅 이미지와 실제 착용 사진을 함께 업로드할 수 있습니다.
   - 평점 계산: DB의 리뷰 데이터를 분석하여 상품별 평균 평점을 실시간으로 계산하여 시각화합니다.

4. 장바구니 및 가상 피팅 (Cart & AI Try-On)
   - 실시간 가상 피팅: 장바구니 담기 시 사용자의 아바타와 옷 이미지를 합성하는 AI 요청이 발생합니다.
   - 비동기 상태 업데이트: 가상 피팅이 완료되면 ai_cloth_url 필드를 업데이트하여 장바구니 페이지에서 합성 결과를 즉시 확인할 수 있습니다.
   - 주문 요약: 합계 금액, 배송비, 할인 혜택 등을 자동으로 계산하여 결제 금액을 산출합니다.

5. 마이페이지 (My Page)
   - 개인화 데이터 관리: 사용자의 키, 몸무게 등 신체 정보를 수정하여 더 정확한 AI 피팅 결과를 얻을 수 있도록 관리합니다.
   - 프로필 이미지 변경: Cloudinary API를 통해 실시간으로 프로필 이미지를 교체하고 반영합니다.

6. 결제 및 주문 완료 (Payment & Order)
   - 구매 이력 관리: 결제 완료 시 해당 상품을 alreadybought 테이블로 이동시켜 리뷰 작성 권한을 부여하고 장바구니를 비웁니다.






