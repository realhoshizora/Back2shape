'use strict';
// Publishable key: meant for browsers. Row-level security on public.sessions keeps each account's rows private.
const SB_URL = 'https://zsrowjwryghiiqjzrrdo.supabase.co';
const SB_KEY = 'sb_publishable_v-x65ohpd7ZpN9_q7RIc4A_AKNFx5vA';
const sb = window.supabase ? supabase.createClient(SB_URL, SB_KEY) : null;

const DAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const DAYNAME = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const I = {
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
};
const icon = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;

// ---------- State: local first, Supabase second ----------
const KEY = 'b2s.v1';
const DEF = () => ({ s: {}, set: { kg: 60, bands: false, at: '18:30' }, lvl: {}, lvlU: 0, draft: null });
let S = load();
function load() { try { return { ...DEF(), ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return DEF(); } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }

// ---------- Dates & schedule ----------
const key = d => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD, local time
const parse = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
const monday = d => addDays(d, -((d.getDay() + 6) % 7));
// A session "slot" is a scheduled day; it stays open until the next scheduled day (make-up allowed).
const slotOf = d => { while (!SCHED.includes(d.getDay())) d = addDays(d, -1); return d; };
const prevSlot = s => slotOf(addDays(s, -1));
const nextSlot = s => { let d = addDays(s, 1); while (!SCHED.includes(d.getDay())) d = addDays(d, 1); return d; };
// Odd weeks A-B-A, even weeks B-A-B.
const letter = slot => (Math.round((monday(slot) - new Date(2024, 0, 1)) / 6048e5) + SCHED.indexOf(slot.getDay())) % 2 ? 'B' : 'A';

function streak() {
  let s = slotOf(today()), n = 0;
  if (!S.s[key(s)]) s = prevSlot(s); // today's slot still open: it can't break the chain yet
  while (S.s[key(s)]) { n++; s = prevSlot(s); }
  return n;
}

// ---------- Exercises ----------
const lv = k => Math.min(S.lvl[k] || 0, EX[k].steps.length - 1);
const stepOf = k => EX[k].steps[lv(k)];
const exList = w => WORKOUTS[w].ex.concat(S.set.bands ? ['band'] : []);
const exMin = k => { const e = EX[k], st = stepOf(k), work = st.unit === 's' ? st.reps[1] + 15 : 45; return e.sets * ((st.side ? 2 : 1) * work + e.rest) / 60; };
const planMin = w => WARMUP_MIN + exList(w).reduce((a, k) => a + Math.round(exMin(k)), 0); // sums the minutes shown per stop
const kcal = min => Math.round(MET * S.set.kg * min / 60);
const unit = st => st.unit === 's' ? 'giây' : 'lần';
const repsTxt = st => `${st.reps[0]}–${st.reps[1]} ${unit(st)}${st.side ? ' mỗi bên' : ''}`;
const img = id => [`img/${id}_0.jpg`, `img/${id}_1.jpg`];
const demo = (k, act = true) => {
  const st = stepOf(k), [a, b] = img(st.id);
  const inner = `<img src="${a}" alt="${esc(st.name)}: tư thế bắt đầu"><img src="${b}" alt="${esc(st.name)}: tư thế kết thúc">`;
  return act ? `<button class="demo" data-act="ex" data-k="${k}" aria-label="Xem hướng dẫn ${esc(st.name)}">${inner}<span class="tag">${icon('info')}Hướng dẫn</span></button>` : `<div class="demo">${inner}</div>`;
};
function lastLog(k) {
  const id = stepOf(k).id;
  for (const d of Object.keys(S.s).sort().reverse()) { const l = S.s[d].log?.[k]; if (l && l.id === id) return l.r; }
  return null;
}

// ---------- Rendering ----------
let view = S.draft ? 'sess' : 'home', showF = false, summary = null, user = null, syncState = '';

function lineHTML(mon, big = true) {
  const t = key(today()), cur = key(slotOf(today()));
  let html = '', runTo = -1;
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i), k = key(d), dow = d.getDay(), sch = SCHED.includes(dow), s = S.s[k];
    const cls = !sch ? 'rest' : s ? 'done' : k === cur ? 'now' : k < cur ? 'miss' : '';
    if (s) runTo = i; // the line is drawn as far as the train has actually run
    const em = !sch ? '' : s ? `${s.min}'` : k < cur ? 'lỡ' : letter(d);
    const label = `${DAYNAME[dow]}: ${!sch ? 'nghỉ' : s ? `đã tập ${s.min} phút` : k === cur ? 'buổi tập hiện tại' : k < cur ? 'đã lỡ' : `buổi ${letter(d)}`}`;
    html += `<div class="stn ${cls} ${k === t ? 'today' : ''}" role="listitem" aria-label="${label}"><span class="dot"></span>${big ? `<small>${DAY[dow]}</small><em>${em}</em>` : ''}</div>`;
  }
  const run = runTo < 0 ? 0 : runTo / 7 * 100;
  return `<div class="line" role="list"><span class="run" style="width:${run}%"></span>${html}</div>`;
}

