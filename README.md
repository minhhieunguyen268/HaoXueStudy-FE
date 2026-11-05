# HaoXueStudy

Giao diện học tiếng Trung được xây dựng bằng React, TypeScript và Vite.

## Chạy dự án

```bash
npm install
npm run dev
```

Các lệnh `npm run build` và `npm run lint` dùng để kiểm tra build/TypeScript và quy tắc mã nguồn.

## Cấu trúc mã nguồn

```text
src/
├── app/                 # Khai báo router và ghép các trang
├── features/
│   ├── auth/            # Trang đăng nhập
│   └── dashboard/       # Trang tổng quan và giao diện học tập
├── shared/
│   ├── assets/          # Tài nguyên dùng chung
│   ├── lib/             # Tiện ích dùng chung, API client
│   └── styles/          # CSS toàn cục
└── main.tsx             # Điểm khởi chạy ứng dụng
```

Dashboard nằm ở `/`. Các thao tác học tập yêu cầu đăng nhập và chuyển tới `/login`. Trang đăng nhập/đăng ký gọi các API `/auth/login`, `/auth/register` và xác thực access token với `/auth/me`. Backend mặc định chạy tại `http://localhost:3000`.
