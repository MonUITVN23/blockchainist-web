# Nhóm Nghiên cứu Blockchain, Mạng & Bảo mật

Website chính thức của nhóm nghiên cứu chuyên về công nghệ Blockchain, Mạng và An ninh mạng.

## 🚀 Tính năng

- **Trang chủ động**: Hiển thị thông tin về nhóm nghiên cứu
- **Quản lý thành viên**: Tự động load thành viên từ Firebase
- **Công bố khoa học**: Hiển thị các nghiên cứu đã được công bố
- **Form liên hệ**: Tiếp nhận hồ sơ ứng tuyển với upload file
- **Admin Panel**: Quản lý toàn bộ nội dung website
- **Firebase Integration**: Lưu trữ dữ liệu real-time
- **Responsive Design**: Tương thích trên mọi thiết bị

## 🛠️ Công nghệ sử dụng

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Tailwind CSS
- **Backend**: Firebase (Firestore, Storage, Auth)
- **Animation**: AOS (Animate On Scroll)
- **Icons**: Lucide Icons
- **3D Effects**: Three.js

## 📦 Cài đặt và Chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd blockchainist-web
```

### 2. Cấu hình Firebase
1. Tạo project Firebase tại [Firebase Console](https://console.firebase.google.com/)
2. Cấu hình Firestore Database
3. Thiết lập Firebase Storage
4. Bật Authentication (Email/Password)
5. Cập nhật `firebase-config.js` với thông tin dự án của bạn

### 3. Thiết lập Collections trong Firestore

#### Collection: `members`
```javascript
{
  name: "Tên thành viên",
  role: "Chức vụ", 
  avatar: "URL avatar"
}
```

#### Collection: `publications`
```javascript
{
  title: "Tiêu đề bài báo",
  authors: "Danh sách tác giả",
  journal: "Tên tạp chí",
  year: 2025,
  abstract: "Tóm tắt nghiên cứu",
  url: "Link đến bài báo"
}
```

#### Collection: `applications` (tự động tạo khi có form submission)
```javascript
{
  name: "Họ tên",
  email: "Email",
  school: "Trường học",
  phone: "Số điện thoại",
  message: "Thư ngỏ",
  cvUrl: "Link CV",
  transcriptUrl: "Link bảng điểm",
  timestamp: "Thời gian gửi"
}
```

### 4. Tạo tài khoản Admin
Sử dụng Firebase Console để tạo user admin:
1. Vào Authentication
2. Thêm user mới với email/password
3. Sử dụng thông tin này để đăng nhập admin panel

### 5. Deploy

#### Sử dụng Firebase Hosting (Khuyên dùng)
```bash
# Cài đặt Firebase CLI
npm install -g firebase-tools

# Đăng nhập
firebase login

# Khởi tạo hosting
firebase init hosting

# Deploy
firebase deploy
```

#### Sử dụng các dịch vụ khác
- **Netlify**: Kéo thả folder vào Netlify Dashboard
- **Vercel**: Import từ GitHub repository  
- **GitHub Pages**: Push lên GitHub và bật Pages

## 🔧 Cấu trúc thư mục

```
/
├── index.html              # Trang chủ
├── admin.html              # Trang quản trị
├── firebase-config.js      # Cấu hình Firebase
├── css/
│   └── styles.css         # Custom styles (nếu cần)
├── js/
│   ├── main.js            # JavaScript cho trang chủ
│   └── admin.js           # JavaScript cho admin panel
└── README.md
```

## 🎨 Tùy chỉnh

### Thay đổi màu sắc chủ đạo
Sửa các class Tailwind trong HTML:
- `text-sky-400` → `text-blue-400` (thay đổi màu accent)
- `bg-sky-500` → `bg-blue-500` (thay đổi màu nút)

### Thêm section mới
1. Thêm HTML section mới
2. Cập nhật navigation menu
3. Thêm animation AOS nếu cần

### Thay đổi font chữ
Cập nhật Google Fonts import trong `<head>` và CSS custom.

## 📱 Tương thích

- ✅ Chrome/Edge/Firefox (phiên bản mới)
- ✅ Mobile Safari/Chrome
- ✅ Responsive breakpoints: sm, md, lg, xl
- ✅ Dark mode ready

## 🔒 Bảo mật

- Firebase Security Rules được cấu hình
- Admin authentication required
- File upload validation
- XSS protection

## 📞 Hỗ trợ

Nếu có vấn đề gì trong quá trình setup hoặc deploy:
1. Kiểm tra Firebase configuration
2. Xem Console logs để debug
3. Đảm bảo Firestore rules đúng
4. Kiểm tra CORS settings nếu có lỗi

## 📄 License

© 2025 Nhóm Nghiên cứu Blockchain, Mạng & Bảo mật. All rights reserved.