function weekTotals(mon) {
  let n = 0, min = 0, kc = 0;
  for (let i = 0; i < 7; i++) { const s = S.s[key(addDays(mon, i))]; if (s) { n++; min += s.min; kc += s.kcal; } }
  return { n, min, kc };
}

function topPanel() {
  const n = streak(), mon = monday(today()), w = weekTotals(mon);
  const sync = !user ? 'Chỉ lưu trên máy này' : syncState === 'err' ? 'Lỗi đồng bộ' : syncState === 'busy' ? 'Đang đồng bộ…' : 'Đã đồng bộ';
  return `<header class="top">
    <div class="bar">
      <div class="streak"><span class="num">${n}</span><p>${n ? 'buổi liên tiếp<br>không lỡ lịch' : 'Chưa có chuỗi.<br>Tập buổi này để bắt đầu.'}</p></div>
      <button class="iconbtn sync ${user ? syncState || 'ok' : ''}" data-act="account" aria-label="Tài khoản và cài đặt. ${sync}">${icon('user')}<i></i></button>
    </div>
    ${lineHTML(mon)}
    <div class="week"><span><b>${w.n}</b>/3 buổi</span><span><b>${w.min}</b>phút</span><span><b>${w.kc}</b>kcal tuần này</span></div>
  </header>`;
}

function kcalBtn(min, approx) {
  return `<button class="kc" data-act="formula" aria-expanded="${showF}"><b>${approx ? '~' : ''}${kcal(min)}</b>kcal</button>
    ${showF ? `<span class="formula">${MET} MET × ${S.set.kg} kg × ${min} phút ÷ 60 (Compendium of Physical Activities 2024). Sửa cân nặng trong phần Tài khoản.</span>` : ''}`;
}

function history() {
  const keys = Object.keys(S.s).sort();
  const mon = monday(today());
  if (!keys.length) return `<p class="empty">Chưa có tuần nào. Các tuần đã tập sẽ hiện ở đây, cùng một tỉ lệ để dễ so sánh.</p>`;
  const first = monday(parse(keys[0]));
  let rows = '';
  for (let m = addDays(mon, -7), i = 0; m >= first && i < 12; m = addDays(m, -7), i++) {
    const w = weekTotals(m), e = addDays(m, 6);
    rows += `<div class="hw"><span>${m.getDate()}/${m.getMonth() + 1}–${e.getDate()}/${e.getMonth() + 1}</span>${lineHTML(m, false)}<span class="r"><b>${w.n}</b>/3 · ${w.min}'</span></div>`;
  }
  return rows ? `<div class="hist">${rows}</div>` : `<p class="empty">Đây là tuần đầu tiên. Tuần sau, tuần này sẽ được xếp vào đây.</p>`;
}

