<div align="center">

# ⚡ Hải Anh AI Studio — Web Chat AI

### *Ứng dụng Web Chat AI phong cách B2B SaaS Minimalism & Bento Grid*

[![Author](https://img.shields.io/badge/Author-Nguyễn%20Hải%20Anh-blue?style=flat-square&logo=github)](https://github.com/nguyen-hai-anh06)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.0+-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br/>

<img src="static/background_author.png" width="130" height="130" style="border-radius: 50%; border: 3px solid #E2E8F0; object-fit: cover;" alt="Tác giả Nguyễn Hải Anh" />

**Tác giả: Nguyễn Hải Anh** • [GitHub: @nguyen-hai-anh06](https://github.com/nguyen-hai-anh06)

</div>

---

## 📖 Giới thiệu (Overview)

**Hải Anh AI Studio** là một ứng dụng Web Chat AI hoàn chỉnh được phát triển bởi **Nguyễn Hải Anh**, ứng dụng triệt để bộ quy chuẩn thiết kế **UI/UX Pro Max** theo trường phái **Minimalism** và **Bento Grid** của các ứng dụng B2B SaaS hiện đại hàng đầu như *Linear*, *Notion*, và *Raycast*.

Hệ thống kết nối trực tiếp với **Google Gemini API** qua cơ chế truyền phát dữ liệu thời gian thực **Server-Sent Events (SSE)** cùng chuỗi tự động phục hồi mô hình (Fallback Chain), đảm bảo tốc độ phản hồi nhanh, mượt mà và không gián đoạn.

---

## ✨ Điểm nổi bật & Tính năng (Key Features)

### 🎨 1. Thiết kế UI/UX Chuẩn B2B SaaS
* **Phong cách Light Mode:** Sử dụng bảng màu sáng trang nhã (`#F8F9FA`), viền mảnh tinh tế (`#E2E8F0`) và bóng đổ mềm mại (`shadow-xs` / `shadow-sm`) tạo chiều sâu tự nhiên.
* **Tuân thủ Anti-patterns:**
  * ❌ Tuyệt đối **KHÔNG** sử dụng Dark Mode.
  * ❌ Tuyệt đối **KHÔNG** dùng hiệu ứng kính mờ (Glassmorphism / `backdrop-filter`).
  * ❌ Tuyệt đối **KHÔNG** dùng dải màu gradient tím/hồng neon.
* **Bento Grid Layout:** Bố cục chia thẻ kiểu Bento thông minh:
  * Thẻ Profile tác giả Nguyễn Hải Anh với huy hiệu xác thực.
  * 4 Thẻ Bento truy cập tính năng nhanh (Lập trình, UI/UX, Soạn thảo văn bản, Phân tích).
  * 4 Thẻ Bento gợi ý câu hỏi mẫu khi bắt đầu cuộc trò chuyện.
* **Ảnh nền thương hiệu tác giả:** Hình ảnh tác giả được tích hợp khéo léo làm nền chìm watermark với thanh trượt tùy chỉnh độ đậm nhạt linh hoạt (0% - 25%).

### 🤖 2. Trải nghiệm Chat & Trí tuệ nhân tạo (AI UX)
* **Real-time SSE Streaming:** Phản hồi từ Gemini AI xuất hiện từng ký tự mượt mà theo thời gian thực.
* **Model Fallback Chain:** Tự động chuyển đổi giữa `gemini-3.5-flash-lite` ➔ `gemini-3.1-flash-lite` ➔ `gemini-3.8-flash` để hạn chế tối đa lỗi 503 khi server AI quá tải.
* **Render Markdown cao cấp:**
  * Hỗ trợ đầy đủ văn bản định dạng (đậm, nghiêng, danh sách, bảng dữ liệu, trích dẫn).
  * **Code Blocks chuyên nghiệp:** Tự động nhận diện ngôn ngữ lập trình, tô màu cú pháp (GitHub Light theme) và nút **Sao chép (Copy)** 1-click kèm trạng thái thông báo *"Đã sao chép! ✓"*.
* **Phân biệt trực quan:** Khung chat người dùng (thẻ Slate đậm thanh lịch bên phải) và câu trả lời AI (thẻ Bento trắng viền mỏng bên trái kèm huy hiệu Gemini).

### 🛠️ 3. Tiện ích & Phím tắt
* **Phím tắt nhập liệu:** Nhấn `Enter` để gửi tin nhắn, `Shift + Enter` để xuống dòng.
* **Xuất cuộc trò chuyện (Export Chat):** Tải toàn bộ nội dung hội thoại thành file định dạng Markdown (`.md`).
* **Làm mới phiên trò chuyện (New Chat):** Khởi tạo hội thoại mới chỉ với 1 thao tác.

---

## 📂 Cấu trúc thư mục (Project Structure)

```text
chat_app/
│
├── main.py                  # Backend FastAPI server & tích hợp Google GenAI SDK
├── requirements.txt         # Danh sách thư viện Python cần thiết
├── .env.example             # Mẫu cấu hình biến môi trường
├── .gitignore               # Tệp loại trừ tệp nhạy cảm (bảo vệ API Key)
├── README.md                # Tài liệu hướng dẫn dự án
│
└── static/                  # Frontend Single-Page Application
    ├── index.html           # Bố cục giao diện Bento Grid & Minimalism
    ├── style.css            # Hệ thống Design Tokens CSS tùy biến
    ├── app.js               # Logic điều khiển, SSE streaming & Markdown rendering
    └── background_author.png# Ảnh tác giả Nguyễn Hải Anh (Avatar & Background)
```

---

## 🚀 Hướng dẫn cài đặt & Chạy ứng dụng (Quick Start)

### 1. Yêu cầu hệ thống
* Python 3.10 trở lên.
* API Key Google Gemini (Nhận miễn phí tại [Google AI Studio](https://aistudio.google.com/)).

### 2. Clone mã nguồn
```bash
git clone https://github.com/nguyen-hai-anh06/chat_app.git
cd chat_app
```

### 3. Cài đặt môi trường ảo & Thư viện
```bash
# Tạo môi trường ảo (khuyến nghị)
python -m venv venv

# Kích hoạt môi trường ảo:
# Trên Windows:
venv\Scripts\activate
# Trên macOS / Linux:
source venv/bin/activate

# Cài đặt các gói phụ thuộc
pip install -r requirements.txt
```

### 4. Thiết lập API Key
Sao chép tệp `.env.example` thành `.env`:
```bash
cp .env.example .env
```
Mở tệp `.env` và điền khóa API của bạn:
```env
GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
```

### 5. Khởi động Web Server
Chạy máy chủ FastAPI bằng lệnh:
```bash
python main.py
```
Hoặc sử dụng `uvicorn`:
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Sau khi khởi chạy thành công, mở trình duyệt và truy cập:
👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 📡 Tài liệu API (Endpoints)

| Phương thức | Đường dẫn | Chức năng |
|---|---|---|
| `GET` | `/` | Trả về giao diện Web Chat chính |
| `POST` | `/api/chat/stream` | Gửi tin nhắn và nhận phản hồi trực tiếp (SSE Stream) |
| `POST` | `/api/chat` | Gửi tin nhắn và nhận kết quả JSON đồng bộ |
| `POST` | `/api/reset` | Đặt lại lịch sử trò chuyện của session |
| `GET` | `/api/health` | Kiểm tra tình trạng hoạt động và danh sách mô hình AI |
| `GET` | `/api/author` | Trả về thông tin tác giả Nguyễn Hải Anh |

---

## 👤 Tác giả (Author)

* **Nguyễn Hải Anh**
* GitHub: [@nguyen-hai-anh06](https://github.com/nguyen-hai-anh06)
* Email: nghaianh2407@gmail.com
* Trường: Đại học Giao thông Vận tải TP.HCM (University of Transport and Communications - HCMC)

---

## 📄 Bản quyền (License)

Dự án được phân phối dưới giấy phép **MIT License**. Bạn hoàn toàn có thể tự do tham khảo, học tập và phát triển thêm.
