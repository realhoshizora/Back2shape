// Self-check for the schedule and streak logic. Run: node selftest.js
const fs = require('fs'), assert = require('assert');
const src = fs.readFileSync(__dirname + '/app.js', 'utf8');
const dates = src.slice(src.indexOf('// ---------- Dates & schedule'), src.indexOf('// ---------- Exercises'));
const run = new Function('S', 'NOW', `${fs.readFileSync(__dirname + '/plan.js', 'utf8')}
  const RealDate = Date; Date = class extends RealDate { constructor(...a) { a.length ? super(...a) : super(NOW); } };
  ${dates}; return { key, slotOf, letter, streak, parse };`);

const at = (iso, s = {}) => run({ s }, new Date(iso + 'T12:00:00'));
let t = at('2026-11-04'); // Wednesday
assert.equal(t.key(t.slotOf(t.parse('2026-11-08'))), '2026-11-06', 'Sunday belongs to Friday slot');
assert.equal(t.key(t.slotOf(t.parse('2026-11-03'))), '2026-11-02', 'Tuesday belongs to Monday slot');
const L = ['2026-11-02', '2026-11-04', '2026-11-06', '2026-11-09'].map(d => t.letter(t.parse(d))).join('');
assert.ok(L === 'ABAB' || L === 'BABA', 'workouts alternate across weeks: ' + L);

const done = d => Object.fromEntries(d.map(k => [k, { min: 45, kcal: 150 }]));
assert.equal(at('2026-11-04', done(['2026-10-30', '2026-11-02'])).streak(), 2, 'open slot today does not break streak');
assert.equal(at('2026-11-05', done(['2026-11-02', '2026-11-04'])).streak(), 2, 'make-up on Thursday counts for Wednesday');
assert.equal(at('2026-11-06', done(['2026-10-30', '2026-11-04'])).streak(), 1, 'missed Monday breaks the chain');
assert.equal(at('2026-11-04', {}).streak(), 0);
console.log('selftest ok');