function home() {
  const t = today(), slot = slotOf(t), sk = key(slot), done = S.s[sk];
  let body, dock = '';
  if (!done) {
    const w = letter(slot), min = planMin(w), list = exList(w);
    const makeup = sk !== key(t) ? `<span>Tập bù buổi ${DAYNAME[slot.getDay()]}</span>` : '';
    body = `<h1>${WORKOUTS[w].name}</h1>
      <div class="meta"><span><b>${min}</b>phút</span>${kcalBtn(min, true)}<span><b>${list.length}</b>bài</span>${makeup}</div>
      <ol class="stops">
        <li><div class="stop"><span class="pin"></span><span class="t">Khởi động<span>Xoay khớp, squat và hít đất nhẹ</span></span><span class="m">${WARMUP_MIN}'</span></div></li>
        ${list.map(k => { const st = stepOf(k); return `<li><button class="stop" data-act="ex" data-k="${k}"><span class="pin"></span><span class="t">${esc(st.name)}<span>${EX[k].sets} × ${repsTxt(st)}</span></span><span class="m">${Math.round(exMin(k))}'</span></button></li>`; }).join('')}
      </ol>
      <div class="total"><span>Tổng thời gian dự kiến</span><span class="num">${min}:00</span></div>`;
    dock = `<button class="go" data-act="start">${icon('play')}Bắt đầu buổi tập</button>`;
  } else {
    const next = nextSlot(slot), isToday = sk === key(t);
    body = `<div class="rest-day"><h1>${isToday ? `Xong ${WORKOUTS[done.w].name}` : 'Ngày nghỉ'}</h1>
      <div class="meta"><span><b>${done.min}</b>phút</span>${kcalBtn(done.min, false)}<span>buổi ${DAYNAME[slot.getDay()]}</span></div>
      <p>Buổi tiếp theo: <strong>${DAYNAME[next.getDay()]}, ${WORKOUTS[letter(next)].name}</strong>.</p>
      <p>Hôm nay: đi bộ 20–30 phút hoặc giãn cơ nhẹ. Để tăng cân, ăn dư khoảng 300–500 kcal mỗi ngày và khoảng ${Math.round(1.6 * S.set.kg)} g đạm (1,6 g/kg).</p></div>`;
  }
  return `${topPanel()}<main>${body}<h2>Các tuần trước</h2>${history()}</main>${dock ? `<div class="dock"><div>${dock}</div></div>` : ''}`;
}

function sessTop(D) {
  let track = '';
  D.ex.forEach((k, i) => { track += `${i ? `<i class="${i <= D.i && D.phase !== 'warm' ? 'd' : ''}"></i>` : ''}<b class="${i < D.i ? 'd' : i === D.i && D.phase !== 'warm' ? 'c' : ''}"></b>`; });
  return `<header class="sess-top"><div class="bar"><span>${WORKOUTS[D.w].name} · <span class="clock" id="clock">${clock(D)}</span></span>
    <button class="iconbtn" data-act="end" aria-label="Kết thúc buổi tập">${icon('x')}</button></div>
    <div class="track" aria-label="Bài ${Math.min(D.i + 1, D.ex.length)} trên ${D.ex.length}">${track}</div></header>`;
}
const clock = D => { const s = Math.floor((Date.now() - D.t0) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

function sess() {
  const D = S.draft;
  if (D.phase === 'warm') {
    return `${sessTop(D)}<main><h1>Khởi động ${WARMUP_MIN} phút</h1>
      <p class="muted" style="margin-top:8px">Làm nhẹ nhàng, không cần ghi lại.</p>
      <ul class="warm">${WARMUP.map(x => `<li>${x}</li>`).join('')}</ul></main>
      <div class="dock"><div><button class="go" data-act="warmdone">${icon('check')}Xong khởi động</button></div></div>`;
  }
  const k = D.ex[D.i], e = EX[k], st = stepOf(k);
  if (D.phase === 'rest') {
    const nk = D.ex[D.i], nst = stepOf(nk);
    return `${sessTop(D)}<main><div class="restv"><span class="num" id="rest" aria-live="off">${restLeft(D)}</span><p>giây nghỉ · uống nước, thở sâu</p>
      <div class="next"><img src="${img(nst.id)[0]}" alt=""><div><span>Tiếp theo · hiệp ${D.k + 1}/${EX[nk].sets}</span><b>${esc(nst.name)}</b></div></div></div></main>
      <div class="dock"><div><button class="ghost" data-act="more">+15 giây</button><button class="go" data-act="skiprest">Bỏ qua nghỉ</button></div></div>`;
  }
  const last = lastLog(k);
  return `${sessTop(D)}<main>${demo(k)}
    <div class="ex-name">${esc(st.name)}</div>
    <div class="ex-sub">Hiệp ${D.k + 1}/${e.sets} · mục tiêu ${repsTxt(st)}</div>
    <div class="setdots">${Array.from({ length: e.sets }, (_, i) => `<i class="${i < D.k ? 'd' : i === D.k ? 'c' : ''}"></i>`).join('')}</div>
    <div class="counter"><button class="step" data-act="dec" aria-label="Bớt">${icon('minus')}</button>
      <div><span class="num" id="cur" aria-live="polite">${D.cur}</span><span class="unit">${unit(st)} đã làm${st.side ? ' (mỗi bên)' : ''}</span></div>
      <button class="step" data-act="inc" aria-label="Thêm">${icon('plus')}</button></div>
    <p class="last">${last ? `Lần trước: ${last.join(' · ')}` : 'Lần đầu tập bài này: chọn mức vừa sức, dừng khi còn 1–2 lần nữa là kiệt.'}</p>
    <div class="links"><button data-act="skipex">Bỏ qua bài này</button><button data-act="end">Kết thúc buổi</button></div></main>
    <div class="dock"><div><button class="go" data-act="setdone">${icon('check')}Xong hiệp ${D.k + 1}/${e.sets}</button></div></div>`;
}

function summaryView() {
  const s = summary.s, sets = Object.values(s.log).reduce((a, l) => a + l.r.length, 0);
  const stops = Object.entries(s.log).map(([k, l]) => {
    const st = EX[k].steps.find(x => x.id === l.id) || EX[k].steps[0];
    return `<li><div class="stop done"><span class="pin"></span><span class="t">${esc(st.name)}<span>${l.r.join(' · ')} ${unit(st)}</span></span><span class="m">${l.r.length}×</span></div></li>`;
  }).join('');
  return `${topPanel()}<main><h1>Xong ${WORKOUTS[s.w].name}</h1>
    <div class="meta"><span><b>${s.min}</b>phút</span>${kcalBtn(s.min, false)}<span><b>${sets}</b>hiệp</span><span>buổi ${DAYNAME[parse(s.slot).getDay()]}</span></div>
    <ol class="stops">${stops}</ol>
    ${summary.ups.length ? `<h2>Lên bậc cho buổi sau</h2><ul class="ups">${summary.ups.map(u => `<li>${u}</li>`).join('')}</ul>` : `<h2>Buổi sau</h2><p class="muted">Cố thêm 1–2 lần mỗi hiệp. Khi mọi hiệp chạm mức cao nhất, app sẽ tự lên bậc.</p>`}
    </main><div class="dock"><div><button class="go" data-act="home">Về trang chính</button></div></div>`;
}

function render() {
  $('#app').innerHTML = view === 'sess' && S.draft ? sess() : view === 'summary' && summary ? summaryView() : home();
}

// ---------- Session logic ----------
const prefill = D => { const k = D.ex[D.i], l = lastLog(k); return l?.[D.k] ?? stepOf(k).reps[0]; };
let ac, wl;
async function wake(on) {
  try { if (on && 'wakeLock' in navigator) wl = await navigator.wakeLock.request('screen'); else if (!on) { await wl?.release(); wl = null; } } catch {}
}
function beep() {
  try {
    ac ||= new AudioContext();
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.frequency.value = 880; o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(.3, t); g.gain.exponentialRampToValueAtTime(.001, t + .7);
    o.start(t); o.stop(t + .7);
  } catch {}
  navigator.vibrate?.([200, 100, 200]);
}
const restLeft = D => Math.max(0, Math.ceil((D.restEnd - Date.now()) / 1000));

function start() {
  const slot = slotOf(today()), w = letter(slot);
  try { ac ||= new AudioContext(); ac.resume(); } catch {} // iOS unlocks audio only inside a tap
  S.draft = { w, slot: key(slot), t0: Date.now(), ex: exList(w), i: 0, k: 0, log: {}, phase: 'warm', cur: 0 };
  save(); wake(true); view = 'sess'; render(); scrollTo(0, 0);
}
function advance(D) {
  D.k++;
  if (D.k >= EX[D.ex[D.i]].sets) { D.i++; D.k = 0; }
  if (D.i >= D.ex.length) return finish();
  D.cur = prefill(D);
}
function setDone() {
  const D = S.draft, k = D.ex[D.i], st = stepOf(k);
  (D.log[k] ||= { id: st.id, r: [] }).r[D.k] = D.cur;
  const rest = EX[k].rest;
  advance(D);
  if (!S.draft) return;
  D.phase = 'rest'; D.restEnd = Date.now() + rest * 1000;
  save(); render();
}
function finish() {
  const D = S.draft, t1 = Date.now(), min = Math.max(1, Math.min(150, Math.round((t1 - D.t0) / 60000)));
  const ups = [];
  for (const [k, l] of Object.entries(D.log)) {
    const e = EX[k], st = stepOf(k);
    if (l.r.length < e.sets || l.r.some(r => r < st.reps[1])) continue;
    if (lv(k) < e.steps.length - 1) { S.lvl[k] = lv(k) + 1; ups.push(`${esc(st.name)} → <b>${esc(stepOf(k).name)}</b>`); }
    else ups.push(`${esc(st.name)}: đã chạm ${st.reps[1]} ${unit(st)}. Buổi sau hạ chậm 4–5 giây mỗi lần để bài nặng hơn.`);
  }
  const s = { w: D.w, slot: D.slot, t0: D.t0, t1, min, kg: S.set.kg, kcal: kcal(min), log: D.log, lvl: { ...S.lvl }, u: t1 };
  S.s[D.slot] = s; S.lvlU = t1; S.draft = null; save();
  wake(false); summary = { s, ups }; view = 'summary'; render(); scrollTo(0, 0); push([D.slot]);
}

setInterval(() => {
  const D = S.draft;
  if (view !== 'sess' || !D) return;
  const c = $('#clock'); if (c) c.textContent = clock(D);
  if (D.phase === 'rest') {
    const left = restLeft(D), r = $('#rest');
    if (r) r.textContent = left;
    if (left <= 0) { beep(); D.phase = 'work'; save(); render(); }
  }
}, 250);

// ---------- Sheets ----------
const sheet = $('#sheet');
function openSheet(html) { sheet.innerHTML = `<div class="sheet">${html}</div>`; if (!sheet.open) sheet.showModal(); }
sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
const head = t => `<header><h3>${t}</h3><button class="iconbtn" data-act="close" aria-label="Đóng">${icon('x')}</button></header>`;

function exSheet(k) {
  const e = EX[k], st = stepOf(k);
  const q = encodeURIComponent(`${st.id.replace(/[_-]+/g, ' ')} proper form`);
  openSheet(`${head(esc(st.name))}${demo(k, false)}
    <p>${esc(st.cue)}</p>
    <p class="muted" style="margin-top:8px">${e.sets} hiệp × ${repsTxt(st)} · nghỉ ${e.rest} giây. Dừng mỗi hiệp khi còn 1–2 lần nữa là kiệt sức.</p>
    <div class="row"><a class="ghost" style="display:flex;align-items:center;gap:8px;text-decoration:none" href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">${icon('video')}Xem video trên YouTube</a></div>
    ${e.steps.length > 1 ? `<label class="field">Bậc hiện tại
      <select data-k="${k}" id="lvl">${e.steps.map((s, i) => `<option value="${i}" ${i === lv(k) ? 'selected' : ''}>${i + 1}. ${esc(s.name)}</option>`).join('')}</select></label>
      <p class="muted" style="margin-top:6px;font-size:13px">App tự lên bậc khi mọi hiệp đạt ${st.reps[1]} ${unit(st)}. Đổi tay ở đây nếu bài quá khó hoặc quá dễ.</p>` : ''}`);
}

function accountSheet(msg = '', err = false) {
  const acct = !sb ? `<p class="msg err">Không tải được thư viện đồng bộ. Kiểm tra mạng rồi mở lại app.</p>`
    : user ? `<p>Đã đăng nhập: <strong>${esc(user.email)}</strong>. Dữ liệu tự đồng bộ giữa điện thoại và máy tính.</p>
      ${syncState === 'err' ? '<p class="msg err">Lần đồng bộ gần nhất bị lỗi. Dữ liệu vẫn nằm trên máy này; bấm Đồng bộ ngay khi có mạng.</p>' : ''}
      <div class="row"><button class="ghost" data-act="sync">Đồng bộ ngay</button><button class="ghost" data-act="logout">Đăng xuất</button></div>`
    : `<p>Hiện chỉ lưu trên máy này. Đăng nhập cùng một tài khoản trên điện thoại và máy tính để xem chung tiến độ.</p>
      <label class="field">Email<input id="em" type="email" autocomplete="email" inputmode="email"></label>
      <label class="field">Mật khẩu (ít nhất 6 ký tự)<input id="pw" type="password" autocomplete="current-password"></label>
      <div class="row"><button class="go" data-act="login">Đăng nhập</button><button class="ghost" data-act="signup">Tạo tài khoản</button></div>`;
  openSheet(`${head('Tài khoản và cài đặt')}${acct}
    ${msg ? `<p class="msg ${err ? 'err' : 'ok'}" role="status">${esc(msg)}</p>` : ''}
    <h4>Cơ thể và dụng cụ</h4>
    <label class="field">Cân nặng (kg), dùng để tính calo<input id="kg" type="number" inputmode="decimal" min="30" max="200" step="0.5" value="${S.set.kg}"></label>
    <label class="check"><input id="bands" type="checkbox" ${S.set.bands ? 'checked' : ''}>Tôi đã có dây kháng lực (thêm bài kéo dãn dây)</label>
    <h4>Nhắc lịch tập</h4>
    <p>Tạo sự kiện lặp lại Thứ Hai, Tư, Sáu trong ứng dụng Lịch, báo trước 10 phút.</p>
    <label class="field">Giờ tập<input id="at" type="time" value="${S.set.at}"></label>
    <div class="row"><button class="ghost" data-act="ics">Thêm vào Lịch (.ics)</button></div>
    <details><summary>Cơ sở của kế hoạch</summary><ul>
      <li>3 buổi toàn thân mỗi tuần: mỗi nhóm cơ được tập 3 lần/tuần, hợp với người mới.</li>
      <li>Tạ nhẹ vẫn tăng cơ nếu tập gần kiệt sức (khoảng 1–2 lần trước khi kiệt): dải lặp 10–20 lần, hạ chậm 3 giây.</li>
      <li>Tạ chỉ 5 kg nên độ khó tăng bằng số lần, nhịp chậm, bài một chân/một tay và bậc hít đất khó hơn (như r/bodyweightfitness).</li>
      <li>Calo = MET 3,5 × cân nặng × giờ tập (Compendium 2024, mã 02054). Chỉ là ước tính.</li>
      <li>Tăng cân cần ăn dư calo và khoảng 1,6 g đạm/kg/ngày (Morton 2018).</li>
    </ul></details>`);
}

function viErr(m) {
  if (/Invalid login/i.test(m)) return 'Sai email hoặc mật khẩu.';
  if (/not confirmed/i.test(m)) return 'Email chưa được xác nhận. Mở hộp thư, bấm link xác nhận, rồi đăng nhập lại.';
  if (/already registered/i.test(m)) return 'Email này đã có tài khoản. Hãy bấm Đăng nhập.';
  if (/rate limit|too many/i.test(m)) return 'Thử quá nhiều lần. Đợi vài phút rồi thử lại.';
  if (/fetch|network/i.test(m)) return 'Không có mạng. Dữ liệu vẫn lưu trên máy, sẽ đồng bộ khi có mạng.';
  return `Không thực hiện được: ${m}`;
}

async function auth(up) {
  const email = $('#em').value.trim(), password = $('#pw').value;
  if (!email || password.length < 6) return accountSheet('Nhập email và mật khẩu ít nhất 6 ký tự.', true);
  const { data, error } = up
    ? await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } })
    : await sb.auth.signInWithPassword({ email, password });
  if (error) return accountSheet(viErr(error.message), true);
  if (up && !data.session) return accountSheet('Đã gửi email xác nhận. Bấm link trong email, rồi quay lại đây đăng nhập.');
}

function ics() {
  const [h, m] = S.set.at.split(':'), first = nextSlot(addDays(today(), -1));
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Back2shape//VI', 'BEGIN:VEVENT',
    `UID:b2s-${Date.now()}@back2shape`, `DTSTAMP:${stamp}`, `DTSTART:${key(first).replace(/-/g, '')}T${h}${m}00`,
    'DURATION:PT45M', 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR', 'SUMMARY:Tập Back2shape (45 phút)', `URL:${location.href.split('#')[0]}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Đến giờ tập', 'TRIGGER:-PT10M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
  a.download = 'lich-tap-back2shape.ics'; a.click();
}

// ---------- Sync ----------
async function push(days) {
  if (!sb || !user) return;
  const rows = days.map(day => ({ user_id: user.id, day, data: S.s[day] }));
  const { error } = await sb.from('sessions').upsert(rows);
  syncState = error ? 'err' : 'ok'; if (view !== 'sess') render();
}
async function sync() {
  if (!sb || !user) return;
  syncState = 'busy'; if (view === 'home') render();
  const { data, error } = await sb.from('sessions').select('day,data');
  if (error) { syncState = 'err'; if (view === 'home') render(); return; }
  const remote = {};
  for (const r of data) { remote[r.day] = r.data; const l = S.s[r.day]; if (!l || (r.data.u || 0) > (l.u || 0)) S.s[r.day] = r.data; }
  const latest = Object.values(S.s).sort((a, b) => b.u - a.u)[0];
  if (latest?.lvl && latest.u > S.lvlU) { S.lvl = latest.lvl; S.lvlU = latest.u; }
  save();
  const up = Object.keys(S.s).filter(d => !remote[d] || (remote[d].u || 0) < (S.s[d].u || 0));
  if (up.length) await push(up); else syncState = 'ok';
  if (view !== 'sess') render();
}
function saveSettings() {
  save();
  if (user) sb.auth.updateUser({ data: { set: S.set } });
}

// ---------- Events ----------
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const D = S.draft;
  switch (b.dataset.act) {
    case 'start': return start();
    case 'warmdone': D.phase = 'work'; D.cur = prefill(D); save(); return render();
    case 'inc': case 'dec': {
      D.cur = Math.max(0, D.cur + (b.dataset.act === 'inc' ? 1 : -1) * (stepOf(D.ex[D.i]).unit === 's' ? 5 : 1));
      save(); $('#cur').textContent = D.cur; return;
    }
    case 'setdone': return setDone();
    case 'skiprest': D.phase = 'work'; save(); return render();
    case 'more': D.restEnd += 15000; save(); return;
    case 'skipex': D.i++; D.k = 0; if (D.i >= D.ex.length) return finish(); D.cur = prefill(D); D.phase = 'work'; save(); return render();
    case 'end':
      if (!Object.keys(D.log).length) { if (confirm('Chưa có hiệp nào. Bỏ buổi tập này?')) { S.draft = null; save(); wake(false); view = 'home'; render(); } return; }
      if (confirm('Kết thúc và lưu buổi tập?')) finish();
      return;
    case 'home': view = 'home'; summary = null; render(); return scrollTo(0, 0);
    case 'formula': showF = !showF; return render();
    case 'ex': return exSheet(b.dataset.k);
    case 'account': return accountSheet();
    case 'close': return sheet.close();
    case 'login': return auth(false);
    case 'signup': return auth(true);
    case 'logout': sb.auth.signOut(); return sheet.close();
    case 'sync': sync(); return sheet.close();
    case 'ics': return ics();
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'kg') { const v = parseFloat(t.value); if (v >= 30 && v <= 200) { S.set.kg = v; saveSettings(); render(); } }
  if (t.id === 'bands') { S.set.bands = t.checked; saveSettings(); render(); }
  if (t.id === 'at' && t.value) { S.set.at = t.value; saveSettings(); }
  if (t.id === 'lvl') { S.lvl[t.dataset.k] = +t.value; S.lvlU = Date.now(); save(); render(); sheet.close(); }
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (S.draft) wake(true);
  sync();
});

if (sb) sb.auth.onAuthStateChange((ev, session) => {
  const was = user?.id; user = session?.user || null;
  if (user && user.id !== was) {
    const set = user.user_metadata?.set;
    if (set) S.set = { ...S.set, ...set };
    // supabase-js deadlocks if its own calls run inside this callback; defer them.
    setTimeout(() => { if (!set) sb.auth.updateUser({ data: { set: S.set } }); sync(); });
    if (sheet.open) sheet.close();
  }
  if (view !== 'sess') render();
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
if (S.draft) { S.draft.cur ??= prefill(S.draft); wake(true); }
render();
