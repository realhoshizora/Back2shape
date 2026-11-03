'use strict';
// Camera rep counting with MediaPipe Pose. Detection runs on the device; video never leaves it.

// Pure counter: feed it a joint angle per frame. A rep = leaving the start state and coming back.
// Thresholds are hysteresis bands (flex <= cfg.flex, ext >= cfg.ext) measured on the plan's exercise photos.
function repCounter(cfg, onRep, onTempo) {
  const start = cfg.start || 'ext';
  let state = null, n = 0, tLeave = null, armed = false;
  return (a, t) => {
    const now = a >= cfg.ext ? 'ext' : a <= cfg.flex ? 'flex' : null;
    if (!now) { if (state === 'ext') tLeave ??= t; return; }
    if (now === state) { if (now === 'ext') tLeave = null; return; }
    if (now === 'flex' && state === 'ext' && cfg.tempo) onTempo((t - (tLeave ?? t)) / 1000);
    if (now === start) { if (armed) onRep(++n); armed = true; } // a rep needs a full cycle from the start position
    state = now; tLeave = null;
  };
}

const Cam = (() => {
  const LIB = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
  const MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
  const JOINT = { elbow: [[11, 13, 15], [12, 14, 16]], knee: [[23, 25, 27], [24, 26, 28]], hip: [[11, 23, 25], [12, 24, 26]] };
  const NAME = { elbow: 'khuỷu tay', knee: 'đầu gối', hip: 'hông' };
  let box, video, cv, g, msg, lm, stream, raf, gen = 0, cfg = null, feed = null, ang = null, lastT = -1;

  function ui() {
    if (box) return;
    box = document.createElement('div'); box.className = 'cam';
    box.innerHTML = '<video playsinline muted autoplay></video><canvas aria-hidden="true"></canvas><p class="cam-msg" role="status"></p>';
    [video, cv, msg] = box.children; g = cv.getContext('2d');
  }
  const say = t => { if (msg && msg.textContent !== t) msg.textContent = t; };
  const angle = (a, b, c, w, h) => {
    const u = [(a.x - b.x) * w, (a.y - b.y) * h], v = [(c.x - b.x) * w, (c.y - b.y) * h];
    return Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v) || 1)))) * 180 / Math.PI;
  };

  async function load() {
    if (lm) return;
    say('Đang tải bộ nhận diện tư thế (khoảng 15 MB, chỉ lần đầu)…');
    const { FilesetResolver, PoseLandmarker } = await import(`${LIB}/vision_bundle.mjs`);
    const files = await FilesetResolver.forVisionTasks(`${LIB}/wasm`);
    const opts = delegate => ({ baseOptions: { modelAssetPath: MODEL, delegate }, runningMode: 'VIDEO', numPoses: 1 });
    try { lm = await PoseLandmarker.createFromOptions(files, opts('GPU')); }
    catch { lm = await PoseLandmarker.createFromOptions(files, opts('CPU')); }
  }

  function draw(s) {
    const w = video.videoWidth, h = video.videoHeight;
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } else g.clearRect(0, 0, w, h);
    if (!s) return;
    g.lineWidth = Math.max(4, w / 100); g.lineCap = 'round'; g.strokeStyle = '#eef2f5';
    g.beginPath(); s.forEach((q, i) => g[i ? 'lineTo' : 'moveTo'](q.x * w, q.y * h)); g.stroke();
    g.fillStyle = '#ff5a1f'; g.beginPath(); g.arc(s[1].x * w, s[1].y * h, g.lineWidth * 1.8, 0, 7); g.fill();
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    if (!cfg || !lm || video.readyState < 2 || video.currentTime === lastT) return;
    lastT = video.currentTime;
    const p = lm.detectForVideo(video, performance.now()).landmarks?.[0];
    if (!p) { draw(null); return say(`Không thấy người. ${cfg.view}`); }
    const sides = JOINT[cfg.joint].map(ix => ix.map(i => p[i]));
    const vis = sides.map(s => Math.min(...s.map(q => q.visibility ?? 1)));
    const s = vis[0] >= vis[1] ? sides[0] : sides[1]; // the side nearer the camera
    draw(s);
    if (Math.max(...vis) < .5) return say(`Chưa thấy rõ ${NAME[cfg.joint]}. ${cfg.view}`);
    const a = angle(...s, video.videoWidth, video.videoHeight);
    ang = ang == null ? a : ang * .5 + a * .5; // light smoothing against jitter
    feed(ang, performance.now());
  }

  return {
    get on() { return !!stream; },
    attach(slot) { ui(); if (slot && box.parentNode !== slot) slot.appendChild(box); if (stream) video.play().catch(() => {}); },
    // Start counting a new set (opens the camera on first use).
    async start(c, onRep) {
      ui(); cfg = c; ang = null;
      feed = repCounter(c, onRep, sec => say(sec < c.tempo * .6
        ? `Hạ chậm hơn: ${sec.toFixed(1).replace(".", ",")} giây (mục tiêu ${c.tempo} giây)` : `Nhịp tốt: hạ ${sec.toFixed(1).replace(".", ",")} giây`));
      if (stream) return say(c.view);
      const my = ++gen;
      try {
        say('Đang mở camera…');
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
        if (my !== gen) return s.getTracks().forEach(t => t.stop());
        stream = s; video.srcObject = s; await video.play().catch(() => {});
        await load();
        if (my !== gen) return;
        say(cfg?.view || ''); cancelAnimationFrame(raf); loop();
      } catch (e) {
        if (my !== gen) return;
        stream?.getTracks().forEach(t => t.stop()); stream = null;
        say(e.name === 'NotAllowedError'
          ? 'Chưa được phép dùng camera. Bật trong Cài đặt → Safari → Camera, rồi thử lại.'
          : `Không mở được camera hoặc bộ nhận diện (${e.message}). Vẫn có thể đếm bằng nút +/−.`);
      }
    },
    idle() { cfg = null; }, // keep the camera warm between sets, stop counting
    stop() { gen++; cfg = null; cancelAnimationFrame(raf); stream?.getTracks().forEach(t => t.stop()); stream = null; if (video) video.srcObject = null; },
  };
})();
