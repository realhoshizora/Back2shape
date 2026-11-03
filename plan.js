// Kế hoạch tập: 3 buổi toàn thân/tuần (T2, T4, T6), xen kẽ buổi A và B.
// Mỗi bài có các "bậc" (steps): khi mọi hiệp đạt mức lần lặp cao nhất, buổi sau tự lên bậc kế tiếp.
// Ảnh minh họa: free-exercise-db (Unlicense), https://github.com/yuhonas/free-exercise-db
const SCHED = [1, 3, 5]; // getDay(): 1 = Thứ Hai, 3 = Thứ Tư, 5 = Thứ Sáu
const MET = 3.5;         // Compendium of Physical Activities 2024, mã 02054 (tập kháng lực 8–15 lần)
const WARMUP_MIN = 5;

const EX = {
  squat: { sets: 3, rest: 90, steps: [
    { id: 'Bodyweight_Squat', name: 'Squat tay không', reps: [10, 20], cue: 'Chân rộng bằng vai, hạ hông như ngồi xuống ghế, đầu gối theo hướng mũi chân. Hạ xuống trong 3 giây.' },
    { id: 'Goblet_Squat', name: 'Goblet squat ôm tạ', reps: [10, 20], cue: 'Ôm một quả tạ 5 kg sát ngực. Hạ sâu trong 3 giây, dừng 1 giây ở dưới rồi đứng lên.' },
    { id: 'Split_Squat_with_Dumbbells', name: 'Split squat cầm tạ', reps: [8, 15], side: true, cue: 'Một chân trước, một chân sau, hai tay cầm tạ. Hạ gối sau gần chạm sàn trong 3 giây.' },
  ] },
  push: { sets: 3, rest: 90, steps: [
    { id: 'Incline_Push-Up', name: 'Hít đất nghiêng', reps: [6, 12], cue: 'Tay đặt lên mép bàn hoặc giường chắc chắn, người thẳng từ đầu tới gót. Hạ ngực trong 3 giây.' },
    { id: 'Pushups', name: 'Hít đất chuẩn', reps: [5, 12], cue: 'Tay rộng hơn vai một chút, siết bụng và mông. Hạ ngực gần chạm sàn trong 3 giây.' },
    { id: 'Push-Ups_With_Feet_Elevated', name: 'Hít đất gác chân', reps: [5, 12], cue: 'Gác chân lên ghế thấp, người thẳng. Hạ chậm 3 giây, đẩy lên dứt khoát.' },
  ] },
  row1: { sets: 3, rest: 60, steps: [
    { id: 'One-Arm_Dumbbell_Row', name: 'Chèo tạ một tay', reps: [10, 15], side: true, cue: 'Một tay và một gối chống lên ghế, lưng thẳng. Kéo tạ về hông, dừng 1 giây ở trên, hạ chậm.' },
  ] },
  rdl: { sets: 3, rest: 90, steps: [
    { id: 'Stiff-Legged_Dumbbell_Deadlift', name: 'Romanian deadlift tạ đơn', reps: [12, 20], cue: 'Gối hơi chùng, đẩy hông ra sau, tạ trượt sát đùi xuống ngang ống chân trong 3 giây. Lưng luôn thẳng.' },
  ] },
  press: { sets: 3, rest: 75, steps: [
    { id: 'Seated_Dumbbell_Press', name: 'Đẩy tạ qua đầu', reps: [10, 15], cue: 'Ngồi thẳng lưng, đẩy tạ từ ngang tai lên thẳng trên đầu, hạ chậm trong 3 giây.' },
  ] },
  plank: { sets: 3, rest: 45, steps: [
    { id: 'Plank', name: 'Plank', reps: [20, 45], unit: 's', cue: 'Chống cẳng tay, siết bụng và mông, người thẳng một đường. Thở đều.' },
  ] },
  lunge: { sets: 3, rest: 75, steps: [
    { id: 'Dumbbell_Rear_Lunge', name: 'Chùng chân lùi sau', reps: [8, 12], side: true, cue: 'Cầm hai tạ, bước lùi một chân, hạ gối sau gần sàn, đạp gót chân trước để đứng lên.' },
  ] },
  floor: { sets: 3, rest: 90, steps: [
    { id: 'Dumbbell_Floor_Press', name: 'Đẩy tạ nằm sàn', reps: [12, 20], cue: 'Nằm ngửa, đẩy tạ thẳng lên trên ngực. Dừng 1 giây khi khuỷu tay chạm sàn.' },
  ] },
  row2: { sets: 3, rest: 75, steps: [
    { id: 'Bent_Over_Two-Dumbbell_Row', name: 'Chèo tạ cúi người', reps: [12, 20], cue: 'Gập hông, lưng thẳng, kéo hai tạ về hông, siết bả vai 1 giây rồi hạ chậm.' },
  ] },
  bridge: { sets: 3, rest: 60, steps: [
    { id: 'Butt_Lift_Bridge', name: 'Cầu mông', reps: [12, 20], cue: 'Nằm ngửa, co gối, đẩy hông lên tới khi thân thẳng từ gối tới vai. Siết mông 2 giây ở trên.' },
    { id: 'Single_Leg_Glute_Bridge', name: 'Cầu mông một chân', reps: [8, 15], side: true, cue: 'Như cầu mông nhưng một chân duỗi thẳng. Giữ hông cân, không xoay.' },
  ] },
  lateral: { sets: 3, rest: 60, steps: [
    { id: 'Side_Lateral_Raise', name: 'Nâng tạ ngang vai', reps: [12, 20], cue: 'Nâng tạ sang hai bên tới ngang vai, khuỷu hơi cong, hạ chậm trong 3 giây.' },
  ] },
  curl: { sets: 3, rest: 60, steps: [
    { id: 'Hammer_Curls', name: 'Cuốn tạ búa', reps: [10, 15], cue: 'Lòng bàn tay hướng vào nhau, khuỷu tay sát người, cuốn tạ lên rồi hạ chậm 3 giây.' },
  ] },
  deadbug: { sets: 2, rest: 45, steps: [
    { id: 'Dead_Bug', name: 'Dead bug', reps: [6, 10], side: true, cue: 'Nằm ngửa, lưng dưới ép sát sàn. Duỗi chậm tay và chân đối diện, rồi đổi bên.' },
  ] },
  band: { sets: 2, rest: 45, steps: [
    { id: 'Band_Pull_Apart', name: 'Kéo dãn dây kháng lực', reps: [15, 25], cue: 'Hai tay duỗi thẳng trước ngực, kéo dây sang hai bên tới khi chạm ngực, siết bả vai.' },
  ] },
};

const WORKOUTS = {
  A: { name: 'Toàn thân A', ex: ['squat', 'push', 'row1', 'rdl', 'press', 'plank'] },
  B: { name: 'Toàn thân B', ex: ['lunge', 'floor', 'row2', 'bridge', 'lateral', 'curl', 'deadbug'] },
};

const WARMUP = [
  'Xoay khớp vai, khuỷu, cổ tay, hông: 1 phút',
  '10 squat tay không, chậm',
  '10 hít đất nghiêng thật nhẹ',
  '10 lần mèo – bò (cong và võng lưng)',
  '1 hiệp nhẹ của bài đầu tiên',
];
