# OCR POC - PDF to Text Extraction

Giải pháp POC cho việc chuyển đổi PDF thành text sử dụng VLM (Vision Language Model) của FPT.AI.

## 🎯 Tính năng

- ✅ Upload file PDF từ giao diện web hiện đại
- ✅ Tự động chuyển đổi từng trang PDF thành ảnh
- ✅ Gọi FPT.AI VLM API để trích xuất text từ mỗi ảnh
- ✅ Hiển thị kết quả markdown với preview đẹp mắt
- ✅ Giao diện responsive với Ant Design

## 🏗️ Cấu trúc Project

```
poc/
├── backend/              # Python FastAPI Backend
│   ├── main.py          # API endpoints
│   ├── requirements.txt # Python dependencies
│   └── uploads/         # Temporary PDF storage
│
├── frontend/            # React Frontend
│   ├── src/
│   │   ├── App.jsx      # Main component
│   │   ├── App.css      # Styling
│   │   └── main.jsx     # Entry point
│   ├── index.html       # HTML template
│   ├── package.json     # Node dependencies
│   └── vite.config.js   # Vite configuration
│
└── README.md           # This file
```

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PyMuPDF (fitz)** - PDF to image conversion
- **requests** - HTTP client for VLM API
- **Python 3.8+**

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Ant Design 5** - UI component library
- **@uiw/react-markdown-preview** - Markdown rendering
- **axios** - HTTP client

## 🚀 Cài đặt và Chạy

### Bước 1: Cài đặt Backend

```bash
# Di chuyển vào folder backend
cd poc/backend

# Cài đặt Python dependencies
pip install -r requirements.txt
```

### Bước 2: Chạy Backend

```bash
# Chạy từ folder backend/
python main.py
```

Backend sẽ chạy tại: `http://localhost:8000`

Bạn có thể test backend bằng cách truy cập: `http://localhost:8000`

### Bước 3: Cài đặt Frontend

Mở terminal mới:

```bash
# Di chuyển vào folder frontend
cd poc/frontend

# Cài đặt Node dependencies
npm install
# hoặc
yarn install
```

### Bước 4: Chạy Frontend

```bash
# Chạy từ folder frontend/
npm run dev
# hoặc
yarn dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

## 📖 Cách sử dụng

1. **Mở trình duyệt** và truy cập `http://localhost:3000`
2. **Upload PDF**: Click hoặc drag & drop file PDF vào khu vực upload
3. **Convert**: Click nút "Convert" ở giữa màn hình
4. **Đợi xử lý**: Hệ thống sẽ xử lý từng trang (hiển thị loading spinner)
5. **Xem kết quả**: Dữ liệu extracted sẽ hiển thị ở panel bên phải với format markdown
6. **Approve**: Click "Approve" nếu kết quả OK

## 🔌 API Endpoints

### POST `/api/convert`

Upload PDF và nhận kết quả OCR.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (PDF file)

**Response:**
```json
{
    "success": true,
    "total_pages": 2,
    "results": [
        {
            "page": 1,
            "content": "... markdown text ..."
        },
        {
            "page": 2,
            "content": "... markdown text ..."
        }
    ]
}
```

**Error Response:**
```json
{
    "detail": "Error message"
}
```

## 🎨 Screenshots & Wireframe

Giao diện được thiết kế theo wireframe với:
- **Bên trái**: PDF Viewer với drag & drop upload
- **Giữa**: Convert button
- **Bên phải**: Extracted Data với markdown preview
- **Footer**: Approve button

## ⚙️ Configuration

### Backend Configuration

File: `backend/main.py`

```python
VLM_API_URL = "https://mkp-api.fptcloud.com/v1/chat/completions"
VLM_API_KEY = "sk-gojYePiQueqAHdllper3UA"
```

### Frontend Configuration

File: `frontend/vite.config.js`

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

## 🐛 Troubleshooting

### Backend không chạy được

```bash
# Check Python version
python --version  # Cần >= 3.8

# Cài lại dependencies
pip install -r requirements.txt --upgrade
```

### Frontend không chạy được

```bash
# Xóa node_modules và cài lại
rm -rf node_modules
npm install

# Hoặc dùng yarn
rm -rf node_modules
yarn install
```

### Lỗi CORS

Đảm bảo backend đã enable CORS (đã config sẵn trong `main.py`):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Lỗi kết nối API

1. Kiểm tra backend đang chạy: `http://localhost:8000`
2. Kiểm tra frontend proxy config trong `vite.config.js`
3. Xem console log trong browser (F12)

## 📝 Notes

- API Key của VLM đã được hardcode trong `backend/main.py`
- File PDF sẽ được xóa sau khi xử lý xong
- Timeout cho mỗi API call là 60 giây (backend) và 120 giây (frontend)
- Max tokens cho VLM response là 1024
- Resolution của image khi convert từ PDF là 2x (matrix 2,2)

## 🔄 Development

### Build Frontend cho Production

```bash
cd poc/frontend
npm run build
```

Output sẽ ở folder `dist/`

### Preview Production Build

```bash
npm run preview
```

## 📦 Dependencies

### Backend (`requirements.txt`)
```
fastapi
uvicorn
python-multipart
PyMuPDF
Pillow
requests
```

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "antd": "^5.11.5",
    "axios": "^1.6.2",
    "@uiw/react-markdown-preview": "^5.0.6"
  }
}
```

## 🎯 Future Improvements

- [ ] Support multiple file upload
- [ ] Add file preview (PDF viewer)
- [ ] Export to different formats (Word, JSON, etc.)
- [ ] Add authentication
- [ ] Store history of conversions
- [ ] Add progress bar for each page
- [ ] Support other file formats (images, etc.)

## 👨‍💻 Author

POC Solution - OCR Project

## 📄 License

Internal use only
