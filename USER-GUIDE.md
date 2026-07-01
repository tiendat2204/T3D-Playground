# AI Regression Worker - Hướng Dẫn Sử Dụng

## Tổng Quan

AI Regression Worker là nền tảng nội bộ sử dụng AI + Playwright để tự động hóa regression testing cho website. Hệ thống có thể:

- Tạo test plan từ yêu cầu bằng AI
- Tự động tạo code Playwright
- Chạy test trên trình duyệt thật
- Phân tích lỗi bằng AI
- Tự động tạo bug report

---

## Yêu Cầu Hệ Thống

- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (để chạy test nền)
- Trình duyệt hiện đại (Chrome, Firefox, Edge)

---

## Bắt Đầu Nhanh

### 1. Truy Cập Hệ Thống

Mở trình duyệt và truy cập: `http://localhost:3000`

### 2. Cấu Hình AI Provider

1. Vào trang **Settings**
2. Chọn AI provider (Gemini hoặc OpenAI)
3. Nhập API key
4. Chọn model
5. Click **Save Settings**

### 3. Tạo Dự Án

1. Vào trang **Projects**
2. Click **New Project**
3. Nhập thông tin dự án:
   - Tên dự án
   - Base URL (ví dụ: https://staging.example.com)
   - Mô tả
4. Click **Create Project**

### 4. Thêm Environment

1. Vào trang **Project Detail**
2. Click **Add Environment**
3. Nhập thông tin environment:
   - Tên (ví dụ: Staging, Production)
   - Base URL
4. Click **Create**

---

## Tạo Test Plan

### Bước 1: Mở AI Generate

1. Click **AI Generate** trong sidebar
2. Chọn dự án từ dropdown

### Bước 2: Mô Tả Cần Test

Gõ vào hộp chat những gì bạn muốn test:

```
Test login với tài khoản hợp lệ và không hợp lệ
```

hoặc

```
Test quản lý sản phẩm: tạo, chỉnh sửa, xóa sản phẩm
```

### Bước 3: Tạo Test Plan

1. Nhấn **Enter** hoặc click nút gửi
2. AI sẽ tạo test plan với nhiều test suite
3. Xem lại các test case đã tạo

### Bước 4: Tạo Code Playwright

1. Click **Continue to Code Generation**
2. Chọn một test case từ danh sách
3. Click nút generate
4. Xem code Playwright đã tạo
5. Click **Copy** hoặc **Download** để lưu code

---

## Chạy Test

### Chạy Test Đơn

1. Vào trang **Test Cases**
2. Tìm test case muốn chạy
3. Click nút **Run**
4. Chọn environment
5. Click **Run Test**

### Chạy Test Theo Tag

1. Vào trang **Test Cases**
2. Click **Run by Tag**
3. Chọn dự án
4. Chọn environment
5. Chọn tags (ví dụ: @smoke, @regression)
6. Click **Run Tests**

### Chạy Tất Cả Test Của Dự Án

1. Vào trang **Project Detail**
2. Click **Run All Tests**
3. Chọn environment
4. Chọn tags (tùy chọn)
5. Click **Run Tests**

---

## Xem Kết Quả Test

### Danh Sách Test Run

1. Vào trang **Test Runs**
2. Xem tất cả test run với trạng thái:
   - 🟢 **Passed** - Tất cả test pass
   - 🔴 **Failed** - Có test bị fail
   - 🟡 **Running** - Test đang chạy
   - ⚪ **Queued** - Test đang chờ chạy

### Chi Tiết Test Run

1. Click vào test run để xem chi tiết
2. Xem tổng quan:
   - Tổng số test
   - Số lượng pass
   - Số lượng fail
   - Thời gian chạy
3. Xem kết quả từng test:
   - Tên test case
   - Trạng thái (passed/failed/error)
   - Thời gian
   - Thông báo lỗi (nếu failed)

### Chạy Lại Test Fail

1. V vào chi tiết test run bị fail
2. Click **Re-run Failed**
3. Chỉ các test fail mới được chạy lại

---

## Phân Tích Lỗi

### Phân Tích Lỗi Bằng AI

1. Vào chi tiết test run bị fail
2. Tìm kết quả test bị fail
3. Click **Analyze Failure**
4. AI sẽ phân tích lỗi và cung cấp:
   - Nguyên nhân gốc
   - Điểm tin cậy
   - Loại vấn đề (product bug / test bug)
   - Gợi ý sửa
5. Bug report sẽ tự động được tạo

### Xem Phân Tích AI

1. Vào kết quả test fail
2. Kéo xuống phần **AI Analysis**
3. Xem phân tích:
   - **Root Cause**: Điều gì đã xảy ra
   - **Confidence**: Mức độ tin cậy của AI (0-100%)
   - **Type**: Đây là product bug hay test issue
   - **Suggested Fix**: Cách sửa lỗi

---

## Bug Reports

### Xem Bug Reports

1. Vào trang **Bug Reports**
2. Xem danh sách tất cả bug reports
3. Lọc theo trạng thái (open, in-progress, resolved, closed)

### Tạo Bug Report Thủ Công

1. Vào trang **Bug Reports**
2. Click **Create Bug Report**
3. Nhập thông tin:
   - Tiêu đề
   - Các bước tái hiện
   - Kết quả mong đợi
   - Kết quả thực tế
4. Click **Create**

### Bug Report Tự Động

Khi AI phân tích lỗi và xác định đây là product bug, bug report sẽ tự động được tạo với:
- Tiêu đề từ phân tích AI
- Các bước tái hiện
- Kết quả mong đợi vs thực tế
- Tóm tắt phân tích AI

---

## Quản Lý Test Case

### Xem Test Cases

1. Vào trang **Test Cases**
2. Xem tất cả test cases với:
   - Tiêu đề
   - Trạng thái (draft/approved/disabled)
   - Tên dự án
   - Tags

### Lọc Theo Tag

1. Sử dụng dropdown lọc tag
2. Chọn tag để lọc test cases
3. Click **Clear filter** để hiển thị tất cả

### Duyệt Test Cases

1. Vào trang **Test Cases**
2. Tìm test case
3. Click menu (...)
4. Chọn **Approve**

### Vô Hiệu Hóa Test Cases

1. Vào trang **Test Cases**
2. Tìm test case
3. Click menu (...)
4. Chọn **Disable**

---

## Cài Đặt

### Đổi AI Provider

1. Vào trang **Settings**
2. Chọn provider (Gemini hoặc OpenAI)
3. Nhập API key
4. Chọn model
5. Click **Save Settings**

### Bảo Mật API Key

- API key được lưu trong local storage của trình duyệt
- Key chỉ được gửi đến server khi tạo test
- Key không bao giờ được lưu trong database
- Xóa dữ liệu trình duyệt để xóa key

---

## Dashboard

Dashboard hiển thị:

- **Total Projects**: Số lượng dự án
- **Test Cases**: Số lượng test case
- **Tỷ Lệ Pass**: Phần trăm test pass
- **Tỷ Lệ Fail**: Phần trăm test fail
- **Biểu Đồ Pass/Fail**: Phân bố trực quan
- **Test Run Gần Đây**: Các lần chạy test mới nhất

---

## Xử Lý Sự Cố

### "AI API quota exceeded"

- Đợi vài phút và thử lại
- Hoặc chuyển sang provider khác trong Settings
- Hoặc nâng cấp gói API

### "No environment found"

- Vào Project Detail
- Thêm environment trước
- Sau đó thử chạy test lại

### Test không chạy

- Đảm bảo Redis đang chạy
- Đảm bảo worker process đã start (`pnpm dev:worker`)
- Kiểm tra trạng thái test run trong trang Test Runs

### "Failed to generate test plan"

- Kiểm tra API key trong Settings
- Đảm bảo có kết nối internet
- Thử lại với mục tiêu test đơn giản hơn

---

## Phím Tắt

| Hành Động | Phím Tắt |
|-----------|----------|
| Gửi tin nhắn (trong AI chat) | Enter |
| Xuống dòng (trong AI chat) | Shift + Enter |

---

## Mẹo Cho Đội QC

1. **Bắt Đầu Với Smoke Tests**: Tạo @smoke tests trước cho các đường dẫn quan trọng

2. **Sử Dụng Mô Tả Rõ Ràng**: Cụ thể khi mô tả những gì cần test
   - Tốt: "Test login với tài khoản admin hợp lệ"
   - Không tốt: "Test login"

3. **Kiểm Tra Code Được Tạo**: Luôn xem lại code Playwright do AI tạo trước khi chạy

4. **Kiểm Tra Environment**: Đảm bảo URL environment chính xác trước khi chạy test

5. **Sử Dụng Tags**: Tổ chức test bằng tags để dễ lọc và chạy hàng loạt

6. **Phân Tích Lỗi**: Sử dụng phân tích AI để hiểu tại sao test fail

7. **Theo Dõi Bug Reports**: Bug reports được tự động tạo từ phân tích AI - xem và cập nhật trạng thái

---

## Hỗ Trợ

Liên hệ đội ngũ phát triển nếu gặp sự cố hoặc có thắc mắc.
