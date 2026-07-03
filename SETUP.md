# 📱 Hướng dẫn sử dụng App CheckIn

---

## 🚀 Cách khởi động app

Mở terminal (Command Prompt hoặc PowerShell), chạy 2 lệnh:

```bash
cd D:\mi\APP\CheckInApp
npx expo start --web --port 8083
```

Sau đó mở trình duyệt (Chrome/Edge) vào: **http://localhost:8083**

Để dừng: nhấn **Ctrl + C** trong terminal.

---

## 👤 1. Đăng ký tài khoản

1. Mở app → màn hình **Đăng Nhập** hiện ra
2. Nhấn **"Đăng ký ngay"** ở dưới cùng
3. Điền thông tin:
   - **Họ và tên** (bắt buộc)
   - **Email** (bắt buộc, dùng để đăng nhập)
   - **Số điện thoại** (không bắt buộc)
   - **Mật khẩu** (tối thiểu 6 ký tự)
   - **Xác nhận mật khẩu**
4. Nhấn **"Đăng Ký"** → tự động vào app

---

## 🔐 2. Đăng nhập / Đăng xuất

**Đăng nhập:**
- Nhập email và mật khẩu đã đăng ký → nhấn **"Đăng Nhập"**

**Đăng xuất:**
- Vào tab **👤 Tôi** → kéo xuống dưới cùng → nhấn **"🚪 Đăng xuất"**

---

## 📍 3. Tạo Check-in mới

1. Nhấn tab **� Check-in** ở thanh dưới
2. **Chụp hoặc chọn ảnh:**
   - Nhấn **"📷 Chụp ảnh"** để chụp bằng camera
   - Nhấn **"🖼️ Thư viện"** để chọn ảnh có sẵn
   - AI sẽ **tự động phân tích ảnh** → điền tên địa điểm, loại, tags, caption
3. **Lấy vị trí:** nhấn **"� Lấy vị trí"** → tự động lấy GPS và địa chỉ
4. **Xem trên Google Maps:** nhấn **"🗺️ Google Maps"** sau khi có vị trí
5. **Caption:** nhấn **"✨ AI gợi ý"** để AI viết caption → chọn 1 trong 3 gợi ý
6. **Chọn cảm xúc:** nhấn vào emoji phù hợp
7. Nhấn **"📍 Check-in ngay!"** để lưu

---

## 🏠 4. Xem Feed (Khám phá)

- Tab **🏠 Khám phá**: xem tất cả check-in của mọi người
- Nhấn vào 1 thẻ check-in để xem chi tiết
- Trong chi tiết có thể:
  - Nhấn **"🗺️ Xem trên Maps"** → mở Google Maps
  - Nhấn **"🧭 Chỉ đường"** → Google Maps dẫn đường đến nơi
  - Nhấn **"📤"** → chia sẻ check-in
  - Nhấn **"🗑️ Xóa"** → xóa (chỉ check-in của mình)

---

## 🤖 5. Chat với AI

1. Nhấn tab **🤖 AI Chat**
2. Nhấn nhanh vào các gợi ý có sẵn hoặc tự nhập câu hỏi
3. AI có thể giúp:
   - Gợi ý quán ăn, cà phê, địa điểm du lịch
   - Viết caption check-in
   - Tư vấn địa điểm cuối tuần

---

## 👤 6. Hồ sơ cá nhân

Tab **👤 Tôi** gồm:

| Mục | Chức năng |
|---|---|
| Ảnh đại diện | Nhấn vào ảnh → chọn ảnh mới từ thư viện |
| Thống kê | Xem số check-in, địa điểm, tháng này |
| 🤖 Tóm tắt AI | Nhấn "✨ Tạo" → AI tóm tắt hành trình của bạn |
| ✏️ Sửa | Chỉnh sửa tên và số điện thoại |
| Check-in của tôi | Xem lại các check-in đã tạo |

---

## 🔑 7. Kích hoạt AI (bắt buộc để dùng AI)

1. Vào https://aistudio.google.com/app/apikey
2. Đăng nhập Google → nhấn **"Create API Key"** → Copy key
3. Mở file `src/services/geminiService.js` dòng 5:
```js
const API_KEY = 'AIzaSy...dán_key_của_bạn_vào_đây';
```
4. Lưu file → app tự reload

> Gemini API **miễn phí** cho 1500 request/ngày — dùng thoải mái!

---

## ❓ Lỗi thường gặp

| Lỗi | Cách xử lý |
|---|---|
| Trang trắng khi mở | Đợi 5-10 giây để bundle xong |
| AI không phản hồi | Kiểm tra API key đã điền chưa |
| Không lấy được vị trí | Cho phép truy cập vị trí trong browser |
| Port bị chiếm | Đổi `--port 8083` thành `--port 8084` |
