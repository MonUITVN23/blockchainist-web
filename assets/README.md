# Assets Structure

## Thư mục assets/
```
assets/
├── avatars/           # Avatar thành viên (150x150px)
│   ├── member-1.jpg
│   ├── member-2.jpg
│   └── default.jpg
├── icons/            # Icons và logos
│   ├── logo.svg
│   ├── favicon.ico
│   └── social/
├── images/           # Hình ảnh khác
│   ├── hero-bg.jpg
│   └── research/
└── documents/        # PDF, docs (nếu cần)
```

## Hướng dẫn sử dụng:

1. **Upload assets lên GitHub repository**
2. **Sử dụng URL từ GitHub raw:**
   ```
   https://raw.githubusercontent.com/MonUITVN23/blockchainist-web/main/assets/avatars/member-1.jpg
   ```

3. **Hoặc sử dụng Unsplash cho placeholder:**
   ```
   https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face
   ```

## File size khuyến nghị:
- Avatar: < 50KB (150x150px)
- Icons: < 10KB (SVG ưu tiên)
- Images: < 200KB (tối ưu cho web)

## CDN Caching:
GitHub và Unsplash đều có CDN global, đảm bảo tải nhanh worldwide.