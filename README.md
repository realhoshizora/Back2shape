# Back2shape

Web app tập tại nhà: 3 buổi toàn thân mỗi tuần (Thứ Hai, Tư, Sáu), khoảng 45 phút, dùng một cặp tạ 5 kg, hít đất và bài tay không. App hiện bài tập theo ngày, thời gian, calo, chuỗi buổi tập, có ảnh minh họa từng động tác và đồng bộ giữa điện thoại với máy tính.

## Chạy thử trên máy

```bash
python -m http.server 8737
```

Mở http://localhost:8737.

## Đưa lên mạng (cần HTTPS để thêm vào màn hình chính iPhone)

App là các file tĩnh, nên host nào cũng dùng được. Cách nhanh nhất:

1. Vào https://app.netlify.com/drop.
2. Kéo cả thư mục `Back2shape` vào trang đó. Bạn sẽ nhận được một link `https://….netlify.app`.
3. Trong Supabase Dashboard → Authentication → URL Configuration, đặt **Site URL** là link đó, để link xác nhận trong email mở đúng app.

Không cần tải lên `.impeccable/`, `.claude/`, `selftest.js` hoặc các file `.md`; nếu lỡ tải lên thì cũng không ảnh hưởng gì.

## Thêm vào màn hình chính iPhone

1. Mở link bằng **Safari**.
2. Bấm nút Chia sẻ → **Thêm vào MH chính**.
3. Mở app từ biểu tượng mới, vào biểu tượng người ở góc phải và đăng nhập. App trên màn hình chính có bộ nhớ riêng, tách khỏi Safari, nên cần đăng nhập lại một lần ở đây.

## Đồng bộ

- Dữ liệu lưu trên máy trước, rồi mới đồng bộ lên bảng `public.sessions` trong dự án Supabase. Mỗi dòng là một tài khoản và một buổi tập, có bảo mật theo từng tài khoản (RLS).
- Đăng nhập bằng email và mật khẩu. Lần đầu bấm **Tạo tài khoản**, xác nhận qua email, rồi **Đăng nhập** trên cả điện thoại lẫn máy tính.

## Đếm số lần bằng camera

Khi đang tập, bấm nút camera cạnh **Xong hiệp**. App dùng [MediaPipe Pose](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) để theo dõi góc khớp và tự đếm số lần, đồng thời nhắc nếu bạn hạ người nhanh hơn 3 giây. Mọi xử lý chạy trên điện thoại, video không gửi đi đâu.

- Đếm được với: hít đất (cả 3 bậc), squat, goblet squat, split squat, chùng chân lùi sau, cầu mông và cuốn tạ búa. Các bài khác vẫn đếm bằng nút +/−.
- Đặt máy **ngang người**, cách 2–3 m, sao cho camera thấy toàn thân. Phòng cần đủ sáng.
- Lần đầu bật, app tải khoảng 15 MB. Sau đó dữ liệu được lưu lại để dùng offline.
- Với bài từng bên (split squat, chùng chân), app thấy cả hai chân nên cứ 2 lần cử động được tính là 1 lần cho mỗi bên.
- Nếu đếm sai, sửa bằng nút +/−. Ngưỡng góc của từng bài nằm trong `plan.js` (`CAM_PUSH`, `CAM_SQUAT`…).

## Nhắc lịch

Vào Tài khoản → Nhắc lịch tập → **Thêm vào Lịch (.ics)**. Thao tác này tạo một sự kiện lặp lại vào Thứ Hai, Tư, Sáu, có thông báo trước 10 phút.

## Kế hoạch tập và nguồn tham khảo

- Lịch: tập toàn thân 3 buổi/tuần, xen kẽ buổi A và B. Mỗi bài có các bậc tăng dần, ví dụ hít đất nghiêng → hít đất chuẩn → hít đất gác chân, theo cách của [r/bodyweightfitness Recommended Routine](https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine).
- Tạ nhẹ vẫn tăng cơ nếu tập gần kiệt sức (Lasevicius và cộng sự 2022, đồng tác giả Schoenfeld). Vì vậy app dùng dải 10–20 lần, hạ chậm 3 giây, và tự lên bậc khi mọi hiệp chạm mức cao nhất.
- Calo = 3,5 MET × cân nặng × giờ tập, theo [Compendium of Physical Activities 2024](https://pacompendium.com/conditioning-exercise), mã 02054. Đây chỉ là ước tính.
- Lượng đạm khoảng 1,6 g/kg/ngày ([Morton 2018, BJSM](https://bjsm.bmj.com/content/52/6/376)).
- Một số ý tưởng lấy từ [openGym](https://gitea.com/DuarteSantos/openGym): điền sẵn số liệu của lần trước, đồng hồ nghỉ giữa hiệp, theo dõi kỷ lục.
- Ảnh minh họa: [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (Unlicense), lưu trong `img/`.

Muốn sửa bài tập thì sửa file `plan.js`.

## Kiểm tra

```bash
node selftest.js
```
