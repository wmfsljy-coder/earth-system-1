/* 지구시스템과학1 Ⅰ-2 판 구조 운동과 지구 내부 구조 — 소단원별 이야기 네 편
   01 대륙을 움직인 범인 / 02 굽은 화산 열 / 03 한라산과 백두산 / 04 지구 속을 본 지진파
   공용 부품: ../assets/theme.js (sthUnit·sthGate·sthWork), ../assets/story.js (sthStory·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

window.sthUnit("esys-1-2");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
var D2R = Math.PI / 180, R2D = 180 / Math.PI;
function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
function paper(ctx, W, H) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = v("--panel"); ctx.fillRect(0, 0, W, H); }
function text(ctx, s, x, y, o) {
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 12) + "px " + FONT;
  ctx.fillStyle = o.c || v("--ink"); ctx.textAlign = o.a || "left";
  ctx.fillText(s, x, y);
}
function box(ctx, x, y, w, h, fill, alpha) {
  ctx.save(); if (alpha != null) ctx.globalAlpha = alpha;
  ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill(); ctx.restore();
}
function num(x, d) { return x.toLocaleString(undefined, { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
function wrap(ctx, s, x, y, maxW, lh, o) {
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 11.5) + "px " + FONT;
  var line = "", lines = [], i;
  for (i = 0; i < s.length; i++) {
    var t = line + s.charAt(i);
    if (ctx.measureText(t).width > maxW && line.length) { lines.push(line); line = s.charAt(i); } else line = t;
  }
  lines.push(line);
  for (i = 0; i < lines.length; i++) text(ctx, lines[i], x, y + i * lh, o);
  return lines.length;
}
function rot2(deg, p) {
  var r = deg * D2R, c = Math.cos(r), s = Math.sin(r);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
}
function poly(ctx, pts, cx, cy, fill, stroke) {
  ctx.beginPath();
  for (var i = 0; i < pts.length; i++) {
    var x = cx + pts[i][0], y = cy + pts[i][1];
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

/* =========================================================================
   이야기 ① 대륙을 움직인 범인
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  /* ---- 장면 1 : 첫 추리 ---- */
  window.sthGate({
    gate: "g1", key: "p1", title: "조사관의 첫 추리",
    question: "베게너가 끝내 답하지 못한 물음입니다. 무엇이 대륙을 움직였을까요?",
    options: [
      "㉠ 대륙이 단단한 해저를 헤치고 스스로 밀고 나아갔다",
      "㉡ 대륙 아래 맨틀이 천천히 돌면서 대륙을 실어 날랐다",
      "㉢ 해저 자체가 새로 만들어져 넓어지면서 대륙까지 함께 옮겼다"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 장면 2 : 복각 ---- */
  function incl(lat) { return Math.atan(2 * Math.tan(lat * D2R)) * R2D; }

  (function () {
    var canvas = $("a-c1"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var lat = 0, got = window.sthState("a2") || { a: false, b: false };

    function draw() {
      paper(ctx, W, H);
      var cx = 215, cy = 190, R = 132, I = incl(lat);

      /* 지구 단면과 자기력선 */
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = v("--cold"); ctx.lineWidth = 1.4; ctx.globalAlpha = .6;
      [60, 92, 124, 156].forEach(function (b) {
        ctx.beginPath(); ctx.moveTo(cx, cy - R);
        ctx.bezierCurveTo(cx + b, cy - R * .55, cx + b, cy + R * .55, cx, cy + R); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - R);
        ctx.bezierCurveTo(cx - b, cy - R * .55, cx - b, cy + R * .55, cx, cy + R); ctx.stroke();
      });
      ctx.globalAlpha = 1;
      ctx.strokeStyle = v("--line"); ctx.setLineDash([4, 4]); ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(cx - R - 12, cy); ctx.lineTo(cx + R + 12, cy); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "적도 0°", cx - R - 16, cy + 4, { s: 10.5, c: v("--mist"), a: "right" });
      text(ctx, "N 자북극", cx, cy - R - 12, { s: 11, w: "800", a: "center", c: v("--mist") });
      text(ctx, "S", cx, cy + R + 22, { s: 11, w: "800", a: "center", c: v("--mist") });

      /* 그 위도의 자침 */
      var th = lat * D2R;
      var sx = cx + R * Math.cos(th), sy = cy - R * Math.sin(th);
      var tg = [-Math.sin(th), -Math.cos(th)];         /* 수평면(북쪽) */
      var iw = [-Math.cos(th), Math.sin(th)];          /* 지구 중심 쪽 */
      ctx.strokeStyle = v("--mist"); ctx.setLineDash([3, 3]); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(sx - tg[0] * 46, sy - tg[1] * 46); ctx.lineTo(sx + tg[0] * 46, sy + tg[1] * 46); ctx.stroke();
      ctx.setLineDash([]);
      var ir = I * D2R;
      var dx = Math.cos(ir) * tg[0] + Math.sin(ir) * iw[0];
      var dy = Math.cos(ir) * tg[1] + Math.sin(ir) * iw[1];
      ctx.strokeStyle = v("--coral"); ctx.fillStyle = v("--coral"); ctx.lineWidth = 4;
      window.drawArrow(ctx, sx - dx * 18, sy - dy * 18, sx + dx * 50, sy + dy * 50, 12);
      ctx.fillStyle = v("--panel"); ctx.strokeStyle = v("--teal"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(sx, sy, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      text(ctx, "복각 " + I.toFixed(1) + "°", clamp(sx + 16, 0, 330), sy + 26, { s: 12, w: "900", c: v("--coral-700") });

      /* 오른쪽 : 복각 - 위도 그래프 */
      var x0 = 480, x1 = 866, y0 = 56, y1 = 320;
      text(ctx, "위도에 따른 복각 — tan(복각) = 2 × tan(위도)", x0, 36, { s: 13, w: "800" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0, (y0 + y1) / 2); ctx.lineTo(x1, (y0 + y1) / 2); ctx.stroke();
      function gx(L) { return x0 + (L + 90) / 180 * (x1 - x0); }
      function gy(Iv) { return y1 - (Iv + 90) / 180 * (y1 - y0); }
      [-90, -45, 0, 45, 90].forEach(function (L) {
        text(ctx, L + "°", gx(L), y1 + 18, { s: 10, c: v("--mist"), a: "center" });
      });
      [-90, 0, 90].forEach(function (Iv) {
        text(ctx, Iv + "°", x0 - 6, gy(Iv) + 4, { s: 10, c: v("--mist"), a: "right" });
      });
      text(ctx, "위도 →", (x0 + x1) / 2, y1 + 36, { s: 11, c: v("--mist"), a: "center" });
      text(ctx, "복각", x0 - 6, y0 - 6, { s: 11, c: v("--mist"), a: "right" });
      ctx.strokeStyle = v("--teal"); ctx.lineWidth = 3; ctx.beginPath();
      for (var k = 0; k <= 180; k++) {
        var L = -90 + k, xx = gx(L), yy = gy(incl(L));
        if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      /* 찾아야 할 두 값 */
      [[73.9, "㉮ 73.9°", got.a], [36.1, "㉯ 36.1°", got.b]].forEach(function (t) {
        var yy = gy(t[0]);
        ctx.strokeStyle = t[2] ? v("--green") : v("--amber"); ctx.setLineDash([5, 4]); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x1, yy); ctx.stroke(); ctx.setLineDash([]);
        text(ctx, (t[2] ? "✔ " : "") + t[1], x1 - 4, yy - 7, { s: 11, w: "800", a: "right", c: t[2] ? v("--green-700") : v("--amber-700") });
      });
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(gx(lat), gy(I), 6, 0, Math.PI * 2); ctx.fill();

      $("a-c1-info").innerHTML = "위도 <b>" + lat + "°</b> 에서 만들어진 암석에는 복각 <b>" + I.toFixed(1) + "°</b> 가 기록됩니다. "
        + (lat > 0 ? "북반구에서는 자침의 N극이 아래로 기웁니다(복각 +)." : (lat < 0 ? "남반구에서는 자침의 N극이 위로 들립니다(복각 −)." : "적도에서는 자침이 수평입니다(복각 0)."))
        + " 그래서 <b>암석의 복각을 재면 그 암석이 만들어진 때의 위도</b>를 알 수 있습니다.";
    }
    canvas._redraw = draw;

    function mission() {
      if (got.a) done("m1-2a");
      if (got.b) done("m1-2b");
      if (got.a && got.b) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>오늘 노르웨이 남부는 <b>북위 60°</b>, 그런데 3억 년 전 그곳의 용암은 <b>북위 20°</b>에서 굳었습니다. 실제로 유럽의 석탄기 지층에는 열대 늪지 숲이 쌓여 만들어진 석탄이 들어 있습니다. 그 땅은 <b>적도 부근에서 북쪽으로 4,000 km 넘게 옮겨 온 것</b>입니다.");
        ep.clear(1);
      }
    }
    $("a-lat").addEventListener("input", function (e) {
      lat = +e.target.value;
      $("a-lat-val").textContent = lat + "°";
      var I = incl(lat), ch = false;
      if (!got.a && Math.abs(I - 73.9) <= 0.5) { got.a = true; ch = true; }
      if (!got.b && Math.abs(I - 36.1) <= 0.5) { got.b = true; ch = true; }
      if (ch) { window.sthState("a2", got); mission(); }
      draw();
    });
    draw(); mission();
  })();

  /* ---- 장면 3 : 겉보기 극이동 곡선 ---- */
  var AGES = [400, 300, 200, 100, 0];
  var NPOLE = [[-57, 36], [-36, 33], [-12, 29], [0, 16], [0, 0]];
  var NA_POLY = [[-120, -20], [-95, -70], [-50, -95], [-20, -70], [-30, -25], [-45, 20], [-85, 35], [-115, 20]];
  var EU_PANG = [[-16, -66], [22, -88], [58, -60], [62, -14], [35, 18], [-4, 22], [-26, -20]];
  var PIV = [-60, -40], TH0 = 18, DD = [55, 20], PXDEG = 160 / 90;   /* 1° = 1.78 px */

  function fwd(p) { var q = rot2(TH0, [p[0] - PIV[0], p[1] - PIV[1]]); return [q[0] + PIV[0] + DD[0], q[1] + PIV[1] + DD[1]]; }
  function back(p, c) {
    var q = [p[0] - DD[0] * c, p[1] - DD[1] * c];
    var r = rot2(-TH0 * c, [q[0] - PIV[0], q[1] - PIV[1]]);
    return [r[0] + PIV[0], r[1] + PIV[1]];
  }
  var EU_NOW = EU_PANG.map(fwd), EUPOLE_NOW = NPOLE.map(fwd);
  function gap(c) {
    var s = 0;
    for (var i = 0; i < NPOLE.length; i++) {
      var q = back(EUPOLE_NOW[i], c);
      s += Math.sqrt((q[0] - NPOLE[i][0]) * (q[0] - NPOLE[i][0]) + (q[1] - NPOLE[i][1]) * (q[1] - NPOLE[i][1]));
    }
    return s / NPOLE.length / PXDEG;
  }

  (function () {
    var canvas = $("a-c2"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var c = 0, okA = !!window.sthState("a3a"), okB = !!window.sthState("a3b");

    function draw() {
      paper(ctx, W, H);
      var t = c / 100, g = gap(t);
      var cx = 225, cy = 220, R = 160;

      /* 왼쪽 : 북극에서 내려다본 지도 */
      text(ctx, "북극에서 내려다본 지도 (모식도)", 40, 34, { s: 13, w: "800" });
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = v("--line"); ctx.globalAlpha = .6; ctx.lineWidth = 1;
      [R / 3, R * 2 / 3].forEach(function (r) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); });
      ctx.globalAlpha = 1;
      poly(ctx, NA_POLY, cx, cy, v("--coral"), v("--coral-700"));
      var eu = EU_NOW.map(function (p) { return back(p, t); });
      poly(ctx, eu, cx, cy, v("--cold"), v("--brand-700"));
      text(ctx, "북아메리카", cx - 78, cy - 30, { s: 11.5, w: "900", a: "center", c: v("--on-accent") });
      var ec = eu.reduce(function (a, p) { return [a[0] + p[0] / eu.length, a[1] + p[1] / eu.length]; }, [0, 0]);
      text(ctx, "유럽", cx + ec[0], cy + ec[1] + 4, { s: 11.5, w: "900", a: "center", c: v("--on-accent") });
      text(ctx, "● 북극", cx, cy - 4, { s: 10.5, w: "800", a: "center", c: v("--mist") });
      text(ctx, t > 0.9 ? "대서양이 닫혀 두 대륙이 붙었습니다 (판게아)" : "두 대륙 사이가 대서양입니다", 40, H - 14, { s: 11.5, c: v("--mist") });

      /* 오른쪽 : 극 부근 확대 — 겉보기 극이동 곡선 */
      var px = 660, py = 215, S = 1.9, PR = 150;
      text(ctx, "기준판 — 시대별 자북극이 있던 자리", 508, 34, { s: 13, w: "800" });
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.arc(px, py, PR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.stroke();
      ctx.globalAlpha = .6; ctx.lineWidth = 1;
      [PR / 3, PR * 2 / 3].forEach(function (r) { ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.stroke(); });
      ctx.globalAlpha = 1;
      function curve(pts, col, tag) {
        ctx.strokeStyle = v(col); ctx.lineWidth = 3; ctx.beginPath();
        pts.forEach(function (p, i) {
          var x = px + p[0] * S, y = py + p[1] * S;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
        pts.forEach(function (p, i) {
          var x = px + p[0] * S, y = py + p[1] * S;
          ctx.fillStyle = v(col); ctx.beginPath(); ctx.arc(x, y, 5.5, 0, Math.PI * 2); ctx.fill();
          if (tag) text(ctx, AGES[i] + (i === AGES.length - 1 ? " Ma (현재)" : " Ma"), x + 9, y + 4, { s: 10, c: v("--mist") });
        });
      }
      curve(NPOLE, "--coral", true);
      curve(EUPOLE_NOW.map(function (p) { return back(p, t); }), "--cold", false);
      text(ctx, "● 북아메리카에서 구한 곡선", 508, 372, { s: 11.5, w: "800", c: v("--coral-700") });
      text(ctx, "● 유럽에서 구한 곡선", 508, 392, { s: 11.5, w: "800", c: v("--brand-700") });
      text(ctx, "두 곡선의 어긋남 " + g.toFixed(1) + "°", 866, 372, { s: 15, w: "900", a: "right", c: g <= 3 ? v("--green-700") : v("--amber-700") });

      $("a-c2-info").innerHTML = "유럽을 <b>" + c + "%</b> 되돌린 상태입니다. 두 극이동 곡선의 어긋남은 <b>" + g.toFixed(1) + "°</b>. "
        + (g <= 3 ? "거의 하나로 겹쳤습니다. 자북극은 하나였고, <b>움직인 쪽은 대륙</b>이었습니다."
                  : "아직 어긋나 있습니다. 대서양을 더 닫아 보세요.");
    }
    canvas._redraw = draw;

    function check() {
      if (okA) done("m1-3a");
      if (okB) done("m1-3b");
      if (okA && okB) {
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>대륙을 판게아로 되돌리면 두 곡선이 겹칩니다. 곧 <b>자북극은 제자리에 있었고, 두 대륙이 서로 갈라져 나간 것</b>입니다.");
        ep.clear(2);
      }
    }
    $("a-close").addEventListener("input", function (e) {
      c = +e.target.value;
      $("a-close-val").textContent = c + "%";
      if (!okA && gap(c / 100) <= 3.0) { okA = true; window.sthState("a3a", 1); check(); }
      draw();
    });
    window.sthPick({
      mount: "a-q1",
      q: "두 대륙에서 각각 구한 겉보기 극이동 곡선이, 대륙을 판게아로 되돌렸을 때 하나로 겹칩니다. 이것이 뜻하는 바는?",
      options: [
        "시대마다 자북극이 두 개씩 있었다",
        "자북극이 움직인 것이 아니라, 두 대륙이 서로 갈라져 나갔다",
        "대륙마다 복각을 재는 방법이 달라 생긴 오차다",
        "그 시대에는 지구 자기장이 없었다"
      ],
      answer: 1,
      why: [
        "자기장의 N극이 동시에 두 곳에 있을 수는 없습니다. 그래서 ‘겉보기’ 극이동 곡선이라고 부릅니다.",
        "맞습니다. 극은 거의 제자리에 있었고, 대륙이 움직였기 때문에 대륙마다 다른 곡선이 나온 것입니다. 되돌리면 하나가 됩니다.",
        "측정 방법은 같습니다. 어긋남이 대륙을 되돌리는 것만으로 사라진다는 점이 핵심입니다.",
        "자기장이 없었다면 암석에 복각 자체가 기록되지 않았을 것입니다."
      ],
      onDone: function () { okB = true; window.sthState("a3b", 1); check(); }
    });
    draw(); check();
  })();

  /* ---- 장면 4 : 해저 확장 속도 ---- */
  (function () {
    var canvas = $("a-c3"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var ATL = [[10, 250], [20, 500], [40, 1000], [60, 1500]];
    var PAC = [[5, 300], [10, 600], [20, 1200], [30, 1800]];
    var va = 1.0, vp = 1.0, got = window.sthState("a4") || { a: 0, p: 0 };

    function worst(pts, rate) {
      var m = 0;
      pts.forEach(function (q) { m = Math.max(m, Math.abs(rate * 10 * q[0] - q[1])); });
      return m;
    }
    function draw() {
      paper(ctx, W, H);
      /* 왼쪽 : 해령의 고지자기 줄무늬 */
      text(ctx, "해령을 가로지르며 잰 고지자기 줄무늬", 40, 32, { s: 13, w: "800" });
      var rx = 235, top = 58, bot = 268;
      for (var i = 0; i < 8; i++) {
        var wdt = 24;
        ctx.fillStyle = i % 2 === 0 ? v("--ink") : v("--card");
        ctx.fillRect(rx - (i + 1) * wdt, top, wdt, bot - top);
        ctx.fillRect(rx + i * wdt, top, wdt, bot - top);
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 1;
        ctx.strokeRect(rx - (i + 1) * wdt, top, wdt, bot - top);
        ctx.strokeRect(rx + i * wdt, top, wdt, bot - top);
      }
      ctx.fillStyle = v("--coral"); ctx.fillRect(rx - 5, top - 10, 10, bot - top + 20);
      text(ctx, "해령", rx, top - 16, { s: 12, w: "900", a: "center", c: v("--coral-700") });
      text(ctx, "■ 정자극기   □ 역자극기 — 해령을 축으로 좌우 대칭", 40, bot + 22, { s: 11, c: v("--mist") });
      text(ctx, "나이 많음 ←", 40, bot + 42, { s: 11, c: v("--mist") });
      text(ctx, "→ 나이 많음", 430, bot + 42, { s: 11, c: v("--mist"), a: "right" });
      text(ctx, "해령에서 멀어질수록 해양 지각의 나이가 많아집니다.", 40, bot + 64, { s: 11.5, c: v("--mist") });

      /* 오른쪽 : 나이 - 거리 그래프 */
      var x0 = 520, x1 = 866, y0 = 56, y1 = 320, AMAX = 80, DMAX = 2000;
      text(ctx, "해양 지각의 나이와 해령으로부터의 거리", x0, 32, { s: 13, w: "800" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      function GX(a) { return x0 + a / AMAX * (x1 - x0); }
      function GY(d) { return y1 - d / DMAX * (y1 - y0); }
      [0, 20, 40, 60, 80].forEach(function (a) { text(ctx, a + "", GX(a), y1 + 18, { s: 10, c: v("--mist"), a: "center" }); });
      [0, 500, 1000, 1500, 2000].forEach(function (d) {
        text(ctx, num(d), x0 - 6, GY(d) + 4, { s: 10, c: v("--mist"), a: "right" });
        ctx.strokeStyle = v("--line"); ctx.globalAlpha = .4;
        ctx.beginPath(); ctx.moveTo(x0, GY(d)); ctx.lineTo(x1, GY(d)); ctx.stroke(); ctx.globalAlpha = 1;
      });
      text(ctx, "나이 (백만 년) →", (x0 + x1) / 2, y1 + 36, { s: 11, c: v("--mist"), a: "center" });
      text(ctx, "거리 (km)", x0 - 6, y0 - 8, { s: 11, c: v("--mist"), a: "right" });
      function line(rate, col) {
        ctx.strokeStyle = v(col); ctx.lineWidth = 3; ctx.beginPath();
        var aEnd = Math.min(AMAX, DMAX / (rate * 10));
        ctx.moveTo(GX(0), GY(0)); ctx.lineTo(GX(aEnd), GY(rate * 10 * aEnd)); ctx.stroke();
      }
      function pts(arr, col) {
        arr.forEach(function (q) {
          ctx.fillStyle = v(col); ctx.beginPath(); ctx.arc(GX(q[0]), GY(q[1]), 6, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = v("--panel"); ctx.lineWidth = 2; ctx.stroke();
        });
      }
      line(va, "--amber"); line(vp, "--brand");
      pts(ATL, "--amber"); pts(PAC, "--brand");
      text(ctx, "🟠 대서양 관측점", x0 + 6, y0 + 14, { s: 11, w: "800", c: v("--amber-700") });
      text(ctx, "🔵 동태평양 관측점", x0 + 6, y0 + 32, { s: 11, w: "800", c: v("--brand-700") });

      var ea = worst(ATL, va), ep2 = worst(PAC, vp);
      $("a-c3-info").innerHTML = "🟠 대서양 " + va.toFixed(1) + " cm/년 → 관측점과의 최대 차이 <b>" + num(ea) + " km</b>"
        + (got.a ? " ✅" : "") + "<br>🔵 동태평양 " + vp.toFixed(1) + " cm/년 → 관측점과의 최대 차이 <b>" + num(ep2) + " km</b>" + (got.p ? " ✅" : "")
        + "<br>거리 = 확장 속도 × 나이 입니다. 계산선이 점들 위를 지나가면 맞습니다.";
    }
    canvas._redraw = draw;

    function check() {
      if (got.a) done("m1-4a");
      if (got.p) done("m1-4b");
      if (got.a && got.p) {
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>대서양 중앙 해령은 한쪽으로 약 <b>2.5 cm/년</b>, 동태평양 해령은 약 <b>6 cm/년</b>. 손톱이 자라는 속도로 바다가 넓어지고 있었습니다. 1억 년이면 각각 2,500 km, 6,000 km입니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    $("a-va").addEventListener("input", function (e) {
      va = +e.target.value; $("a-va-val").textContent = va.toFixed(1);
      if (!got.a && worst(ATL, va) <= 100) { got.a = va; window.sthState("a4", got); check(); }
      draw();
    });
    $("a-vp").addEventListener("input", function (e) {
      vp = +e.target.value; $("a-vp-val").textContent = vp.toFixed(1);
      if (!got.p && worst(PAC, vp) <= 100) { got.p = vp; window.sthState("a4", got); check(); }
      draw();
    });
    draw(); check();
  })();

  /* ---- 장면 5 : 결말 ---- */
  function finish() {
    var g = window.sthState("a4") || {};
    window.sthState("r1", "해결 · 확장 속도 대서양 " + (g.a ? g.a.toFixed(1) : "-") + " · 동태평양 " + (g.p ? g.p.toFixed(1) : "-") + " cm/년");
  }
  function vs() {
    var p = window.sthState("p1") || "";
    var g = window.sthState("a4") || {};
    $("a-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>"
      + (p.indexOf("㉢") === 0 ? "정확히 짚었습니다. 해저가 새로 만들어지며 넓어진다는 것이 해양저 확장설입니다."
        : (p.indexOf("㉡") === 0 ? "절반은 맞았습니다. 맨틀 대류는 원동력의 하나이지만, 결정적인 증거는 ‘해저가 새로 만들어진다’는 쪽이었습니다."
          : "베게너와 같은 그림이었지요. 대륙이 해저를 헤치고 가는 것이 아니라, 해저째 옮겨 간 것이었습니다."))
      + "<br><b>내가 잰 확장 속도</b> 대서양 " + (g.a ? g.a.toFixed(1) : "-") + " cm/년 · 동태평양 " + (g.p ? g.p.toFixed(1) : "-") + " cm/년";
  }
  ep.onShow(function (i) { if (i === 4) vs(); });
  if (ep.at() === 4) vs();

  window.sthWork({
    mount: "wk1", unitLabel: "[지구시스템과학1 Ⅰ-2] 이야기 ① 대륙을 움직인 범인",
    items: [
      { id: "e1a", label: "베게너에게 보내는 답장", hint: "‘무엇이 대륙을 움직였는가’라는 물음에, 고지자기(복각·겉보기 극이동 곡선)와 해양저 확장의 증거를 들어 답하세요." },
      { id: "e1b", label: "증거가 이론을 바꾼 과정", hint: "대륙 이동설 → 맨틀 대류설 → 해양저 확장설 → 판구조론으로 이어진 흐름에서, 새 관측 기술이 어떤 증거를 더해 주었는지 쓰세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ② 굽은 화산 열
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "g2", key: "p2", title: "조사관의 첫 추리",
    question: "판 경계에서 수천 km 떨어진 태평양 한가운데에 화산이 6,000 km나 줄지어 있습니다. 왜일까요?",
    options: [
      "㉠ 그 아래에 아직 찾지 못한 판 경계가 숨어 있다",
      "㉡ 맨틀 깊은 곳의 거의 고정된 열기둥 위를 판이 지나갔다",
      "㉢ 섬들이 한꺼번에 만들어진 뒤 갈라져 흩어졌다"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 장면 2 : 판 경계 세 가지 ---- */
  (function () {
    var canvas = $("b-c1"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var ang = 0, spd = 5, got = window.sthState("b2") || { c: false, t: false, d: false };

    function kind(a) { return a <= 60 ? "수렴형" : (a >= 120 ? "발산형" : "보존형"); }
    function draw() {
      paper(ctx, W, H);
      var k = kind(ang), perp = spd * Math.cos(ang * D2R), para = spd * Math.sin(ang * D2R);
      var col = k === "수렴형" ? "--cold" : (k === "발산형" ? "--coral" : "--violet");

      /* 위 : 평면도 */
      text(ctx, "위에서 본 두 판 (왼쪽 판을 고정하고 오른쪽 판의 상대 운동을 봅니다)", 40, 30, { s: 13, w: "800" });
      box(ctx, 48, 48, 390, 120, v("--card-2"));
      box(ctx, 452, 48, 390, 120, v("--card-2"));
      text(ctx, "판 A (고정)", 243, 116, { s: 13, w: "900", a: "center", c: v("--mist") });
      text(ctx, "판 B", 647, 116, { s: 13, w: "900", a: "center", c: v("--mist") });
      ctx.strokeStyle = v(col); ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(445, 44); ctx.lineTo(445, 172); ctx.stroke();
      var ax = -Math.cos(ang * D2R), ay = Math.sin(ang * D2R), L = 10 + spd * 4;
      ctx.strokeStyle = v("--ink"); ctx.fillStyle = v("--ink"); ctx.lineWidth = 4;
      window.drawArrow(ctx, 647, 92, 647 + ax * L, 92 + ay * L, 13);
      text(ctx, "θ = " + ang + "°, " + spd.toFixed(1) + " cm/년", 647, 186, { s: 11.5, w: "800", a: "center", c: v("--mist") });

      /* 아래 : 단면도 */
      text(ctx, "경계에서 일어나는 일 — " + k, 40, 214, { s: 13, w: "800", c: v(col + "-700") || v("--ink") });
      var sea = 258, bot = 388, mid = 445;
      box(ctx, 40, sea, 820, bot - sea, v("--card-2"));
      if (k === "수렴형") {
        ctx.fillStyle = v("--teal"); ctx.beginPath();
        ctx.moveTo(40, sea + 18); ctx.lineTo(mid - 30, sea + 18); ctx.lineTo(mid + 10, sea + 46); ctx.lineTo(40, sea + 46); ctx.closePath(); ctx.fill();
        ctx.save(); ctx.translate(mid - 30, sea + 20); ctx.rotate(0.85);
        ctx.fillStyle = v("--teal"); ctx.fillRect(0, 0, 124, 26); ctx.restore();
        ctx.fillStyle = v("--violet"); ctx.fillRect(mid + 16, sea + 18, 844 - mid - 16 - 20, 28);
        ctx.fillStyle = v("--coral"); ctx.beginPath();
        ctx.moveTo(660, sea + 18); ctx.lineTo(630, sea + 54); ctx.lineTo(690, sea + 54); ctx.closePath(); ctx.fill();
        text(ctx, "▼ 해구", mid - 6, sea + 12, { s: 11.5, w: "800", a: "center", c: v("--cold") });
        text(ctx, "섭입하는 판", mid + 96, sea + 96, { s: 11.5, w: "800", c: v("--teal-700") });
        text(ctx, "🌋 호상 열도의 화산", 704, sea + 40, { s: 11.5, w: "800", c: v("--coral-700") });
        text(ctx, "밀도가 큰 판이 다른 판 아래로 가라앉습니다. 깊은 지진과 화산이 함께 일어나고, 지각이 사라집니다.", 46, bot - 14, { s: 11.5, c: v("--mist") });
      } else if (k === "발산형") {
        ctx.fillStyle = v("--teal"); ctx.fillRect(48, sea + 22, mid - 78, 26);
        ctx.fillStyle = v("--teal"); ctx.fillRect(mid + 30, sea + 22, 812 - mid - 30, 26);
        ctx.fillStyle = v("--coral"); ctx.beginPath();
        ctx.moveTo(mid, sea + 4); ctx.lineTo(mid - 44, sea + 48); ctx.lineTo(mid + 44, sea + 48); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = v("--coral"); ctx.fillStyle = v("--coral"); ctx.lineWidth = 4;
        window.drawArrow(ctx, mid, bot - 20, mid, sea + 56, 12);
        ctx.strokeStyle = v("--ink"); ctx.fillStyle = v("--ink"); ctx.lineWidth = 3;
        window.drawArrow(ctx, mid - 60, sea + 34, mid - 150, sea + 34, 11);
        window.drawArrow(ctx, mid + 60, sea + 34, mid + 150, sea + 34, 11);
        text(ctx, "▲ 해령", mid, sea - 6, { s: 11.5, w: "800", a: "center", c: v("--coral-700") });
        text(ctx, "상승하는 마그마", mid + 14, bot - 44, { s: 11.5, w: "800", c: v("--coral-700") });
        text(ctx, "두 판이 멀어진 틈으로 마그마가 올라와 굳으며 새 해양 지각이 만들어집니다.", 46, bot - 14, { s: 11.5, c: v("--mist") });
      } else {
        ctx.fillStyle = v("--teal"); ctx.fillRect(48, sea + 22, mid - 60, 40);
        ctx.fillStyle = v("--violet"); ctx.fillRect(mid + 12, sea + 22, 812 - mid - 12, 40);
        ctx.strokeStyle = v("--violet"); ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(mid, sea + 10); ctx.lineTo(mid, bot - 30); ctx.stroke();
        text(ctx, "⊗ 저쪽으로 미끄러짐", mid - 24, sea + 96, { s: 12, w: "800", a: "right", c: v("--teal-700") });
        text(ctx, "⊙ 이쪽으로 미끄러짐", mid + 24, sea + 96, { s: 12, w: "800", c: v("--violet-700") });
        text(ctx, "두 판이 어긋나며 스쳐 지나갑니다(변환 단층). 지각이 새로 생기지도, 사라지지도 않습니다.", 46, bot - 14, { s: 11.5, c: v("--mist") });
      }

      var wdt = Math.abs(perp) * 100;
      $("b-c1-info").innerHTML = "θ = " + ang + "° 이므로 경계에 <b>수직인 성분</b>은 " + perp.toFixed(2) + " cm/년, <b>나란한 성분</b>은 "
        + para.toFixed(2) + " cm/년입니다. → <b>" + k + " 경계</b><br>"
        + (k === "보존형" ? "수직 성분이 거의 0이라 1,000만 년이 지나도 지각이 생기거나 사라지지 않습니다."
          : "이대로 1,000만 년이 흐르면 폭 <b>" + num(wdt) + " km</b>의 지각이 " + (perp > 0 ? "<b>사라집니다</b>." : "<b>새로 만들어집니다</b>."));
    }
    canvas._redraw = draw;

    function check() {
      if (got.c) done("m2-2a");
      if (got.t) done("m2-2b");
      if (got.d) done("m2-2c");
      if (got.c && got.t && got.d) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>경계의 종류를 가르는 것은 <b>상대 운동의 방향</b> 하나입니다. 다가서면 해구, 멀어지면 해령, 스쳐 지나가면 변환 단층. 그런데 하와이는 이 어느 경계에도 있지 않습니다.");
        ep.clear(1);
      }
    }
    function upd() {
      var k = kind(ang), ch = false;
      if (k === "수렴형" && !got.c) { got.c = ch = true; }
      if (k === "보존형" && !got.t) { got.t = ch = true; }
      if (k === "발산형" && !got.d) { got.d = ch = true; }
      if (ch) { window.sthState("b2", got); check(); }
      draw();
    }
    $("b-ang").addEventListener("input", function (e) { ang = +e.target.value; $("b-ang-val").textContent = ang + "°"; upd(); });
    $("b-spd").addEventListener("input", function (e) { spd = +e.target.value; $("b-spd-val").textContent = spd.toFixed(1); draw(); });
    draw(); check();
  })();

  /* ---- 장면 3 : 판을 움직이는 힘 ---- */
  (function () {
    var canvas = $("b-c2"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var slab = 0, got = window.sthState("b3") || { slow: false, fast: false };
    var REAL = [["태평양판", 9.0], ["나스카판", 7.4], ["인도-호주판", 6.2], ["아프리카판", 2.1], ["북아메리카판", 1.9], ["유라시아판", 0.9]];
    function speed(s) { return 1.0 + 0.09 * s; }

    function draw() {
      paper(ctx, W, H);
      var u = speed(slab);
      /* 단면도 */
      text(ctx, "해령 밀기와 판 끌기", 40, 30, { s: 13, w: "800" });
      var sea = 66, bot = 236;
      box(ctx, 40, sea, 480, bot - sea, v("--card-2"));
      ctx.fillStyle = v("--coral"); ctx.beginPath();
      ctx.moveTo(86, sea + 16); ctx.lineTo(56, sea + 52); ctx.lineTo(116, sea + 52); ctx.closePath(); ctx.fill();
      text(ctx, "해령", 86, sea + 12, { s: 11, w: "800", a: "center", c: v("--coral-700") });
      ctx.fillStyle = v("--teal"); ctx.fillRect(86, sea + 30, 300, 22);
      ctx.strokeStyle = v("--coral"); ctx.fillStyle = v("--coral"); ctx.lineWidth = 3;
      window.drawArrow(ctx, 120, sea + 41, 196, sea + 41, 11);
      text(ctx, "해령 밀기", 124, sea + 70, { s: 11, w: "800", c: v("--coral-700") });
      text(ctx, "▼ 해구", 392, sea + 12, { s: 11, w: "800", a: "center", c: v("--cold") });
      var sl = 24 + slab * 1.1;
      ctx.save(); ctx.translate(386, sea + 32); ctx.rotate(0.95);
      ctx.fillStyle = v("--teal"); ctx.fillRect(0, 0, sl, 22); ctx.restore();
      if (slab > 0) {
        ctx.strokeStyle = v("--violet"); ctx.fillStyle = v("--violet"); ctx.lineWidth = 3;
        window.drawArrow(ctx, 404, sea + 56, 404 + Math.min(sl, 90) * 0.58, sea + 56 + Math.min(sl, 90) * 0.82, 11);
        text(ctx, "판 끌기", 452, sea + 118, { s: 11, w: "800", c: v("--violet-700") });
      }
      text(ctx, "섭입한 판의 길이 = 섭입대 비율 " + slab + "%", 46, bot - 14, { s: 11.5, c: v("--mist") });

      /* 막대 그래프 */
      var x0 = 640, y0 = 62, bw = 200;
      text(ctx, "실제 판의 이동 속도 (cm/년)", 540, 30, { s: 13, w: "800" });
      REAL.forEach(function (r, i) {
        var y = y0 + i * 30;
        ctx.fillStyle = v("--card-2"); ctx.fillRect(x0, y, bw, 16);
        ctx.fillStyle = v("--brand"); ctx.fillRect(x0, y, bw * r[1] / 10, 16);
        text(ctx, r[0], x0 - 6, y + 13, { s: 10.5, w: "800", a: "right", c: v("--mist") });
        text(ctx, r[1].toFixed(1), x0 + bw + 6, y + 13, { s: 10.5, w: "800", c: v("--mist") });
      });
      var yM = y0 + REAL.length * 30 + 12;
      ctx.fillStyle = v("--card-2"); ctx.fillRect(x0, yM, bw, 20);
      ctx.fillStyle = v("--coral"); ctx.fillRect(x0, yM, bw * clamp(u / 10, 0, 1), 20);
      text(ctx, "내 모형", x0 - 6, yM + 15, { s: 11, w: "900", a: "right", c: v("--coral-700") });
      text(ctx, u.toFixed(1), x0 + bw + 6, yM + 15, { s: 11, w: "900", c: v("--coral-700") });

      $("b-c2-info").innerHTML = "섭입대 비율 <b>" + slab + "%</b> → 판의 이동 속도 <b>" + u.toFixed(1) + " cm/년</b>. "
        + (u <= 2.0 ? "가장자리에 해구가 거의 없는 판입니다. <b>유라시아판·아프리카판</b>처럼 느리게 움직입니다."
          : (u >= 9.0 ? "가장자리의 대부분이 해구인 판입니다. <b>태평양판</b>처럼 빠르게 움직입니다."
            : "해구가 늘어날수록 판이 빨라지는 것이 보입니다."));
    }
    canvas._redraw = draw;

    function check() {
      if (got.slow) done("m2-3a");
      if (got.fast) done("m2-3b");
      if (got.slow && got.fast) {
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>해령의 길이보다 <b>섭입대의 길이</b>가 판의 속도를 훨씬 잘 설명합니다. 곧 판을 움직이는 가장 큰 힘은 해령이 미는 힘이 아니라, <b>차갑고 무거운 판이 스스로 가라앉으며 뒤를 끌어당기는 힘(판 끌기)</b>입니다.");
        ep.clear(2);
      }
    }
    $("b-slab").addEventListener("input", function (e) {
      slab = +e.target.value; $("b-slab-val").textContent = slab + "%";
      var u = speed(slab), ch = false;
      if (u <= 2.0 && !got.slow) { got.slow = ch = true; }
      if (u >= 9.0 && !got.fast) { got.fast = ch = true; }
      if (ch) { window.sthState("b3", got); check(); }
      draw();
    });
    draw(); check();
  })();

  /* ---- 장면 4 : 하와이–엠퍼러 해산열 ---- */
  (function () {
    var canvas = $("b-c3"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var vv = 5.0, dir = 270, got = window.sthState("b4") || { v: 0, d: 0 };
    var HX = 740, HY = 400, S = 0.055, AZH = 300, AZE = 345, BEND = 47, ENDA = 81;
    var OBS = [[28, 2400], [47, 3500], [81, 6000]];
    function az(a) { return [Math.sin(a * D2R), -Math.cos(a * D2R)]; }
    function obsPos(d) {
      var u = az(AZH);
      if (d <= 3500) return [HX + u[0] * d * S, HY + u[1] * d * S];
      var b = [HX + u[0] * 3500 * S, HY + u[1] * 3500 * S], w = az(AZE), r = d - 3500;
      return [b[0] + w[0] * r * S, b[1] + w[1] * r * S];
    }
    function modPos(age, rate, dr) {
      var u = az(AZH), km = rate * 10;
      if (age <= BEND) return [HX + u[0] * km * age * S, HY + u[1] * km * age * S];
      var b = [HX + u[0] * km * BEND * S, HY + u[1] * km * BEND * S], w = az(dr), r = km * (age - BEND);
      return [b[0] + w[0] * r * S, b[1] + w[1] * r * S];
    }
    function worstV(rate) {
      var m = 0;
      OBS.forEach(function (q) { m = Math.max(m, Math.abs(rate * 10 * q[0] - q[1])); });
      return m;
    }

    function draw() {
      paper(ctx, W, H);
      text(ctx, "하와이–엠퍼러 해산열 (위에서 본 그림)", 40, 30, { s: 13, w: "800" });
      /* 방위 표시 */
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(80, 100, 34, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = v("--mist"); ctx.fillStyle = v("--mist"); ctx.lineWidth = 2;
      window.drawArrow(ctx, 80, 100, 80, 70, 9);
      text(ctx, "북", 80, 64, { s: 10.5, w: "800", a: "center", c: v("--mist") });
      text(ctx, "서", 40, 104, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "동", 120, 104, { s: 10.5, a: "center", c: v("--mist") });

      /* 관측된 해산열 */
      ctx.strokeStyle = v("--mist"); ctx.lineWidth = 9; ctx.globalAlpha = .45; ctx.lineCap = "round";
      ctx.beginPath();
      var p0 = obsPos(0), pb = obsPos(3500), pe = obsPos(6000);
      ctx.moveTo(p0[0], p0[1]); ctx.lineTo(pb[0], pb[1]); ctx.lineTo(pe[0], pe[1]); ctx.stroke();
      ctx.globalAlpha = 1; ctx.lineCap = "butt";
      OBS.forEach(function (q) {
        var p = obsPos(q[1]);
        ctx.fillStyle = v("--mist"); ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, Math.PI * 2); ctx.fill();
        text(ctx, q[0] + " Ma · " + num(q[1]) + " km", clamp(p[0] + 12, 0, 700), p[1] - 10, { s: 10.5, w: "800", c: v("--mist") });
      });

      /* 내 모형 */
      ctx.strokeStyle = v("--coral"); ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
      var m0 = modPos(0, vv, dir), mb = modPos(BEND, vv, dir), me = modPos(ENDA, vv, dir);
      ctx.beginPath(); ctx.moveTo(m0[0], m0[1]); ctx.lineTo(mb[0], mb[1]); ctx.lineTo(me[0], me[1]); ctx.stroke();
      ctx.setLineDash([]);
      [[28, "--coral"], [47, "--coral"], [81, "--coral"]].forEach(function (q) {
        var p = modPos(q[0], vv, dir);
        ctx.fillStyle = v(q[1]); ctx.beginPath(); ctx.arc(p[0], p[1], 5.5, 0, Math.PI * 2); ctx.fill();
      });

      /* 열점 */
      ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(HX, HY, 11, 0, Math.PI * 2); ctx.fill();
      text(ctx, "🔥 열점 (거의 고정) · 하와이섬", HX - 16, HY + 26, { s: 11.5, w: "800", a: "right", c: v("--amber-700") });

      text(ctx, "● 관측된 해산열", 640, 60, { s: 11.5, w: "800", c: v("--mist") });
      text(ctx, "┄ 내 모형", 640, 80, { s: 11.5, w: "800", c: v("--coral-700") });

      var e = worstV(vv);
      $("b-c3-info").innerHTML = "속도 <b>" + vv.toFixed(1) + " cm/년</b> → 세 관측점과의 최대 거리 차이 <b>" + num(e) + " km</b>" + (got.v ? " ✅" : "")
        + "<br>꺾인 뒤 해산열이 뻗은 방위각 <b>" + dir + "°</b>" + (got.d ? " ✅" : "")
        + "<br>해산열이 뻗은 방향의 <b>반대쪽</b>이 판이 움직인 방향입니다.";
    }
    canvas._redraw = draw;

    function check() {
      if (got.v) done("m2-4a");
      if (got.d) done("m2-4b");
      if (got.v && got.d) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>속도는 약 <b>7.5 cm/년</b>, 엠퍼러 구간은 거의 <b>북쪽(방위각 345°)</b>으로 뻗어 있습니다. 속도는 그대로인데 방향만 바뀐 것 — 약 47백만 년 전 <b>태평양판이 방향을 튼 기록</b>입니다.");
        ep.clear(3);
      }
    }
    $("b-v").addEventListener("input", function (e) {
      vv = +e.target.value; $("b-v-val").textContent = vv.toFixed(1);
      if (!got.v && worstV(vv) <= 400) { got.v = vv; window.sthState("b4", got); check(); }
      draw();
    });
    $("b-dir").addEventListener("input", function (e) {
      dir = +e.target.value;
      $("b-dir-val").textContent = dir + "°" + (dir <= 285 ? " 서" : (dir >= 350 ? " 북" : " 북서"));
      if (!got.d && Math.abs(dir - 345) <= 10) { got.d = dir; window.sthState("b4", got); check(); }
      draw();
    });
    draw(); check();
  })();

  /* ---- 장면 5 : 두 가지 구조 운동 ---- */
  function reveal() {
    $("b-end-wrap").hidden = false;
    var p = window.sthState("p2") || "", g = window.sthState("b4") || {};
    $("b-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음")
      + (p.indexOf("㉡") === 0 ? " — 정확했습니다." : " — 열점과 플룸이 답이었습니다.")
      + "<br><b>내가 읽어 낸 판의 역사</b> 속도 " + (g.v ? g.v.toFixed(1) : "-") + " cm/년, 약 47백만 년 전 방향이 북북서 → 서북서로 바뀜";
  }
  function finish() {
    var g = window.sthState("b4") || {};
    window.sthState("r2", "해결 · 태평양판 " + (g.v ? g.v.toFixed(1) : "-") + " cm/년, 47백만 년 전 방향 전환");
  }
  window.sthSort({
    mount: "b-sort",
    buckets: [
      { id: "u", label: "맨틀 상부 운동", sub: "판이 만들어지고 사라지는 판구조 운동 — 판 경계" },
      { id: "p", label: "플룸에 의한 구조 운동", sub: "맨틀 전체 규모의 기둥 — 판 경계와 무관" }
    ],
    items: [
      { t: "대서양 중앙 해령에서 새 해양 지각이 만들어진다", a: "u", why: "발산형 경계, 곧 판구조 운동입니다." },
      { t: "일본 해구에서 태평양판이 아래로 섭입한다", a: "u", why: "수렴형 경계에서 일어나는 판구조 운동입니다." },
      { t: "인도 대륙이 부딪쳐 히말라야가 솟아오른다", a: "u", why: "대륙끼리 충돌하는 수렴형 경계입니다." },
      { t: "산안드레아스 단층에서 두 판이 어긋나며 지진이 난다", a: "u", why: "보존형 경계입니다." },
      { t: "판 한가운데인 하와이에 화산섬이 줄지어 있다", a: "p", why: "열점 위를 판이 지나가며 만들어진, 플룸에 의한 화산입니다.", hint: "가장 가까운 판 경계가 수천 km 밖입니다." },
      { t: "아프리카 아래에서 거대한 뜨거운 기둥이 맨틀 바닥부터 올라온다", a: "p", why: "핫 플룸입니다. 맨틀과 핵의 경계 부근에서 시작합니다." },
      { t: "섭입한 차가운 판이 맨틀 바닥까지 가라앉아 쌓인다", a: "p", why: "콜드 플룸입니다. 섭입은 상부 운동이지만, 맨틀 전체를 가로질러 내려가는 이 흐름은 플룸 구조론에서 다룹니다.", hint: "맨틀 ‘상부’를 넘어 어디까지 내려가나요?" },
      { t: "대륙 한가운데인 옐로스톤에서 화산 활동이 이어진다", a: "p", why: "판 경계와 무관한 열점 화산입니다." }
    ],
    doneText: "판구조론은 맨틀 상부를, 플룸 구조론은 맨틀 전체를 봅니다.",
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();
  window.sthWork({
    mount: "wk2", unitLabel: "[지구시스템과학1 Ⅰ-2] 이야기 ② 굽은 화산 열",
    items: [
      { id: "w1", label: "판을 움직이는 힘", hint: "맨틀 대류만으로 설명되지 않는 부분이 무엇인지, 해령 밀기·판 끌기와 연결해 쓰세요." },
      { id: "e2b", label: "판구조 운동과 플룸 구조 운동", hint: "하와이의 화산과 일본의 화산이 어떻게 다른 원인으로 생기는지, ‘맨틀 상부 운동’과 ‘플룸’이라는 말을 넣어 구분해 쓰세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 한라산과 백두산
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  window.sthGate({
    gate: "g3", key: "p3", title: "조사관의 첫 추리",
    question: "한라산은 넓고 완만한데 백두산은 꼭대기가 통째로 날아갔습니다. 가장 큰 까닭은?",
    options: [
      "㉠ 분화한 시기가 달라서 — 오래될수록 깎여 완만해진다",
      "㉡ 마그마의 성분(SiO₂ 함량)이 달라 끈적임과 기체가 달라서",
      "㉢ 백두산이 한라산보다 높은 산이라서"
    ],
    onPick: function () { ep.clear(0); }
  });

  function logVisc(si, T, w) { return 0.12 * (si - 45) - 0.006 * (T - 1200) - 0.35 * w + 1.0; }
  function classify(si) {
    if (si < 52) return { m: "현무암질", vo: "순상 화산", rk: "현무암", st: "용암이 멀리까지 흘러가는 조용한 분출", ex: "제주 한라산, 하와이" };
    if (si < 63) return { m: "안산암질", vo: "성층 화산", rk: "안산암", st: "용암류와 화산 쇄설물이 번갈아 쌓이는 분출", ex: "일본 후지산, 필리핀 마욘" };
    return { m: "유문암질", vo: "종상 화산", rk: "유문암", st: "기체가 갇혔다가 한꺼번에 터지는 폭발적 분출", ex: "백두산 정상부, 울릉도" };
  }

  /* ---- 장면 2 : 마그마 실험실 ---- */
  (function () {
    var canvas = $("c-c1"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var si = 45, T = 1200, w = 0.5;
    var got = window.sthState("c2") || { b: false, a: false, r: false }, log = [];

    function draw() {
      paper(ctx, W, H);
      var lv = logVisc(si, T, w), c = classify(si), f = clamp((si - 45) / 30, 0, 1);

      /* 왼쪽 : 화산체 단면 */
      text(ctx, "만들어질 화산체", 40, 30, { s: 13, w: "800" });
      var baseY = 330, cx = 250, half = 210 - f * 128, ht = 54 + f * 190;
      ctx.fillStyle = v("--card-2"); ctx.fillRect(40, baseY, 420, 26);
      ctx.beginPath();
      ctx.moveTo(cx - half, baseY); ctx.lineTo(cx, baseY - ht); ctx.lineTo(cx + half, baseY); ctx.closePath();
      ctx.fillStyle = v("--card-2"); ctx.fill(); ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.stroke();
      if (f < 0.25) {
        ctx.strokeStyle = v("--coral"); ctx.lineWidth = 7; ctx.globalAlpha = .85;
        ctx.beginPath(); ctx.moveTo(cx, baseY - ht); ctx.lineTo(cx - half * .92, baseY - 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, baseY - ht); ctx.lineTo(cx + half * .92, baseY - 3); ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (f < 0.6) {
        ctx.strokeStyle = v("--coral"); ctx.lineWidth = 5; ctx.globalAlpha = .8;
        ctx.beginPath(); ctx.moveTo(cx, baseY - ht); ctx.lineTo(cx - half * .55, baseY - 5); ctx.stroke();
        ctx.globalAlpha = .5; ctx.fillStyle = v("--mist");
        for (var i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(cx + i * 7 - 10, baseY - ht - 18 - i * 15, 14 + i * 3, 0, Math.PI * 2); ctx.fill(); }
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = .7; ctx.fillStyle = v("--mist");
        for (var j = 0; j < 7; j++) { ctx.beginPath(); ctx.arc(cx + (j % 3 - 1) * 12, baseY - ht - 24 - j * 18, 17 + j * 3.5, 0, Math.PI * 2); ctx.fill(); }
        ctx.globalAlpha = 1;
        ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(cx, baseY - ht, 9, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = v("--coral"); ctx.globalAlpha = .55;
      ctx.beginPath(); ctx.ellipse(cx, baseY + 50, 60, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      text(ctx, "마그마 방", cx, baseY + 54, { s: 10.5, w: "800", a: "center", c: v("--on-accent") });
      text(ctx, c.vo, cx, baseY - ht - 44, { s: 15, w: "900", a: "center", c: v("--coral-700") });

      /* 오른쪽 : 점성 눈금 + 표 */
      var x0 = 500, gx = 500, gw = 366;
      text(ctx, "마그마의 점성 (끈적임)", x0, 30, { s: 13, w: "800" });
      var grad = ctx.createLinearGradient(gx, 0, gx + gw, 0);
      grad.addColorStop(0, v("--teal")); grad.addColorStop(1, v("--coral"));
      ctx.fillStyle = grad; ctx.fillRect(gx, 46, gw, 20);
      var mx = gx + clamp((lv + 0.5) / 7.5, 0, 1) * gw;
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(mx, 40); ctx.lineTo(mx, 72); ctx.stroke();
      text(ctx, "묽다", gx, 86, { s: 10.5, c: v("--mist") });
      text(ctx, "끈적하다", gx + gw, 86, { s: 10.5, c: v("--mist"), a: "right" });
      text(ctx, "점성 ≈ 10^" + lv.toFixed(1) + " Pa·s", gx + gw, 36, { s: 12.5, w: "900", a: "right", c: v("--coral-700") });

      var rows = [["마그마", c.m + " 마그마"], ["SiO₂ 함량", si + " %"], ["온도", num(T) + " ℃"], ["녹아 있는 물", w.toFixed(1) + " %"],
                  ["분출 양식", c.st], ["화산체", c.vo], ["굳으면", c.rk], ["실제 예", c.ex]];
      rows.forEach(function (r, i) {
        var y = 116 + i * 26;
        ctx.fillStyle = i % 2 ? v("--card-2") : v("--panel"); ctx.fillRect(x0, y - 15, gw, 24);
        text(ctx, r[0], x0 + 8, y + 2, { s: 11, w: "800", c: v("--mist") });
        wrap(ctx, r[1], x0 + 108, y + 2, gw - 116, 13, { s: 11.5, w: "800" });
      });
      var warn = (si < 55 && T < 950) ? "⚠ 현무암질 마그마는 보통 1,000~1,200 ℃ 입니다." :
                 ((si > 66 && T > 1050) ? "⚠ 유문암질 마그마는 보통 700~900 ℃ 입니다." : "");
      if (warn) text(ctx, warn, x0, 340, { s: 11, w: "800", c: v("--rose-700") });

      var lines = log.slice(-3).map(function (r) { return "SiO₂ " + r.si + "% → <b>" + r.m + " 마그마</b> · " + r.vo + " · " + r.rk; });
      $("c-c1-info").innerHTML = "SiO₂ <b>" + si + "%</b>, " + num(T) + " ℃, 물 " + w.toFixed(1) + "% → 점성 <b>10^" + lv.toFixed(1) + " Pa·s</b>. "
        + "SiO₂가 많을수록, 온도가 낮을수록, 물이 적을수록 끈적해집니다."
        + (lines.length ? "<br><b>분출 기록</b><br>" + lines.join("<br>") : "<br>값을 정한 뒤 <b>분출시켜 기록하기</b>를 누르세요.");
    }
    canvas._redraw = draw;

    function check() {
      if (got.b) done("m3-2a");
      if (got.a) done("m3-2b");
      if (got.r) done("m3-2c");
      if (got.b && got.a && got.r) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>같은 조작판에서 <b>순상 화산·성층 화산·종상 화산</b>이 모두 나왔습니다. 화산의 생김새를 정한 것은 높이도 나이도 아니라 <b>마그마의 SiO₂ 함량</b>이었습니다.");
        ep.clear(1);
      }
    }
    $("c-si").addEventListener("input", function (e) { si = +e.target.value; $("c-si-val").textContent = si; draw(); });
    $("c-temp").addEventListener("input", function (e) { T = +e.target.value; $("c-temp-val").textContent = num(T); draw(); });
    $("c-h2o").addEventListener("input", function (e) { w = +e.target.value; $("c-h2o-val").textContent = w.toFixed(1); draw(); });
    $("c-erupt").addEventListener("click", function () {
      var c = classify(si);
      log.push({ si: si, m: c.m, vo: c.vo, rk: c.rk });
      if (si < 52) got.b = true; else if (si < 63) got.a = true; else got.r = true;
      window.sthState("c2", got);
      draw(); check();
    });
    draw(); check();
  })();

  /* ---- 장면 3 : 946년 백두산 ---- */
  (function () {
    var canvas = $("c-c2"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var gas = 0, got = window.sthState("c3") || { big: false, dome: false }, fired = null;

    function plume(g) { return 6.5 * g; }
    function draw() {
      paper(ctx, W, H);
      var Hk = plume(gas), sky = 316;
      function HY(km) { return sky - km / 40 * (sky - 50); }
      text(ctx, "SiO₂ 70%인 백두산 마그마 — 물의 양에 따른 분출", 40, 30, { s: 13, w: "800" });
      /* 높이 눈금 */
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(70, 50); ctx.lineTo(70, sky); ctx.lineTo(860, sky); ctx.stroke();
      for (var h = 0; h <= 40; h += 10) {
        var y = HY(h);
        text(ctx, h + " km", 64, y + 4, { s: 10.5, c: v("--mist"), a: "right" });
        ctx.strokeStyle = v("--line"); ctx.globalAlpha = .4;
        ctx.beginPath(); ctx.moveTo(70, y); ctx.lineTo(860, y); ctx.stroke(); ctx.globalAlpha = 1;
      }
      var y25 = HY(25);
      ctx.strokeStyle = v("--amber"); ctx.setLineDash([6, 5]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(70, y25); ctx.lineTo(860, y25); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "946년 백두산 분화 수준 (약 25 km)", 856, y25 - 8, { s: 11, w: "800", a: "right", c: v("--amber-700") });

      /* 화산체 (실제 높이 약 2.7 km 를 같은 눈금으로 그렸습니다) */
      var cx = 430, base = sky, sum = HY(2.7);
      ctx.beginPath(); ctx.moveTo(cx - 160, base); ctx.lineTo(cx - 30, sum); ctx.lineTo(cx + 30, sum); ctx.lineTo(cx + 160, base);
      ctx.closePath(); ctx.fillStyle = v("--card-2"); ctx.fill(); ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.stroke();
      text(ctx, "백두산 2,744 m", cx - 170, base - 6, { s: 10.5, a: "right", c: v("--mist") });
      if (gas <= 1.0) {
        ctx.fillStyle = v("--coral"); ctx.globalAlpha = .9;
        ctx.beginPath(); ctx.ellipse(cx, sum, 30, 18, 0, Math.PI, 0); ctx.fill(); ctx.globalAlpha = 1;
        text(ctx, "🥞 용암 돔 — 조용히 밀려 올라옵니다", cx, sum - 30, { s: 13, w: "900", a: "center", c: v("--coral-700") });
      } else {
        var top = HY(Hk);
        ctx.fillStyle = v("--mist"); ctx.globalAlpha = .6;
        for (var i = 0; i < 16; i++) {
          var t = i / 15, yy = lerp(sum, top, t), rr = 14 + t * (16 + gas * 8);
          ctx.beginPath(); ctx.arc(cx + Math.sin(i * 1.7) * t * 24, yy, rr, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        text(ctx, "분연주 " + Hk.toFixed(1) + " km", cx + 90 + gas * 8, clamp(top + 6, 46, sky), { s: 13, w: "900", c: v("--coral-700") });
        /* 화산재 낙하 */
        ctx.fillStyle = v("--violet"); ctx.globalAlpha = .45;
        var nk = Math.min(11, Math.round(gas * 3));
        for (var k = 0; k < nk; k++) {
          ctx.beginPath(); ctx.arc(cx + 180 + k * 22, base - 18 - (k % 4) * 15, 4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        if (nk > 0) text(ctx, "화산재·부석이 바람을 타고 날아갑니다", cx + 180, base - 92, { s: 11, w: "800", c: v("--violet-700") });
      }
      /* 마그마 속 기포 */
      ctx.fillStyle = v("--coral"); ctx.globalAlpha = .5;
      ctx.beginPath(); ctx.ellipse(cx, base + 44, 90, 30, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = v("--panel");
      var nb = Math.min(11, Math.round(gas * 2) + 1);
      for (var b = 0; b < nb; b++) {
        ctx.beginPath(); ctx.arc(cx - 66 + b * 13, base + 38 + (b % 3) * 9, 2 + gas * 0.7, 0, Math.PI * 2); ctx.fill();
      }
      text(ctx, "마그마 방 — 녹아 있는 물 " + gas.toFixed(1) + "%", cx, base + 92, { s: 11, w: "800", a: "center", c: v("--mist") });

      var style = gas <= 1.0 ? "조용한 용암 돔 분출" : (gas < 4 ? "화산 쇄설물이 섞인 중간 규모 분출" : "화산재와 부석을 쏟아내는 폭발적 분출");
      $("c-c2-info").innerHTML = "물 <b>" + gas.toFixed(1) + "%</b> → 분연주 높이 <b>" + Hk.toFixed(1) + " km</b> · " + style
        + "<br>끈적한 마그마 속 기포는 빠져나가지 못하고 갇혀 있다가, 압력을 이기지 못하는 순간 마그마를 잘게 부수며 터집니다. 이때 생긴 부스러기가 <b>화산재·부석 같은 화산 쇄설물</b>입니다."
        + (fired ? "<br><b>기록</b> 물 " + fired.g.toFixed(1) + "% → 분연주 " + fired.h.toFixed(1) + " km" : "<br>값을 정한 뒤 <b>분출시키기</b>를 누르세요.");
    }
    canvas._redraw = draw;

    function check() {
      if (got.big) done("m3-3a");
      if (got.dome) done("m3-3b");
      if (got.big && got.dome) {
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>같은 성분의 마그마인데도 <b>기체의 양</b>에 따라 조용한 용암 돔이 되기도 하고, 946년처럼 화산재를 바다 건너까지 날려 보내는 대폭발이 되기도 합니다. 백두산 천지는 그때 꼭대기가 내려앉아 생긴 <b>칼데라</b>입니다.");
        ep.clear(2);
      }
    }
    $("c-gas").addEventListener("input", function (e) { gas = +e.target.value; $("c-gas-val").textContent = gas.toFixed(1); draw(); });
    $("c-blast").addEventListener("click", function () {
      var Hk = plume(gas);
      fired = { g: gas, h: Hk };
      if (Hk >= 25) got.big = true;
      if (gas <= 1.0) got.dome = true;
      window.sthState("c3", got);
      draw(); check();
    });
    draw(); check();
  })();

  /* ---- 장면 4 : 결정 크기 ---- */
  (function () {
    var canvas = $("c-c3"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var dep = 0, rk = "b", got = window.sthState("c4") || { vol: false, plu: false }, sliced = null;
    var NAMES = { b: ["현무암", "반려암", "현무암질"], a: ["안산암", "섬록암", "안산암질"], r: ["유문암", "화강암", "유문암질"] };
    function grain(d) { return 0.05 * Math.pow(10, 0.22 * d); }
    function years(d) { return 2 * Math.pow(10, 0.6 * d); }
    function rockOf(d) { return d <= 1.5 ? 0 : (d >= 5 ? 1 : -1); }

    function draw() {
      paper(ctx, W, H);
      var g = grain(dep), yr = years(dep), kind = rockOf(dep), nm = NAMES[rk];
      /* 왼쪽 : 지각 단면 */
      text(ctx, "마그마가 굳은 자리", 40, 30, { s: 13, w: "800" });
      var x0 = 48, x1 = 430, top = 50, bot = 318;
      box(ctx, x0, top, x1 - x0, bot - top, v("--card-2"));
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1; ctx.globalAlpha = .5;
      for (var d = 0; d <= 10; d += 2) {
        var y = top + d / 10 * (bot - top);
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
        text(ctx, d + " km", x0 - 6, y + 4, { s: 10, c: v("--mist"), a: "right" });
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = v("--teal"); ctx.fillRect(x0, top - 10, x1 - x0, 10);
      text(ctx, "지표", x1 - 4, top - 16, { s: 11, w: "800", a: "right", c: v("--teal-700") });
      ctx.fillStyle = v("--coral"); ctx.globalAlpha = .75;
      ctx.beginPath(); ctx.ellipse(239, top + dep / 10 * (bot - top), 74, 24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      text(ctx, "깊이 " + dep.toFixed(1) + " km", 239, top + dep / 10 * (bot - top) + 5, { s: 12, w: "900", a: "center", c: v("--on-accent") });
      text(ctx, dep <= 1.5 ? "지표 가까이 — 빨리 식는다" : (dep >= 5 ? "깊은 곳 — 아주 천천히 식는다" : "중간 깊이"), x0, bot + 40, { s: 11.5, w: "800", c: v("--mist") });
      text(ctx, "다 식는 데 걸리는 시간 약 " + (yr >= 10000 ? num(Math.round(yr / 1000)) + "천 년" : num(Math.round(yr)) + " 년"), x0, bot + 62, { s: 11.5, c: v("--mist") });

      /* 오른쪽 : 현미경 */
      text(ctx, "🔬 얇은 조각을 현미경으로 보면", 500, 30, { s: 13, w: "800" });
      var mcx = 640, mcy = 190, mr = 118;
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.arc(mcx, mcy, mr, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(mcx, mcy, mr, 0, Math.PI * 2); ctx.clip();
      var step = clamp(3 + g * 9, 3.5, 48);
      var cols = ["--teal", "--violet", "--mist", "--coral"];
      var n = 0;
      for (var gy = -mr; gy < mr; gy += step) {
        for (var gx2 = -mr; gx2 < mr; gx2 += step) {
          var jitter = ((n * 37) % 11) / 11 - 0.5;
          ctx.fillStyle = v(cols[n % 4]); ctx.globalAlpha = .8;
          ctx.beginPath();
          ctx.rect(mcx + gx2 + jitter * step * .3, mcy + gy + jitter * step * .3, step * .86, step * .86);
          ctx.fill();
          n++;
        }
      }
      ctx.globalAlpha = 1; ctx.restore();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mcx, mcy, mr, 0, Math.PI * 2); ctx.stroke();
      text(ctx, "결정 크기 약 " + (g < 0.1 ? g.toFixed(3) : g.toFixed(2)) + " mm", mcx, mcy + mr + 26, { s: 12.5, w: "900", a: "center" });
      text(ctx, kind === 0 ? "세립질 — 결정이 너무 작아 눈으로 구별하기 어렵다" : (kind === 1 ? "조립질 — 결정이 굵어 하나하나 보인다" : "중간 — 반심성암"),
        mcx, mcy + mr + 46, { s: 11, a: "center", c: v("--mist") });
      text(ctx, kind === 0 ? "화산암 : " + nm[0] : (kind === 1 ? "심성암 : " + nm[1] : "반심성암"),
        mcx, mcy - mr - 14, { s: 14, w: "900", a: "center", c: v("--coral-700") });

      $("c-c3-info").innerHTML = "<b>" + nm[2] + " 마그마</b>가 깊이 <b>" + dep.toFixed(1) + " km</b>에서 굳었습니다. 식는 데 걸린 시간 약 <b>"
        + (yr >= 10000 ? num(Math.round(yr / 1000)) + "천 년" : num(Math.round(yr)) + " 년") + "</b>, 결정 크기 약 <b>" + (g < 0.1 ? g.toFixed(3) : g.toFixed(2)) + " mm</b> → "
        + (kind === 0 ? "<b>화산암 " + nm[0] + "</b>" : (kind === 1 ? "<b>심성암 " + nm[1] + "</b>" : "반심성암"))
        + (sliced ? "<br><b>관찰 기록</b> 깊이 " + sliced.d.toFixed(1) + " km → " + sliced.n : "<br>깊이를 정한 뒤 <b>얇은 조각 만들어 관찰하기</b>를 누르세요.");
    }
    canvas._redraw = draw;

    function check() {
      if (got.vol) done("m3-4a");
      if (got.plu) done("m3-4b");
      if (got.vol && got.plu) {
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>같은 성분이라도 <b>어디에서 굳었는지</b>에 따라 다른 암석이 됩니다. 빨리 식으면 결정이 자랄 틈이 없어 <b>화산암</b>, 천천히 식으면 결정이 굵은 <b>심성암</b>. 그래서 암석의 조직만 봐도 굳은 깊이를 짐작할 수 있습니다.");
        ep.clear(3);
      }
    }
    $("c-depth").addEventListener("input", function (e) { dep = +e.target.value; $("c-depth-val").textContent = dep.toFixed(1); draw(); });
    Array.prototype.slice.call(document.querySelectorAll("#c-rock button")).forEach(function (b) {
      b.addEventListener("click", function () {
        rk = b.getAttribute("data-r");
        Array.prototype.slice.call(document.querySelectorAll("#c-rock button")).forEach(function (x) { x.classList.toggle("on", x === b); });
        draw();
      });
    });
    $("c-slice").addEventListener("click", function () {
      var kind = rockOf(dep), nm = NAMES[rk];
      sliced = { d: dep, n: kind === 0 ? "화산암 " + nm[0] : (kind === 1 ? "심성암 " + nm[1] : "반심성암") };
      if (dep <= 1.0) got.vol = true;
      if (dep >= 7.0) got.plu = true;
      window.sthState("c4", got);
      draw(); check();
    });
    draw(); check();
  })();

  /* ---- 장면 5 : 암석의 순환 ---- */
  var STEPS = [
    "지하 깊은 곳에서 암석이 녹아 마그마가 만들어진다",
    "마그마가 식어 굳으면서 화성암이 된다",
    "지표로 드러난 암석이 풍화·침식되어 잘게 부서진다",
    "부스러기가 쌓이고 다져져 퇴적암이 된다",
    "깊이 묻혀 높은 열과 압력을 받아 변성암이 된다",
    "더 깊이 들어가 다시 녹아 마그마로 돌아간다"
  ];
  function reveal() {
    $("c-end-wrap").hidden = false;
    var p = window.sthState("p3") || "";
    $("c-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음")
      + (p.indexOf("㉡") === 0 ? " — 정확했습니다." : " — 시기도 높이도 아니라, 마그마의 성분과 기체가 답이었습니다.")
      + "<br><b>내가 만든 화산</b> 순상 화산 · 성층 화산 · 종상 화산, 그리고 화산암과 심성암";
  }
  function finish() { window.sthState("r3", "해결 · SiO₂와 기체가 화산체·화산암을 정한다 (한라산 ↔ 백두산)"); }
  if (ep.cleared(4)) {
    $("c-order").innerHTML = "<div class='order sort'><div class='slots'>"
      + STEPS.map(function (s) { return "<div class='slot filled'>" + s + "</div>"; }).join("") + "</div></div>";
    reveal();
  } else {
    window.sthOrder({ mount: "c-order", steps: STEPS, onDone: function () { reveal(); ep.clear(4); } });
  }
  window.sthWork({
    mount: "wk3", unitLabel: "[지구시스템과학1 Ⅰ-2] 이야기 ③ 한라산과 백두산",
    items: [
      { id: "e3a", label: "한라산과 백두산이 다르게 생긴 까닭", hint: "SiO₂ 함량 → 점성 → 기체가 빠져나가는 정도 → 분출 양식 → 화산체와 화산암의 순서로 이어 쓰세요." },
      { id: "e3b", label: "암석의 순환에서 화산 활동이 하는 일", hint: "화성암·퇴적암·변성암이 서로 바뀌는 과정 속에서 화산 활동이 어느 자리에 있는지, 판의 운동과 연결해 쓰세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ④ 지구 속을 본 지진파
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep4", key: "ep4", name: "사건 파일 ④", onDone: finish });

  var ANCH = [0, 1000, 2000, 4000, 6000, 8000, 10000];
  var PM = [0, 2.0, 3.5, 6.3, 9.0, 10.2, 11.5];
  var SM = [0, 3.5, 6.2, 11.5, 16.5, 19.0, 22.0];
  function itp(arr, d) {
    for (var i = 0; i < ANCH.length - 1; i++) {
      if (d >= ANCH[i] && d <= ANCH[i + 1]) {
        var t = (d - ANCH[i]) / (ANCH[i + 1] - ANCH[i]);
        return arr[i] + t * (arr[i + 1] - arr[i]);
      }
    }
    return arr[arr.length - 1];
  }
  function ps(d) { return itp(SM, d) - itp(PM, d); }

  window.sthGate({
    gate: "g4", key: "p4", title: "조사관의 첫 추리",
    question: "아무도 가 본 적 없는 지구 속, 어떤 모습일까요?",
    options: [
      "㉠ 중심까지 한결같은 단단한 고체 덩어리다",
      "㉡ 겉은 고체인데 속의 일부는 액체다",
      "㉢ 속은 텅 비어 있거나 기체로 차 있다"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 장면 2 : 주시 곡선 ---- */
  (function () {
    var canvas = $("d-c1"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var dist = 1000, okA = !!window.sthState("d2a"), okB = !!window.sthState("d2b");

    function draw() {
      paper(ctx, W, H);
      var x0 = 78, x1 = 520, y0 = 52, y1 = 300, TMAX = 23;
      text(ctx, "주시 곡선 — 진앙 거리에 따른 P파·S파 도달 시각", 40, 30, { s: 13, w: "800" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      function GX(d) { return x0 + d / 10000 * (x1 - x0); }
      function GY(t) { return y1 - t / TMAX * (y1 - y0); }
      [0, 2500, 5000, 7500, 10000].forEach(function (d) { text(ctx, num(d), GX(d), y1 + 18, { s: 10, c: v("--mist"), a: "center" }); });
      [0, 5, 10, 15, 20].forEach(function (t) {
        text(ctx, t + "분", x0 - 6, GY(t) + 4, { s: 10, c: v("--mist"), a: "right" });
        ctx.strokeStyle = v("--line"); ctx.globalAlpha = .4;
        ctx.beginPath(); ctx.moveTo(x0, GY(t)); ctx.lineTo(x1, GY(t)); ctx.stroke(); ctx.globalAlpha = 1;
      });
      text(ctx, "진앙 거리 (km) →", (x0 + x1) / 2, y1 + 36, { s: 11, c: v("--mist"), a: "center" });
      function curve(arr, col) {
        ctx.strokeStyle = v(col); ctx.lineWidth = 3; ctx.beginPath();
        for (var k = 0; k <= 100; k++) {
          var d = k / 100 * 10000, xx = GX(d), yy = GY(itp(arr, d));
          if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
        }
        ctx.stroke();
      }
      curve(SM, "--cold"); curve(PM, "--coral");
      text(ctx, "S파", GX(9200), GY(itp(SM, 9200)) - 12, { s: 12, w: "900", c: v("--brand-700") });
      text(ctx, "P파", GX(9200), GY(itp(PM, 9200)) + 20, { s: 12, w: "900", c: v("--coral-700") });

      var tP = itp(PM, dist), tS = itp(SM, dist), dt = tS - tP, mx = GX(dist);
      ctx.strokeStyle = v("--mist"); ctx.setLineDash([3, 3]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(mx, y1); ctx.lineTo(mx, GY(tS)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(mx, GY(tP), 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = v("--cold"); ctx.beginPath(); ctx.arc(mx, GY(tS), 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = v("--teal"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(mx + 13, GY(tP)); ctx.lineTo(mx + 13, GY(tS)); ctx.stroke();
      text(ctx, "PS시", clamp(mx + 19, 0, 470), (GY(tP) + GY(tS)) / 2 + 4, { s: 11.5, w: "900", c: v("--teal-700") });

      /* 오른쪽 : 기록지 */
      var rx = 566, rw = 300;
      text(ctx, "이 거리에서 얻게 될 지진 기록지", rx, 30, { s: 13, w: "800" });
      ctx.fillStyle = v("--card-2"); ctx.fillRect(rx, 52, rw, 180);
      var pf = 0.10 + 0.55 * (tP / TMAX), sf = 0.10 + 0.55 * (tS / TMAX);
      var pxp = rx + pf * rw, pxs = rx + sf * rw, mid = 142;
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 1.5; ctx.beginPath();
      for (var i = 0; i <= rw; i++) {
        var xx = rx + i, amp;
        if (xx < pxp) amp = 1.2 * Math.sin(i * 0.9);
        else if (xx < pxs) amp = 9 * Math.sin(i * 1.15) * Math.exp(-(xx - pxp) / 220);
        else amp = 34 * Math.sin(i * 0.72) * Math.exp(-(xx - pxs) / 150) + 4 * Math.sin(i * 0.3);
        if (i === 0) ctx.moveTo(xx, mid + amp); else ctx.lineTo(xx, mid + amp);
      }
      ctx.stroke();
      [[pxp, "P파 도착", "--coral"], [pxs, "S파 도착", "--cold"]].forEach(function (q) {
        ctx.strokeStyle = v(q[2]); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(q[0], 58); ctx.lineTo(q[0], 226); ctx.stroke();
        text(ctx, q[1], clamp(q[0] + 5, 0, 800), 70, { s: 10.5, w: "800", c: v(q[2] + "-700") || v("--ink") });
      });
      ctx.strokeStyle = v("--teal"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(pxp, 244); ctx.lineTo(pxs, 244); ctx.stroke();
      text(ctx, "초기 미동 계속 시간 (PS시) = " + dt.toFixed(2) + "분", rx, 266, { s: 11.5, w: "900", c: v("--teal-700") });
      text(ctx, "P파 도착 뒤 S파가 오기 전까지가 초기 미동,", rx, 292, { s: 11, c: v("--mist") });
      text(ctx, "S파 도착 뒤의 큰 흔들림이 주요동입니다.", rx, 310, { s: 11, c: v("--mist") });
      text(ctx, "찾아야 할 값 : PS시 5.20분", rx, 338, { s: 12.5, w: "900", c: okA ? v("--green-700") : v("--amber-700") });

      $("d-c1-info").innerHTML = "진앙 거리 <b>" + num(dist) + " km</b> → P파 " + tP.toFixed(2) + "분, S파 " + tS.toFixed(2) + "분, <b>PS시 " + dt.toFixed(2) + "분</b>"
        + (okA ? " ✅" : "") + "<br>진앙에서 멀수록 PS시가 길어집니다. P파와 S파는 같은 순간에 출발하지만 속도가 달라 차이가 벌어지기 때문입니다.";
    }
    canvas._redraw = draw;

    function check() {
      if (okA) done("m4-2a");
      if (okB) done("m4-2b");
      if (okA && okB) {
        window.sthMission("m4-2", true, "<span class='m-tag'>미션 완료</span>PS시 5.20분 → 진앙 거리 <b>4,000 km</b>. 기록지 한 장만으로 진앙까지의 <b>거리</b>를 알아냈습니다. 하지만 아직 <b>방향</b>은 모릅니다.");
        ep.clear(1);
      }
    }
    $("d-dist").addEventListener("input", function (e) {
      dist = +e.target.value; $("d-dist-val").textContent = num(dist) + " km";
      if (!okA && Math.abs(ps(dist) - 5.2) <= 0.1) { okA = true; window.sthState("d2a", 1); check(); }
      draw();
    });
    window.sthPick({
      mount: "d-q1",
      q: "기록지에서 P파가 S파보다 먼저 도착하는 까닭으로 옳은 것은?",
      options: [
        "P파가 S파보다 먼저 출발하기 때문이다",
        "둘은 같은 순간에 출발하지만 P파가 더 빨라 먼저 닿고, 그 사이가 초기 미동이다",
        "P파는 지표를 따라오고 S파는 지구 속을 지나오기 때문이다",
        "P파의 진폭이 커서 먼저 눈에 띄기 때문이다"
      ],
      answer: 1,
      why: [
        "지진이 일어나는 순간 P파와 S파는 함께 출발합니다.",
        "맞습니다. P파는 앞뒤로 밀고 당기는 종파라 더 빠르고, S파는 위아래로 흔드는 횡파라 느립니다. 그 시간 차가 PS시입니다.",
        "둘 다 지구 속을 지나옵니다. 지표를 따라오는 것은 표면파이고, 가장 늦게 도착합니다.",
        "오히려 P파의 진폭이 더 작습니다. 그래서 초기 ‘미동’이라고 부릅니다."
      ],
      onDone: function () { okB = true; window.sthState("d2b", 1); check(); }
    });
    draw(); check();
  })();

  /* ---- 장면 3 : 세 관측소 ---- */
  (function () {
    var canvas = $("d-c2"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var K = 0.075, EPI = [300, 225];
    var ST = [
      { n: "㉮", d: 800, a: -20, ps: 1.20 },
      { n: "㉯", d: 1500, a: 205, ps: 2.10 },
      { n: "㉰", d: 2600, a: 55, ps: 3.45 }
    ];
    ST.forEach(function (s) {
      s.x = EPI[0] + s.d * K * Math.cos(s.a * D2R);
      s.y = EPI[1] + s.d * K * Math.sin(s.a * D2R);
    });
    var r = [2000, 2000, 2000], got = window.sthState("d3") || [0, 0, 0];

    function draw() {
      paper(ctx, W, H);
      var bx = 45, by = 45, bw = 520, bh = 360;
      text(ctx, "관측소를 중심으로 진앙 거리만큼 원을 그려 봅시다", 40, 30, { s: 13, w: "800" });
      ctx.fillStyle = v("--card-2"); ctx.fillRect(bx, by, bw, bh);
      ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
      ctx.strokeStyle = v("--line"); ctx.globalAlpha = .45; ctx.lineWidth = 1;
      for (var gx = bx; gx <= bx + bw; gx += 37.5) { ctx.beginPath(); ctx.moveTo(gx, by); ctx.lineTo(gx, by + bh); ctx.stroke(); }
      for (var gy = by; gy <= by + bh; gy += 37.5) { ctx.beginPath(); ctx.moveTo(bx, gy); ctx.lineTo(bx + bw, gy); ctx.stroke(); }
      ctx.globalAlpha = 1;
      var cols = ["--coral", "--teal", "--violet"];
      ST.forEach(function (s, i) {
        ctx.strokeStyle = v(cols[i]); ctx.lineWidth = got[i] ? 3 : 2; ctx.globalAlpha = got[i] ? 1 : .65;
        ctx.beginPath(); ctx.arc(s.x, s.y, r[i] * K, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      });
      ctx.restore();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
      ST.forEach(function (s, i) {
        ctx.fillStyle = v(cols[i]); ctx.beginPath();
        ctx.moveTo(s.x, s.y - 9); ctx.lineTo(s.x + 9, s.y + 7); ctx.lineTo(s.x - 9, s.y + 7); ctx.closePath(); ctx.fill();
        text(ctx, s.n + " 관측소" + (got[i] ? " ✔" : ""), clamp(s.x + 13, 0, 470), s.y + 5, { s: 11.5, w: "900", c: v(cols[i] + "-700") || v("--ink") });
      });
      var all = got[0] && got[1] && got[2];
      if (all) {
        ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(EPI[0], EPI[1], 9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = v("--ink"); ctx.lineWidth = 2; ctx.stroke();
        text(ctx, "★ 진앙", EPI[0] + 14, EPI[1] - 12, { s: 13, w: "900", c: v("--amber-700") });
      }
      text(ctx, "눈금 한 칸 = 500 km", bx + 4, by + bh + 20, { s: 11, c: v("--mist") });

      /* 오른쪽 : PS시 → 거리 환산 그래프 */
      var x0 = 630, x1 = 866, y0 = 70, y1 = 340;
      text(ctx, "PS시 → 진앙 거리 환산", 600, 30, { s: 13, w: "800" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      function PX(p) { return x0 + p / 6 * (x1 - x0); }
      function PY(d) { return y1 - d / 5000 * (y1 - y0); }
      [0, 2, 4, 6].forEach(function (p) { text(ctx, p + "분", PX(p), y1 + 18, { s: 10, c: v("--mist"), a: "center" }); });
      [0, 1000, 2000, 3000, 4000, 5000].forEach(function (d) {
        text(ctx, num(d), x0 - 6, PY(d) + 4, { s: 9.5, c: v("--mist"), a: "right" });
        ctx.strokeStyle = v("--line"); ctx.globalAlpha = .35;
        ctx.beginPath(); ctx.moveTo(x0, PY(d)); ctx.lineTo(x1, PY(d)); ctx.stroke(); ctx.globalAlpha = 1;
      });
      ctx.strokeStyle = v("--teal"); ctx.lineWidth = 3; ctx.beginPath();
      for (var k = 0; k <= 100; k++) {
        var dd = k / 100 * 5000, xx = PX(ps(dd)), yy = PY(dd);
        if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      ST.forEach(function (s, i) {
        ctx.strokeStyle = v(cols[i]); ctx.setLineDash([4, 4]); ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(PX(s.ps), y1); ctx.lineTo(PX(s.ps), PY(s.d)); ctx.lineTo(x0, PY(s.d)); ctx.stroke();
        ctx.setLineDash([]);
        text(ctx, s.n, PX(s.ps), y1 + 34, { s: 11, w: "900", a: "center", c: v(cols[i] + "-700") || v("--ink") });
      });
      text(ctx, "거리 (km)", 600, y0 - 12, { s: 10.5, c: v("--mist") });
      text(ctx, "PS시 →", (x0 + x1) / 2, y1 + 52, { s: 10.5, c: v("--mist"), a: "center" });

      $("d-c2-info").innerHTML = ST.map(function (s, i) {
        return s.n + " PS시 " + s.ps.toFixed(2) + "분 → 내 반지름 <b>" + num(r[i]) + " km</b>" + (got[i] ? " ✅" : "");
      }).join(" &nbsp;|&nbsp; ") + (all
        ? "<br>세 원이 <b>한 점</b>에서 만났습니다. 그 점이 <b>진앙</b>입니다. 진앙은 지표에서의 위치이고, 실제로 지진이 일어난 땅속 지점은 <b>진원</b>입니다."
        : "<br>오른쪽 환산 그래프에서 PS시에 해당하는 거리를 읽어 반지름을 하나씩 맞춰 보세요.");
    }
    canvas._redraw = draw;

    function check() {
      ["m4-3a", "m4-3b", "m4-3c"].forEach(function (id, i) { if (got[i]) done(id); });
      if (got[0] && got[1] && got[2]) {
        window.sthMission("m4-3", true, "<span class='m-tag'>미션 완료</span>세 원의 교점이 <b>진앙</b>입니다. 관측소가 하나면 거리만, 둘이면 두 곳, 셋이면 한 점으로 좁혀집니다. 이것이 실제 지진 관측에서 진앙을 정하는 방법입니다.");
        ep.clear(2);
      }
    }
    [0, 1, 2].forEach(function (i) {
      var el = $("d-r" + (i + 1));
      el.addEventListener("input", function (e) {
        r[i] = +e.target.value;
        $("d-r" + (i + 1) + "-val").textContent = num(r[i]);
        if (!got[i] && Math.abs(r[i] - ST[i].d) <= 150) { got[i] = 1; window.sthState("d3", got); check(); }
        draw();
      });
    });
    draw(); check();
  })();

  /* ---- 장면 4 : 그림자대 ---- */
  (function () {
    var canvas = $("d-c3"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var ang = 0, got = window.sthState("d4") || { both: false, none: false, ponly: false };
    function pOK(a) { return !(a >= 103 && a <= 142); }
    function sOK(a) { return a < 103; }

    function draw() {
      paper(ctx, W, H);
      var cx = 300, cy = 236, R = 190;
      text(ctx, "지구 속을 지나는 지진파 (진원은 맨 위)", 40, 30, { s: 13, w: "800" });
      /* 층 */
      ctx.fillStyle = v("--teal"); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = v("--violet"); ctx.beginPath(); ctx.arc(cx, cy, R * (6371 - 2890) / 6371, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = v("--cold"); ctx.beginPath(); ctx.arc(cx, cy, R * (6371 - 5150) / 6371, 0, Math.PI * 2); ctx.fill();
      text(ctx, "맨틀 (고체)", cx, cy - R + 44, { s: 11.5, w: "800", a: "center", c: v("--on-accent") });
      text(ctx, "외핵 (액체)", cx, cy + R * 0.42, { s: 11.5, w: "800", a: "center", c: v("--on-accent") });
      text(ctx, "내핵", cx, cy + 4, { s: 11, w: "800", a: "center", c: v("--on-accent") });

      function pt(a, rr) { return [cx + rr * Math.sin(a * D2R), cy - rr * Math.cos(a * D2R)]; }
      /* 그림자대 표시 */
      function arcBand(a0, a1, col, off) {
        ctx.strokeStyle = v(col); ctx.lineWidth = 11; ctx.globalAlpha = .45;
        ctx.beginPath(); ctx.arc(cx, cy, R + off, -Math.PI / 2 + a0 * D2R, -Math.PI / 2 + a1 * D2R); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, R + off, -Math.PI / 2 - a1 * D2R, -Math.PI / 2 - a0 * D2R); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      arcBand(103, 180, "--cold", 9);
      arcBand(103, 142, "--coral", 21);

      /* 지진파 경로 */
      ctx.lineWidth = 1.6; ctx.globalAlpha = .75;
      [20, 45, 70, 95].forEach(function (a) {
        var e = pt(a, R), depth = R * (1 - a / 190);
        ctx.strokeStyle = v("--coral");
        ctx.beginPath(); ctx.moveTo(cx, cy - R);
        ctx.quadraticCurveTo(cx + Math.sin(a / 2 * D2R) * depth * 1.5, cy - Math.cos(a / 2 * D2R) * depth * 0.6, e[0], e[1]);
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - R);
        ctx.quadraticCurveTo(cx - Math.sin(a / 2 * D2R) * depth * 1.5, cy - Math.cos(a / 2 * D2R) * depth * 0.6, 2 * cx - e[0], e[1]);
        ctx.stroke();
      });
      /* 핵을 지나 굴절된 P파 */
      [150, 168].forEach(function (a) {
        var e = pt(a, R);
        ctx.strokeStyle = v("--amber"); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy - R);
        ctx.lineTo(cx + R * 0.44, cy + R * 0.12);
        ctx.lineTo(cx + (e[0] - cx) * 0.55, cy + (e[1] - cy) * 0.62);
        ctx.lineTo(e[0], e[1]); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - R);
        ctx.lineTo(cx - R * 0.44, cy + R * 0.12);
        ctx.lineTo(cx - (e[0] - cx) * 0.55, cy + (e[1] - cy) * 0.62);
        ctx.lineTo(2 * cx - e[0], e[1]); ctx.stroke();
      });
      ctx.globalAlpha = 1;
      /* 진원과 관측소 */
      ctx.fillStyle = v("--rose"); ctx.beginPath(); ctx.arc(cx, cy - R, 8, 0, Math.PI * 2); ctx.fill();
      text(ctx, "진원 0°", cx, cy - R - 16, { s: 11.5, w: "900", a: "center", c: v("--rose-700") });
      var o = pt(ang, R);
      ctx.strokeStyle = v("--ink"); ctx.globalAlpha = .45; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(o[0], o[1]); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.fillStyle = v("--ink"); ctx.beginPath(); ctx.arc(o[0], o[1], 9, 0, Math.PI * 2); ctx.fill();
      text(ctx, ang + "°", clamp(o[0] + 14, 0, 560), o[1] + 5, { s: 12.5, w: "900" });

      /* 오른쪽 안내 */
      var x0 = 600;
      text(ctx, "이 관측소에 도착하는 지진파", x0, 60, { s: 13, w: "800" });
      var p = pOK(ang), s = sOK(ang);
      box(ctx, x0, 78, 266, 56, p ? v("--green-100") : v("--rose-100"));
      text(ctx, (p ? "✅ P파 도달" : "🚫 P파 도달 못 함"), x0 + 14, 104, { s: 14, w: "900", c: p ? v("--green-700") : v("--rose-700") });
      text(ctx, p ? "종파 · 고체와 액체를 모두 지난다" : "핵에서 크게 굴절해 이 구간을 비켜 간다", x0 + 14, 124, { s: 11, c: v("--mist") });
      box(ctx, x0, 144, 266, 56, s ? v("--green-100") : v("--rose-100"));
      text(ctx, (s ? "✅ S파 도달" : "🚫 S파 도달 못 함"), x0 + 14, 170, { s: 14, w: "900", c: s ? v("--green-700") : v("--rose-700") });
      text(ctx, s ? "횡파 · 고체만 지난다" : "액체인 외핵을 지나지 못한다", x0 + 14, 190, { s: 11, c: v("--mist") });
      text(ctx, "■ P파 그림자대 103°~142°", x0, 232, { s: 11.5, w: "800", c: v("--coral-700") });
      text(ctx, "■ S파 그림자대 103°~180°", x0, 254, { s: 11.5, w: "800", c: v("--brand-700") });
      wrap(ctx, "S파 그림자대가 P파 그림자대보다 훨씬 넓습니다. 두 그림자대의 모양이 서로 다르다는 점이 결정적인 단서입니다.", x0, 286, 266, 19, { s: 11.5, c: v("--mist") });

      $("d-c3-info").innerHTML = "각거리 <b>" + ang + "°</b> — P파 " + (p ? "도달" : "도달 못 함") + " / S파 " + (s ? "도달" : "도달 못 함") + ". "
        + (ang < 103 ? "맨틀만 지나 오는 구간입니다. 두 파가 모두 옵니다."
          : (ang <= 142 ? "두 파가 모두 오지 않습니다. P파는 핵의 경계에서 안쪽으로 크게 꺾였고, S파는 아예 핵을 지나지 못했습니다."
            : "P파는 핵을 지나 되꺾여 도착하지만, S파는 끝내 오지 않습니다. <b>왜 S파만 오지 못할까요?</b>"));
    }
    canvas._redraw = draw;

    function check() {
      if (got.both) done("m4-4a");
      if (got.none) done("m4-4b");
      if (got.ponly) done("m4-4c");
      if (got.both && got.none && got.ponly) {
        window.sthMission("m4-4", true, "<span class='m-tag'>미션 완료</span>S파는 <b>103°부터 반대편까지 전혀</b> 오지 않습니다. S파는 고체만 지나므로, 그 길목에 <b>액체인 외핵</b>이 있다는 뜻입니다. P파가 103°~142°에서만 비는 것은 핵에서 속도가 뚝 떨어져 안쪽으로 굴절하기 때문입니다.");
        ep.clear(3);
      }
    }
    $("d-ang").addEventListener("input", function (e) {
      ang = +e.target.value; $("d-ang-val").textContent = ang + "°";
      var p = pOK(ang), s = sOK(ang), ch = false;
      if (p && s && ang >= 5 && !got.both) { got.both = ch = true; }
      if (!p && !s && !got.none) { got.none = ch = true; }
      if (p && !s && !got.ponly) { got.ponly = ch = true; }
      if (ch) { window.sthState("d4", got); check(); }
      draw();
    });
    draw(); check();
  })();

  /* ---- 장면 5 : 속도 구조와 레만 ---- */
  (function () {
    var canvas = $("d-c4"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var dep = 0, got = window.sthState("d5") || { m: false, g: false, l: false };
    function vP(d) {
      if (d < 35) return 6.0 + d * 0.026;
      if (d < 2890) return lerp(8.1, 13.7, (d - 35) / 2855);
      if (d < 5150) return lerp(8.0, 10.4, (d - 2890) / 2260);
      return lerp(11.0, 11.3, (d - 5150) / 1221);
    }
    function vS(d) {
      if (d < 35) return 3.5 + d * 0.011;
      if (d < 2890) return lerp(4.5, 7.3, (d - 35) / 2855);
      if (d < 5150) return 0;
      return lerp(3.5, 3.7, (d - 5150) / 1221);
    }
    function layer(d) {
      if (d < 35) return { n: "지각", s: "고체", c: "--coral", t: "대륙 지각은 약 35 km, 해양 지각은 5~10 km로 훨씬 얇습니다." };
      if (d < 2890) return { n: "맨틀", s: "고체", c: "--teal", t: "지구 부피의 약 82%를 차지합니다. 고체이지만 아주 오랜 시간에 걸쳐 천천히 대류합니다." };
      if (d < 5150) return { n: "외핵", s: "액체", c: "--violet", t: "액체 철·니켈. S파가 지나지 못합니다. 이 액체의 대류가 지구 자기장을 만듭니다." };
      return { n: "내핵", s: "고체", c: "--cold", t: "엄청난 압력 때문에 다시 고체가 됩니다. 1936년 레만이 찾아냈습니다." };
    }

    function draw() {
      paper(ctx, W, H);
      var L = layer(dep), p = vP(dep), s = vS(dep);
      /* 왼쪽 : 층 단면 */
      text(ctx, "지구 내부의 층", 40, 30, { s: 13, w: "800" });
      var cx = 175, cy = 182, R = 130;
      ctx.fillStyle = v("--teal"); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = v("--violet"); ctx.beginPath(); ctx.arc(cx, cy, R * (6371 - 2890) / 6371, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = v("--cold"); ctx.beginPath(); ctx.arc(cx, cy, R * (6371 - 5150) / 6371, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, R * (6371 - dep) / 6371, 0, Math.PI * 2); ctx.stroke();
      text(ctx, "맨틀", cx, cy - R + 32, { s: 11, w: "800", a: "center", c: v("--on-accent") });
      text(ctx, "외핵", cx, cy + R * 0.44, { s: 11, w: "800", a: "center", c: v("--on-accent") });
      text(ctx, "내핵", cx, cy + 4, { s: 11, w: "800", a: "center", c: v("--on-accent") });
      text(ctx, "깊이 " + num(dep) + " km → " + L.n + " (" + L.s + ")", 40, cy + R + 36, { s: 13.5, w: "900", c: v(L.c + "-700") || v("--ink") });
      wrap(ctx, L.t, 40, cy + R + 60, 300, 19, { s: 11.5, c: v("--mist") });

      /* 오른쪽 : 속도 - 깊이 그래프 */
      var x0 = 420, x1 = 700, y0 = 56, y1 = 380;
      text(ctx, "깊이에 따른 지진파의 속도", 420, 30, { s: 13, w: "800" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      function VX(u) { return x0 + u / 14 * (x1 - x0); }
      function DY(d) { return y0 + d / 6371 * (y1 - y0); }
      [0, 4, 8, 12].forEach(function (u) { text(ctx, u + "", VX(u), y1 + 18, { s: 10, c: v("--mist"), a: "center" }); });
      text(ctx, "속도 (km/s) →", (x0 + x1) / 2, y1 + 36, { s: 11, c: v("--mist"), a: "center" });
      text(ctx, "깊이 ↓", x0 - 6, y0 - 8, { s: 11, c: v("--mist"), a: "right" });
      [0, 2000, 4000, 6000].forEach(function (d) { text(ctx, num(d), x0 - 6, DY(d) + 4, { s: 9.5, c: v("--mist"), a: "right" }); });
      [[35, "모호면", got.m], [2890, "구텐베르크면", got.g], [5150, "레만면", got.l]].forEach(function (q) {
        ctx.strokeStyle = v(q[2] ? "--green" : "--amber"); ctx.setLineDash([5, 4]); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x0, DY(q[0])); ctx.lineTo(x1 + 158, DY(q[0])); ctx.stroke(); ctx.setLineDash([]);
        text(ctx, (q[2] ? "✔ " : "") + q[1] + " " + num(q[0]) + " km", x1 + 156, DY(q[0]) - 7,
          { s: 11, w: "800", a: "right", c: q[2] ? v("--green-700") : v("--amber-700") });
      });
      function vcurve(f, col) {
        ctx.strokeStyle = v(col); ctx.lineWidth = 3;
        var seg = [[0, 34], [35, 2889], [2890, 5149], [5150, 6371]];
        seg.forEach(function (sg) {
          ctx.beginPath();
          for (var k = 0; k <= 40; k++) {
            var d = lerp(sg[0], sg[1], k / 40), u = f(d);
            if (u <= 0) { ctx.stroke(); return; }
            var xx = VX(u), yy = DY(d);
            if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
          }
          ctx.stroke();
        });
      }
      vcurve(vP, "--coral"); vcurve(vS, "--brand");
      text(ctx, "P파", VX(12.4), DY(2600), { s: 11.5, w: "900", c: v("--coral-700") });
      text(ctx, "S파", VX(6.4), DY(2600), { s: 11.5, w: "900", c: v("--brand-700") });
      ctx.fillStyle = v("--ink"); ctx.beginPath(); ctx.arc(VX(p), DY(dep), 5.5, 0, Math.PI * 2); ctx.fill();
      if (s > 0) { ctx.beginPath(); ctx.arc(VX(s), DY(dep), 5.5, 0, Math.PI * 2); ctx.fill(); }

      $("d-c4-info").innerHTML = "깊이 <b>" + num(dep) + " km</b> — <b>" + L.n + "</b>(" + L.s + ") · P파 <b>" + p.toFixed(1) + " km/s</b> · S파 <b>"
        + (s > 0 ? s.toFixed(1) + " km/s" : "지나가지 못함") + "</b><br>" + L.t;
    }
    canvas._redraw = draw;

    function check() {
      if (got.m) done("m4-5a");
      if (got.g) done("m4-5b");
      if (got.l) done("m4-5c");
      if (got.m && got.g && got.l) {
        window.sthMission("m4-5", true, "<span class='m-tag'>미션 완료</span>경계 셋을 모두 찾았습니다. <b>모호면(약 35 km)</b> · <b>구텐베르크면(약 2,900 km)</b> · <b>레만면(약 5,100 km)</b>. 사람이 12 km밖에 파 보지 못했는데도, 지진파의 속도가 달라지는 깊이를 읽어 6,371 km 속까지 그려 냈습니다.");
        ep.clear(4);
      }
    }
    $("d-depth").addEventListener("input", function (e) {
      dep = +e.target.value; $("d-depth-val").textContent = num(dep) + " km";
      var ch = false;
      if (!got.m && dep >= 10 && Math.abs(dep - 35) <= 50) { got.m = ch = true; }
      if (!got.g && Math.abs(dep - 2890) <= 50) { got.g = ch = true; }
      if (!got.l && Math.abs(dep - 5150) <= 50) { got.l = ch = true; }
      if (ch) { window.sthState("d5", got); check(); }
      draw();
    });
    draw(); check();
  })();

  function reveal() {
    $("d-end-wrap").hidden = false;
    var p = window.sthState("p4") || "";
    $("d-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음")
      + (p.indexOf("㉡") === 0 ? " — 정확했습니다. 액체인 외핵이 그 답입니다." : " — S파가 오지 않는 구간이 액체 외핵의 존재를 알려 주었습니다.")
      + "<br><b>내가 찾은 경계</b> 모호면 약 35 km · 구텐베르크면 약 2,900 km · 레만면 약 5,100 km";
  }
  function finish() {
    reveal();
    window.sthState("r4", "해결 · 경계 3개(모호면·구텐베르크면·레만면)와 외핵이 액체임을 확인");
  }
  if (ep.cleared(4)) reveal();

  window.sthWork({
    mount: "wk4", unitLabel: "[지구시스템과학1 Ⅰ-2] 이야기 ④ 지구 속을 본 지진파",
    items: [
      { id: "w2", label: "지진파가 알려 준 것", hint: "P파와 S파가 각각 어디까지 전달되는지로부터 무엇을 알 수 있는지 쓰세요." },
      { id: "e4b", label: "기록지 한 장에서 진앙까지", hint: "PS시 → 진앙 거리 → 세 관측소의 원 → 진앙의 순서로, 각 단계에서 무엇을 알아내는지 쓰세요." }
    ]
  });
})();

/* ========================================================================= 05 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[지구시스템과학1 Ⅰ-2] 판 구조 운동과 지구 내부 구조 — 정리",
  recap: [
    { key: "r1", label: "① 대륙을 움직인 범인" },
    { key: "r2", label: "② 굽은 화산 열" },
    { key: "r3", label: "③ 한라산과 백두산" },
    { key: "r4", label: "④ 지구 속을 본 지진파" }
  ],
  items: [
    { id: "all", label: "네 사건을 꿰는 한 문장", hint: "대륙을 옮긴 일, 판 아래의 기둥, 마그마가 만든 암석, 지진파가 그린 지구 속. 네 이야기에 공통으로 들어 있는 생각을 ‘판의 운동’과 ‘지구 내부’라는 말을 넣어 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 06 우리 반 */
window.sthShare({
  mount: "share", unit: "esys-1-2", unitLabel: "[지구시스템과학1 Ⅰ-2] 판 구조 운동과 지구 내부 구조",
  rows: [
    { key: "r1", label: "① 대륙을 움직인 범인" },
    { key: "r2", label: "② 굽은 화산 열" },
    { key: "r3", label: "③ 한라산과 백두산" },
    { key: "r4", label: "④ 지구 속을 본 지진파" }
  ],
  line: { id: "all", label: "네 사건을 꿰는 한 문장" }
});

})();
