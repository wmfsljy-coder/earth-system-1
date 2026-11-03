/* 지구시스템과학1 Ⅰ-1 지구의 탄생과 물질의 순환 — 소단원별 이야기 세 편
   01 세 행성의 갈림길 / 02 25억 년 된 줄무늬 / 03 눈덩이 지구를 녹인 것
   공용 부품: ../assets/theme.js (sthUnit·sthGate·sthWork), ../assets/story.js (sthStory·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

window.sthUnit("esys-1-1");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
function num(x, d) { return x.toLocaleString(undefined, { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }

/* ---- 무대 그림 도구 (../assets/kit.js) ---- */
var K = window.sthKit, KC = K.C;
/* 반투명 유리 판(계기판) */
function glass(ctx, x, y, w, h, line) {
  ctx.fillStyle = "rgba(10,14,40,.62)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill();
  ctx.strokeStyle = line || "rgba(160,180,255,.22)"; ctx.lineWidth = 1; ctx.stroke();
}
/* 빛나는 막대 */
function gbar(ctx, x, y, w, h, f, col) {
  ctx.fillStyle = "rgba(255,255,255,.07)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.fillStyle = col;
  ctx.beginPath(); ctx.roundRect(x, y, Math.max(h, w * clamp(f, 0, 1)), h, h / 2); ctx.fill(); ctx.restore();
}
/* 계속 도는 움직임 + ⏸ 단추 (단추는 그 장면의 controls 끝에 붙는다) */
function mover(canvas, paint, label) {
  var st = { on: !K.REDUCE, t: 0 };
  var b = document.createElement("button"); b.type = "button"; b.className = "btn sm";
  function lab() { b.textContent = st.on ? "⏸ " + (label || "움직임") + " 멈추기" : "▶ " + (label || "움직임") + " 보기"; }
  b.addEventListener("click", function () { st.on = !st.on; lab(); paint(); });
  lab();
  var wrapEl = canvas.parentNode, ctr = wrapEl.nextElementSibling;
  if (ctr && /controls|sim-side|toggle-row/.test(ctr.className)) ctr.appendChild(b);
  else wrapEl.parentNode.insertBefore(b, wrapEl.nextSibling);
  K.animate(canvas, function (dt) { if (st.on) { st.t += dt / 1000; paint(); } });
  return st;
}
/* a→b 선을 따라 흐르는 빛 알갱이 */
function flow(ctx, a, b, t, col, n, r) {
  n = n || 4;
  for (var i = 0; i < n; i++) {
    var u = ((t + i / n) % 1 + 1) % 1, x = a.x + (b.x - a.x) * u, y = a.y + (b.y - a.y) * u;
    ctx.globalAlpha = Math.sin(u * Math.PI) * .95; K.glow(ctx, x, y, r || 2.2, col, 3.2);
  }
  ctx.globalAlpha = 1;
}

/* =========================================================================
   이야기 ① 세 행성의 갈림길
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  /* ---- 장면 1 : 첫 추리 ---- */
  window.sthGate({
    gate: "g1", key: "p1", title: "연구원의 첫 추리",
    question: "같은 재료로 태어난 세 행성이 이토록 다른 길을 간 가장 큰 까닭은 무엇일까요?",
    options: [
      "㉠ 처음부터 만들어진 재료가 서로 달랐다",
      "㉡ 태양으로부터의 거리와 행성의 크기가 달랐다",
      "㉢ 나중에 커다란 천체가 부딪혀 운명이 갈렸다"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 장면 2 : 미행성 충돌과 마그마 바다 ---- */
  var SIG = 5.67e-8;
  function surfT(R) { return Math.pow((238 + 60 + 6500 * R) / SIG, 0.25) - 273; }   // ℃

  (function () {
    var canvas = $("a-c1"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var R = 20, got = window.sthState("a2") || { a: false, b: false };
    var RK = K.rng(4), SPOTS = [], q, mv = null;
    for (q = 0; q < 70; q++) SPOTS.push([RK() * 6.2832, Math.sqrt(RK()), 4 + RK() * 9]);
    var CRACKS = [];
    for (q = 0; q < 11; q++) {
      var cp = [], ca = RK() * 6.2832, cr = RK() * .5;
      for (var cs = 0; cs < 4; cs++) { cp.push([ca, cr]); ca += (RK() - .5) * .9; cr = Math.min(1.02, cr + .18 + RK() * .25); }
      CRACKS.push(cp);
    }

    function paint() {
      var T = surfT(R), tt = mv ? mv.t : 0;
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽 : 원시 지구 ── */
      var LW = 452, cx = 226, cy = 196, rad = 108;
      K.stage(ctx, 0, 0, LW, H, "space", { seed: 21, title: "원시 지구 · 미행성이 쏟아지던 때" });
      if (T >= 700) {
        var hw = T >= 1200 ? .5 : .22, hg = ctx.createRadialGradient(cx, cy, rad * .9, cx, cy, rad * 1.6);
        hg.addColorStop(0, "rgba(255,120,40," + hw + ")"); hg.addColorStop(1, "rgba(255,90,30,0)");
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx, cy, rad * 1.6, 0, 6.2832); ctx.fill();
      }
      var g = ctx.createRadialGradient(cx - rad * .35, cy - rad * .4, rad * .1, cx, cy, rad);
      if (T >= 1200) { g.addColorStop(0, "#fff3b0"); g.addColorStop(.35, "#ff9a3c"); g.addColorStop(.8, "#c8321e"); g.addColorStop(1, "#5a1208"); }
      else if (T >= 700) { g.addColorStop(0, "#b8846a"); g.addColorStop(.45, "#6e3a2a"); g.addColorStop(1, "#26100a"); }
      else { g.addColorStop(0, "#a3a1ad"); g.addColorStop(.45, "#57535f"); g.addColorStop(1, "#1c1a22"); }
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.2832); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.2832); ctx.clip();
      SPOTS.forEach(function (s, i) {
        var px = cx + Math.cos(s[0]) * s[1] * (rad - 6), py = cy + Math.sin(s[0]) * s[1] * (rad - 6);
        var fl = .75 + .25 * Math.sin(tt * 3 + i), a = T >= 1200 ? .6 * fl : (T >= 700 ? .45 * fl : .12);
        var sg = ctx.createRadialGradient(px, py, 0, px, py, s[2]);
        sg.addColorStop(0, T >= 1200 ? "rgba(255,244,180," + a + ")" : "rgba(255,120,40," + a + ")");
        sg.addColorStop(1, "rgba(255,90,30,0)");
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(px, py, s[2], 0, 6.2832); ctx.fill();
      });
      if (T < 1200) {
        ctx.strokeStyle = T >= 700 ? "rgba(255,140,60,.8)" : "rgba(255,120,60,.22)"; ctx.lineWidth = 1.4;
        CRACKS.forEach(function (cp) {
          ctx.beginPath();
          cp.forEach(function (p, i) { var x = cx + Math.cos(p[0]) * p[1] * rad, y = cy + Math.sin(p[0]) * p[1] * rad; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
          ctx.stroke();
        });
      }
      var sh = ctx.createRadialGradient(cx - rad * .45, cy - rad * .45, rad * .55, cx - rad * .2, cy - rad * .2, rad * 1.5);
      sh.addColorStop(0, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,12,.6)");
      ctx.fillStyle = sh; ctx.fillRect(cx - rad, cy - rad, 2 * rad, 2 * rad);
      ctx.restore();
      /* 떨어지는 미행성 — 충돌 빈도에 비례해 개수가 늘어난다 */
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      var n = Math.round(R / 4);
      for (var k = 0; k < n; k++) {
        var ang = k / Math.max(1, n) * 6.2832 + .4 + k * .37, ph = (tt * (.32 + (k % 3) * .08) + k * .618) % 1;
        var d0 = rad + 140, dd = d0 - (d0 - rad) * ph;
        var px = cx + Math.cos(ang) * dd, py = cy + Math.sin(ang) * dd, tx = cx + Math.cos(ang) * (dd + 30), ty = cy + Math.sin(ang) * (dd + 30);
        var tg = ctx.createLinearGradient(px, py, tx, ty); tg.addColorStop(0, "rgba(255,200,120,.85)"); tg.addColorStop(1, "rgba(255,160,80,0)");
        ctx.strokeStyle = tg; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tx, ty); ctx.stroke();
        K.planet(ctx, px, py, 4.4, "#cbb89c", "#3a3028");
        if (ph > .88) { ctx.globalAlpha = (ph - .88) / .12; K.glow(ctx, cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, 4, "rgba(255,230,160,.95)", 4.5); ctx.globalAlpha = 1; }
      }
      ctx.restore();
      K.pill(ctx, "원시 지구 · 미행성 충돌 " + R + "배", cx, 340, { a: "center", s: 12.5, c: T >= 1200 ? KC.orange : KC.ink, box: [0, LW] });
      K.warn(ctx, LW - 14, H - 10, "⚠ 미행성 크기는 실제 비율이 아님", "right");

      /* ── 오른쪽 : 열 수지와 온도계 ── */
      var RX = LW + 8, RW = W - RX;
      K.stage(ctx, RX, 0, RW, H, "lab", { seed: 3, title: "지표를 달구는 열 (W/m²)" });
      var rows = [
        { n: "☄️ 미행성 충돌 에너지", val: 6500 * R, c: KC.orange },
        { n: "☢️ 방사성 원소 붕괴열", val: 60, c: KC.violet },
        { n: "☀️ 태양 복사", val: 238, c: KC.yellow }
      ];
      var tot = rows[0].val + rows[1].val + rows[2].val;
      rows.forEach(function (r, i) {
        var y = 66 + i * 40;
        K.t(ctx, r.n, RX + 22, y, { s: 11.5, c: KC.mute });
        K.t(ctx, num(Math.round(r.val)), W - 18, y, { s: 12, w: "900", a: "right", c: r.c });
        gbar(ctx, RX + 22, y + 7, RW - 40, 10, r.val / Math.max(tot, 1), r.c);
      });
      /* 온도계 */
      var tx0 = RX + 40, tTop = 196, tBot = 336, TMIN = -100, TMAX = 1700;
      function TY(v0) { return tBot - (v0 - TMIN) / (TMAX - TMIN) * (tBot - tTop); }
      ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.beginPath(); ctx.roundRect(tx0 - 7, tTop - 6, 14, tBot - tTop + 16, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(tx0, tBot + 16, 13, 0, 6.2832); ctx.fill();
      var tcol = T >= 1200 ? KC.red : (T >= 700 ? KC.orange : KC.blue);
      ctx.save(); ctx.shadowColor = tcol; ctx.shadowBlur = 12; ctx.fillStyle = tcol;
      ctx.beginPath(); ctx.roundRect(tx0 - 4, TY(clamp(T, TMIN, TMAX)), 8, tBot + 10 - TY(clamp(T, TMIN, TMAX)), 4); ctx.fill();
      ctx.beginPath(); ctx.arc(tx0, tBot + 16, 9.5, 0, 6.2832); ctx.fill(); ctx.restore();
      [[1200, "1200 ℃ · 암석이 모두 녹는 선", KC.red], [700, "700 ℃ · 지각이 굳는 선", KC.orange]].forEach(function (m) {
        var my = TY(m[0]);
        K.line(ctx, { x: tx0 - 10, y: my }, { x: tx0 + 18, y: my }, m[2], 1.6, [4, 3]);
        K.t(ctx, m[1], tx0 + 22, my + 4, { s: 10.5, c: m[2] });
      });
      var vx = RX + 300;
      K.t(ctx, "지표 평균 온도", vx, 206, { s: 11.5, a: "center", c: KC.mute });
      ctx.save(); ctx.shadowColor = tcol; ctx.shadowBlur = 16;
      K.t(ctx, Math.round(T) + " ℃", vx, 252, { s: 36, w: "900", a: "center", c: tcol }); ctx.restore();
      K.pill(ctx, T >= 1200 ? "🔥 마그마 바다 — 지구 전체가 녹아 있다"
        : (T >= 700 ? "🌋 겉은 굳었다 녹았다 한다" : "🪨 지각이 굳기 시작한다"), vx, 306, { a: "center", s: 12, c: tcol, box: [RX, W] });
      K.t(ctx, "충돌 에너지가 줄면 지구는 열을 우주로 내보내며 식는다", RX + 70, 368, { s: 10.5, c: KC.dim });
    }
    function draw() {
      paint();
      var T = surfT(R);
      var T0 = Math.round(T);
      $("a-c1-info").innerHTML = "미행성 충돌 빈도가 상대값 <b>" + R + "배</b>일 때 지표 온도는 약 <b>" + T0 + " ℃</b>입니다. "
        + (T >= 1200 ? "규산염 암석이 모두 녹아 <b>마그마 바다</b>가 되었습니다. 이 상태에서만 무거운 물질과 가벼운 물질이 자유롭게 자리를 바꿀 수 있습니다."
          : (T >= 700 ? "아직 뜨겁지만 지구 전체가 녹을 만큼은 아닙니다. 충돌을 더 잦게 해 보세요."
            : "충돌이 잦아들어 지표가 식고 <b>지각</b>이 굳기 시작합니다. 이때부터 화산 기체가 모여 원시 대기를 이룹니다."));

      var ch = false;
      if (T >= 1200 && !got.a) { got.a = true; ch = true; }
      if (T <= 700 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("a2", got); mission(); }
    }
    function mission() {
            if (got.a) done("m1-2a");
      if (got.b) done("m1-2b");
      if (got.a && got.b) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>충돌이 잦을수록 뜨겁습니다. 마그마 바다는 충돌 에너지와 방사성 붕괴열이 함께 만든 것이고, 충돌이 잦아들면 지구는 식으면서 <b>지각</b>을 갖게 됩니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    mv = mover(canvas, paint, "충돌");
    $("a-imp").addEventListener("input", function (e) { R = +e.target.value; $("a-imp-val").textContent = R + "배"; draw(); });
    draw(); mission();
    if (ep.cleared(1)) window.sthMission("m1-2", true);
  })();

  /* ---- 장면 3 : 층상 분화 ---- */
  function prog(t) { return t <= 2 ? 0 : Math.min(1, 1 - Math.exp(-(t - 2) / 25)); }

  (function () {
    var canvas = $("a-c2"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var t = 0, got = window.sthState("a3") || { a: false, b: false }, okQ = !!window.sthState("a3q");
    var mv = null;

    function paint() {
      var p = prog(t), tt = mv ? mv.t : 0;
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽 : 지구 단면 ── */
      var LW = 440, cx = 220, cy = 184, rad = 126;
      K.stage(ctx, 0, 0, LW, H, "space", { seed: 8, title: "지구 단면 · 녹은 지구 속에서" });
      var hg = ctx.createRadialGradient(cx, cy, rad * .9, cx, cy, rad * 1.35);
      hg.addColorStop(0, "rgba(255,120,50,.35)"); hg.addColorStop(1, "rgba(255,100,40,0)");
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx, cy, rad * 1.35, 0, 6.2832); ctx.fill();
      /* 마그마 바다(규산염) */
      var mg = ctx.createRadialGradient(cx - rad * .3, cy - rad * .35, rad * .1, cx, cy, rad);
      mg.addColorStop(0, "#ffc36b"); mg.addColorStop(.5, "#e0703a"); mg.addColorStop(1, "#7a2e1c");
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.2832); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.2832); ctx.clip();
      /* 가볍게 떠오르는 규산염 */
      var nb = Math.round(10 * (1 - p));
      for (var b = 0; b < nb; b++) {
        var ba = b * 2.4 + .5, bu = (tt * .18 + b / 10) % 1, br = lerp(rad * .3, rad * .95, bu);
        ctx.globalAlpha = Math.sin(bu * Math.PI) * .8;
        K.glow(ctx, cx + Math.cos(ba) * br, cy + Math.sin(ba) * br, 2.2, "rgba(255,240,200,.9)", 3);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      /* 핵 */
      var coreR = rad * 0.546 * Math.sqrt(p);
      if (p > 0) {
        var cg = ctx.createRadialGradient(cx - coreR * .3, cy - coreR * .35, coreR * .05, cx, cy, coreR);
        cg.addColorStop(0, "#fff6dc"); cg.addColorStop(.45, "#d9c7a8"); cg.addColorStop(1, "#6b6470");
        ctx.save(); ctx.shadowColor = "rgba(255,230,170,.8)"; ctx.shadowBlur = 18;
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, 6.2832); ctx.fill(); ctx.restore();
      }
      /* 가라앉는 철 방울 — 방울마다 핵 쪽으로 떨어진다 */
      var drops = Math.round(14 * (1 - p));
      for (var i = 0; i < drops; i++) {
        var ang = i / 14 * 6.2832 + .3, u = (tt * .22 + (i % 5) / 5 + i * .13) % 1;
        var r0 = rad * .93, r1 = Math.max(coreR + 9, rad * .2), rr = lerp(r0, r1, u);
        var dx = cx + Math.cos(ang) * rr, dy = cy + Math.sin(ang) * rr;
        var tx = cx + Math.cos(ang) * (rr + 16), ty = cy + Math.sin(ang) * (rr + 16);
        var tg = ctx.createLinearGradient(dx, dy, tx, ty); tg.addColorStop(0, "rgba(220,225,240,.6)"); tg.addColorStop(1, "rgba(220,225,240,0)");
        ctx.strokeStyle = tg; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(tx, ty); ctx.stroke();
        K.planet(ctx, dx, dy, 5.5, "#c9ced8", "#3b3f4a");
      }
      /* 지각 */
      if (p > 0.88) {
        ctx.strokeStyle = "#5b4a40"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, rad - 3, 0, 6.2832); ctx.stroke();
        ctx.strokeStyle = "rgba(255,200,150,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, rad - 6, 0, 6.2832); ctx.stroke();
        K.pill(ctx, "지각", cx + rad * .74 + 8, cy - rad * .74 - 4, { s: 11.5, c: KC.violet, box: [0, LW] });
      }
      ctx.strokeStyle = "rgba(255,200,160,.45)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.2832); ctx.stroke();
      if (p > 0) K.pill(ctx, "맨틀 (규산염)", cx, cy - rad + 34, { a: "center", s: 11.5, c: "#ffe2c4" });
      if (coreR > 26) K.pill(ctx, coreR > 44 ? "핵 (철·니켈)" : "핵", cx, cy + 5, { a: "center", s: 11.5, c: "#fff4d6" });
      if (p < 1) {
        K.pill(ctx, "⬇ 철 방울", 16, H - 46, { s: 11, c: "#d9dde8" });
        K.pill(ctx, "✦ 떠오르는 규산염", LW - 16, H - 46, { s: 11, a: "right", c: KC.yellow, box: [0, LW] });
      }
      K.pill(ctx, p <= 0 ? "균질하게 섞인 마그마 바다" : (p < 1 ? "층상 분화 진행 중" : "핵·맨틀·지각 분리 완료"), cx, H - 14, { a: "center", s: 12.5, c: p >= .95 ? KC.green : KC.ink, box: [0, LW] });

      /* ── 오른쪽 : 진행도와 시간 그래프 ── */
      var RX = LW + 8, RW = W - RX;
      K.stage(ctx, RX, 0, RW, H, "lab", { seed: 5, title: "층상 분화 진행도" });
      gbar(ctx, RX + 22, 46, RW - 120, 16, p, KC.green);
      K.t(ctx, (p * 100).toFixed(1) + " %", W - 18, 61, { s: 17, w: "900", a: "right", c: KC.green });
      var g = K.chart(ctx, { x: RX + 4, y: 76, w: RW - 10, h: 206, x0: 0, x1: 200, y0: 0, y1: 100, xt: 4, yt: 4, xl: "지구 형성 후 흐른 시간 (백만 년)", yf: function (v0) { return v0 + "%"; } });
      var pts = [];
      for (var k = 0; k <= 100; k++) { var tk = k / 100 * 200; pts.push([tk, prog(tk) * 100]); }
      K.plot(ctx, g, pts, KC.green);
      var mx = g.X(t), my = g.Y(p * 100);
      K.line(ctx, { x: mx, y: g.T }, { x: mx, y: g.B }, KC.blue, 1.5, [5, 4]);
      K.glow(ctx, mx, my, 4.5, KC.blue, 4);
      K.pill(ctx, t + "백만 년 · " + (p * 100).toFixed(0) + "%", mx + (t > 120 ? -12 : 12), my + (p > .6 ? 26 : -12), { a: t > 120 ? "right" : "left", s: 11.5, c: KC.blue, box: [RX, W] });
      K.t(ctx, "⬇ 밀도가 큰 철·니켈은 가라앉아 핵이 되고,", RX + 22, 304, { s: 11.5, c: KC.mute });
      K.t(ctx, "⬆ 밀도가 작은 규산염은 떠올라 맨틀과 지각이 된다.", RX + 22, 324, { s: 11.5, c: KC.mute });
      K.t(ctx, "→ 이렇게 층이 나뉘며 지구시스템의 지권이 갖춰진다.", RX + 22, 344, { s: 11.5, c: KC.ink });
    }
    function draw() {
      paint();
      var p = prog(t);
      $("a-c2-info").innerHTML = "지구가 만들어진 뒤 <b>" + t + "백만 년</b>이 지난 시점, 층상 분화는 <b>" + (p * 100).toFixed(1) + "%</b> 진행되었습니다. "
        + (p <= 0 ? "아직 무거운 것과 가벼운 것이 뒤섞여 있습니다."
          : (p < 0.95 ? "철 방울이 중심을 향해 가라앉는 중입니다. 이때 생긴 마찰열이 지구를 더 달궜습니다."
            : "핵·맨틀·지각이 갖추어졌습니다. 액체 상태인 외핵의 대류는 지구 자기장을 만들어 태양풍으로부터 대기를 지켜 줍니다."));

      var ch = false, pc = p * 100;
      if (pc >= 48 && pc <= 52 && !got.a) { got.a = true; ch = true; }
      if (pc >= 95 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("a3", got); mission(); }
    }
    function mission() {
            if (got.a) done("m1-3a");
      if (got.b) done("m1-3b");
      if (okQ) done("m1-3c");
      if (got.a && got.b && okQ) {
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>지구가 녹아 있던 짧은 동안에 <b>밀도에 따른 층상 분화</b>가 끝났습니다. 핵·맨틀·지각이라는 지권의 뼈대는 이때 만들어졌습니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    mv = mover(canvas, paint, "철 방울");
    $("a-t").addEventListener("input", function (e) { t = +e.target.value; $("a-t-val").textContent = t; draw(); });
    window.sthPick({
      mount: "a-q1",
      q: "철과 니켈이 지구 중심으로 모인 까닭으로 가장 알맞은 것은?",
      options: [
        "지구가 빠르게 자전하면서 무거운 물질을 가운데로 끌어당겼기 때문",
        "지구 전체가 녹아 있어서, 밀도가 큰 철이 가라앉고 밀도가 작은 규산염이 떠올랐기 때문",
        "철은 자석이라 지구 자기장에 끌려 들어갔기 때문",
        "미행성이 철 덩어리를 지구 중심에 직접 박아 넣었기 때문"
      ],
      answer: 1,
      why: [
        "자전은 오히려 물질을 바깥으로 밀어냅니다. 무엇이 있어야 물질이 자유롭게 움직일 수 있었는지 생각해 보세요.",
        "마그마 바다 상태였기 때문에 밀도 차이에 따라 물질이 자리를 바꿀 수 있었습니다. 이것이 층상 분화입니다.",
        "지구 자기장은 핵이 생긴 <b>뒤에</b> 만들어졌습니다. 순서가 거꾸로입니다.",
        "미행성은 지표에 부딪힙니다. 중심까지 뚫고 들어갈 수는 없습니다."
      ],
      onDone: function () { okQ = true; window.sthState("a3q", 1); mission(); }
    });
    draw(); mission();
    if (ep.cleared(2)) window.sthMission("m1-3", true);
  })();

  /* ---- 장면 4 : 원시 대기·바다와 세 행성의 갈림길 ---- */
  function world(d, m) {
    var keep = clamp((m - 0.03) / 0.37, 0, 1);
    var co2 = 95 * keep, h2o = 270 * keep;
    var sAbs = 238.2 / (d * d);                        // 흡수하는 햇빛 (W/m²)
    if (keep < 0.10) {
      return { kind: "bare", keep: keep, co2: 0, h2o: 0, sAbs: sAbs,
        T: 278.6 * Math.pow(0.88, 0.25) / Math.sqrt(d) - 273 };
    }
    if (sAbs > 300) {
      var tv = 0.90 * co2 + 0.18 * h2o;
      return { kind: "vapor", keep: keep, co2: co2, h2o: h2o, sAbs: sAbs, tau: tv,
        T: 278.6 * Math.pow(0.25, 0.25) / Math.sqrt(d) * Math.pow(1 + 0.75 * tv, 0.25) - 273 };
    }
    var base = 278.6 * Math.pow(0.70, 0.25) / Math.sqrt(d);
    var to = 0.80 * keep, TO = base * Math.pow(1 + 0.75 * to, 0.25) - 273;
    if (TO >= 0) return { kind: "ocean", keep: keep, co2: 0.04, h2o: h2o, sAbs: sAbs, tau: to, T: TO };
    var ti = 0.12 * keep;
    return { kind: "ice", keep: keep, co2: co2, h2o: h2o, sAbs: sAbs, tau: ti,
      T: base * Math.pow(1 + 0.75 * ti, 0.25) - 273 };
  }
  var KIND = {
    bare:  { key: "d", name: "🪨 대기를 잃은 행성", col: "--mist",   li: "m1-4d" },
    vapor: { key: "b", name: "🔥 폭주 온실 행성",   col: "--rose",   li: "m1-4b" },
    ocean: { key: "a", name: "🌊 바다 행성",        col: "--brand",  li: "m1-4a" },
    ice:   { key: "c", name: "🧊 얼어붙은 행성",    col: "--violet", li: "m1-4c" }
  };

  (function () {
    var canvas = $("a-c3"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var d = 1.00, m = 1.00, got = window.sthState("a4") || {};
    var REAL = [
      { n: "수성", d: 0.39, m: 0.06 }, { n: "금성", d: 0.72, m: 0.82 },
      { n: "지구", d: 1.00, m: 1.00 }, { n: "화성", d: 1.52, m: 0.10 }
    ];
    var MX0 = 500, MW = 380, MY0 = 64, MH = 250;
    var KCOL = { ocean: KC.blue, vapor: KC.red, ice: KC.violet, bare: "#9aa0b8" };
    function mapX(dd) { return MX0 + (dd - 0.30) / 1.70 * MW; }
    function mapY(mm) { return MY0 + MH - (Math.log(mm / 0.02) / Math.log(100)) * MH; }
    /* 지도 바탕은 한 번만 계산해 둔다 */
    var CELLS = [];
    for (var gx = 0; gx < 38; gx++) for (var gy = 0; gy < 25; gy++) {
      CELLS.push([gx, gy, world(0.30 + (gx + 0.5) / 38 * 1.70, 0.02 * Math.pow(100, 1 - (gy + 0.5) / 25)).kind]);
    }
    var CR = K.rng(9), CRAT = [];
    for (var ci = 0; ci < 14; ci++) CRAT.push([CR() * 6.2832, Math.sqrt(CR()) * .8, 5 + CR() * 12]);

    function planet(cx, cy, rad, w) {
      var g = ctx.createRadialGradient(cx - rad * .38, cy - rad * .42, rad * .08, cx, cy, rad);
      if (w.kind === "ocean") { g.addColorStop(0, "#d4f0ff"); g.addColorStop(.35, "#2f86e0"); g.addColorStop(1, "#0f2f70"); }
      else if (w.kind === "vapor") { g.addColorStop(0, "#fff6d6"); g.addColorStop(.4, "#e8be6a"); g.addColorStop(1, "#6e3e14"); }
      else if (w.kind === "ice") { g.addColorStop(0, "#ffffff"); g.addColorStop(.45, "#cfe4fa"); g.addColorStop(1, "#4d6d96"); }
      else { g.addColorStop(0, "#d8d3cb"); g.addColorStop(.45, "#8a847c"); g.addColorStop(1, "#2a2724"); }
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.2832); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.2832); ctx.clip();
      if (w.kind === "ocean") {
        ctx.fillStyle = "rgba(80,180,100,.85)";
        ctx.beginPath(); ctx.ellipse(cx - 30, cy - 22, 40, 26, .4, 0, 6.2832); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 36, cy + 30, 30, 20, -.3, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 5; ctx.lineCap = "round";
        [[-60, -50, 40], [10, -8, 54], [-40, 50, 46]].forEach(function (c) { ctx.beginPath(); ctx.arc(cx + c[0], cy + c[1], c[2], .2, 1.3); ctx.stroke(); });
        ctx.lineCap = "butt";
      } else if (w.kind === "vapor") {
        for (var s = 0; s < 7; s++) {
          ctx.fillStyle = s % 2 ? "rgba(255,240,200,.35)" : "rgba(170,110,40,.28)";
          ctx.beginPath(); ctx.ellipse(cx - 20 + s * 6, cy - rad + 18 + s * 28, rad * 1.2, 9, -.12, 0, 6.2832); ctx.fill();
        }
      } else if (w.kind === "ice") {
        ctx.strokeStyle = "rgba(90,130,190,.55)"; ctx.lineWidth = 1.5;
        for (var q = -3; q <= 3; q++) { ctx.beginPath(); ctx.moveTo(cx - rad, cy + q * 26); ctx.lineTo(cx - 10, cy + q * 26 + 14); ctx.lineTo(cx + rad, cy + q * 26 + 4); ctx.stroke(); }
      } else {
        CRAT.forEach(function (c) {
          var x = cx + Math.cos(c[0]) * c[1] * rad, y = cy + Math.sin(c[0]) * c[1] * rad;
          ctx.fillStyle = "rgba(30,26,22,.45)"; ctx.beginPath(); ctx.arc(x, y, c[2], 0, 6.2832); ctx.fill();
          ctx.strokeStyle = "rgba(255,250,240,.28)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x, y, c[2], 3.4, 5.6); ctx.stroke();
        });
      }
      var sh = ctx.createRadialGradient(cx - rad * .5, cy - rad * .5, rad * .6, cx - rad * .2, cy - rad * .2, rad * 1.55);
      sh.addColorStop(0, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,15,.7)");
      ctx.fillStyle = sh; ctx.fillRect(cx - rad, cy - rad, 2 * rad, 2 * rad);
      ctx.restore();
      /* 대기 */
      if (w.keep >= 0.10) {
        var th = w.kind === "vapor" ? clamp(6 + 16 * (w.co2 / 95), 6, 22) : 4 + 4 * w.keep;
        var ag = ctx.createRadialGradient(cx, cy, rad, cx, cy, rad + th);
        ag.addColorStop(0, w.kind === "vapor" ? "rgba(255,190,90,.7)" : "rgba(130,200,255,.6)");
        ag.addColorStop(1, "rgba(130,200,255,0)");
        ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(cx, cy, rad + th, 0, 6.2832); ctx.fill();
      }
    }

    function draw() {
      var w = world(d, m), KD = KIND[w.kind], col = KCOL[w.kind];
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽 : 행성 ── */
      var LW = 440, cx = 232, cy = 168, rad = 94;
      K.stage(ctx, 0, 0, LW, H, "space", { seed: 13 });
      var sr = clamp(13 / d, 7, 36);
      K.sun(ctx, 34, 112, sr);
      K.pill(ctx, "태양", 34, 134 + sr, { a: "center", s: 11, c: KC.yellow });
      K.pill(ctx, "어떤 행성이 될까", 16, 28, { s: 13, c: KC.blue });
      planet(cx, cy, rad, w);
      K.pill(ctx, KD.name, cx, 296, { a: "center", s: 15, c: col, box: [0, LW] });
      K.pill(ctx, "지표 평균 온도 " + Math.round(w.T) + " ℃", cx, 326, { a: "center", s: 12.5, c: KC.ink, box: [0, LW] });
      K.t(ctx, "대기를 붙잡는 힘 " + Math.round(w.keep * 100) + "% · 대기 CO₂ "
        + (w.kind === "vapor" ? Math.round(w.co2) + "기압" : (w.kind === "ocean" ? "약 0.0004기압(0.04%)" : (w.kind === "ice" ? "적음" : "거의 없음"))), cx, 354, { s: 11.5, c: KC.mute, a: "center" });
      K.t(ctx, "받는 햇빛 " + Math.round(w.sAbs) + " W/m² (지구 238)", cx, 374, { s: 11.5, c: KC.mute, a: "center" });
      K.warn(ctx, LW - 14, 28, "⚠ 크기·거리 비율 아님", "right");

      /* ── 오른쪽 : 갈림길 지도 ── */
      var RX = LW + 8;
      K.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 2, title: "갈림길 지도" });
      K.t(ctx, "가로 = 거리 · 세로 = 질량(지구 = 1)", RX + 168, 30, { s: 10.5, c: KC.mute });
      ctx.globalAlpha = .42;
      CELLS.forEach(function (c) { ctx.fillStyle = KCOL[c[2]]; ctx.fillRect(MX0 + c[0] * 10, MY0 + c[1] * 10, 10, 10); });
      ctx.globalAlpha = 1;
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5; ctx.strokeRect(MX0, MY0, MW, MH);
      [[0.3, "0.3"], [1.0, "1.0 AU"], [2.0, "2.0"]].forEach(function (g) {
        var gx0 = mapX(g[0]);
        K.t(ctx, g[1], clamp(gx0, MX0 + 10, MX0 + MW - 16), MY0 + MH + 16, { s: 10.5, c: KC.mute, a: "center", w: "600" });
      });
      [[2, "질량 2"], [0.2, "0.2"], [0.02, "0.02"]].forEach(function (g) {
        K.t(ctx, g[1], MX0 - 6, clamp(mapY(g[0]) + 4, MY0 + 8, MY0 + MH + 2), { s: 10.5, c: KC.mute, a: "right", w: "600" });
      });
      K.t(ctx, "태양에서 멀어짐 →", MX0 + MW, MY0 + MH + 34, { s: 10.5, c: KC.dim, a: "right" });
      var curX = clamp(mapX(d), MX0, MX0 + MW), curY = clamp(mapY(m), MY0, MY0 + MH);
      REAL.forEach(function (p) {
        var px = mapX(p.d), py = mapY(p.m), near = Math.abs(curX - px) < 70 && Math.abs(curY - py) < 22 && curX >= px - 4;
        K.glow(ctx, px, py, 3.2, "rgba(255,255,255,.95)", 3.5);
        K.pill(ctx, p.n, near ? px - 22 : px + 9, py + 4, { s: 11, a: near ? "right" : "left", c: KC.ink, box: [MX0, MX0 + MW] });
      });
      ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 12; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(curX, curY, 10, 0, 6.2832); ctx.stroke(); ctx.restore();
      K.line(ctx, { x: curX - 18, y: curY }, { x: curX - 12, y: curY }, "#fff", 2); K.line(ctx, { x: curX + 12, y: curY }, { x: curX + 18, y: curY }, "#fff", 2);
      var lx = RX + 14;
      ["ocean", "vapor", "ice", "bare"].forEach(function (k) {
        var r = K.pill(ctx, "■ " + KIND[k].name.slice(3), lx, 384, { s: 10.5, c: KCOL[k], box: [RX, W] });
        lx = r.x + r.w + 8 + 7;
      });

      var msg;
      if (w.kind === "ocean") msg = "화산에서 빠져나온 수증기가 <b>응결해 비가 되고 원시 바다</b>가 되었습니다. 바닷물은 대기의 이산화 탄소를 녹여 석회암으로 묻어 버리므로 대기압도 낮게 유지됩니다. 지구가 걸은 길입니다.";
      else if (w.kind === "vapor") msg = "햇빛을 너무 많이 받아 수증기가 <b>끝내 응결하지 못했습니다</b>. 수증기와 이산화 탄소가 그대로 대기에 남아 온실 효과를 키우고, 그래서 더 뜨거워집니다(폭주 온실). 금성이 걸은 길입니다.";
      else if (w.kind === "ice") msg = "물은 있지만 햇빛이 모자라거나 대기가 얇아 <b>모두 얼어붙었습니다</b>. 화성이 걸은 길입니다.";
      else msg = "중력이 약해 화산이 내놓은 기체를 <b>붙잡지 못했습니다</b>. 대기도 바다도 없이 맨바위가 드러난 행성입니다. 수성이 걸은 길입니다.";
      $("a-c3-info").innerHTML = "<b>" + KD.name + "</b> · " + d.toFixed(2) + " AU · 질량 " + m.toFixed(2) + "배 → 지표 평균 " + Math.round(w.T) + " ℃<br>" + msg;

      if (!got[KD.key]) { got[KD.key] = 1; window.sthState("a4", got); mission(); }
    }
    function mission() {
      var n = 0;
      ["a", "b", "c", "d"].forEach(function (k) {
        var e = { a: "m1-4a", b: "m1-4b", c: "m1-4c", d: "m1-4d" }[k];
        if (got[k]) { done(e); n++; }
      });
      if (n === 4) {
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>네 갈래를 모두 만들었습니다. 같은 재료로 시작해도 <b>거리(받는 햇빛)</b>와 <b>질량(대기를 붙잡는 힘)</b>이 다르면 전혀 다른 행성이 됩니다.");
        ep.clear(3);
      }
    }
    function setDM(nd, nm) {
      d = nd; m = nm;
      $("a-d").value = String(nd); $("a-m").value = String(nm);
      $("a-d-val").textContent = nd.toFixed(2); $("a-m-val").textContent = nm.toFixed(2);
      draw();
    }
    $("a-d").addEventListener("input", function (e) { d = +e.target.value; $("a-d-val").textContent = d.toFixed(2); draw(); });
    $("a-m").addEventListener("input", function (e) { m = +e.target.value; $("a-m-val").textContent = m.toFixed(2); draw(); });
    $("a-set-me").addEventListener("click", function () { setDM(0.39, 0.06); });
    $("a-set-ve").addEventListener("click", function () { setDM(0.72, 0.82); });
    $("a-set-ea").addEventListener("click", function () { setDM(1.00, 1.00); });
    $("a-set-ma").addEventListener("click", function () { setDM(1.52, 0.10); });
    canvas._redraw = draw;
    draw(); mission();
    if (ep.cleared(3)) window.sthMission("m1-4", true);
  })();

  /* ---- 장면 5 : 결말 ---- */
  function reveal() {
    $("e1-wrap").hidden = false;
    var p = window.sthState("p1") || "";
    $("e1-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>"
      + (p.indexOf("㉡") === 0 ? "처음부터 정확히 짚었습니다. 이제 모형으로 증명까지 했습니다."
        : "모형을 돌려 보니 재료나 우연한 충돌보다 <b>거리와 크기</b>가 결정적이었습니다. 생각을 증거로 고쳐 나가는 것이 과학입니다.");
  }
  function finish() { window.sthState("r1", "해결 · 첫 추리: " + (window.sthState("p1") || "-").slice(0, 60)); }

  var CLUES = [
    { t: "표면의 71%가 액체 상태의 바다로 덮여 있다", a: "ea", why: "액체 상태의 물이 그대로 남은 행성은 지구뿐입니다." },
    { t: "판 구조 운동이 지금도 활발하고 자기장이 강하다", a: "ea", why: "내부가 아직 뜨거워 맨틀 대류가 계속되고 있습니다.", hint: "내부 열이 아직 남아 있는 행성입니다." },
    { t: "대기압이 92기압이고 대기의 96%가 이산화 탄소다", a: "ve", why: "바다가 없어 이산화 탄소가 대기에 그대로 남았습니다." },
    { t: "표면 온도가 납을 녹일 만큼 높은 약 462 ℃이다", a: "ve", why: "폭주 온실이 만든 온도입니다.", hint: "온실 효과가 폭주한 행성입니다." },
    { t: "물이 흐른 지형이 남아 있지만 지금은 얼음과 서리뿐이다", a: "ma", why: "한때 따뜻했지만 대기를 잃고 얼어붙었습니다." },
    { t: "지구의 약 1/10 질량이라 내부가 빨리 식었고 자기장도 사라졌다", a: "ma", why: "작은 행성은 열을 빨리 잃고, 자기장이 사라지면 대기도 깎여 나갑니다.", hint: "대기압이 0.006기압인 행성입니다." },
    { t: "태양에 가장 가깝고 작아, 대기를 거의 붙잡지 못했다", a: "me", why: "중력이 약한 데다 뜨거워 기체가 모두 달아났습니다." },
    { t: "형성 초기의 충돌 크레이터가 거의 그대로 남아 있다", a: "me", why: "대기도 물도 없어 지형을 깎을 것이 없습니다.", hint: "풍화와 침식을 일으킬 대기가 없는 행성입니다." }
  ];
  if (ep.cleared(4)) {
    $("a-sort").innerHTML = "<div class='sort' style='padding:16px 18px 18px'><div class='msg'>🎉 여덟 단서를 모두 분류했습니다.</div></div>";
    reveal();
  } else {
    window.sthSort({
      mount: "a-sort",
      buckets: [
        { id: "me", label: "수성", sub: "0.39 AU · 질량 0.06배" },
        { id: "ve", label: "금성", sub: "0.72 AU · 질량 0.82배" },
        { id: "ea", label: "지구", sub: "1.00 AU · 질량 1.00배" },
        { id: "ma", label: "화성", sub: "1.52 AU · 질량 0.10배" }
      ],
      items: CLUES,
      doneText: "모형이 예측한 그대로입니다.",
      onDone: function () { reveal(); ep.clear(4); }
    });
  }
  window.sthWork({
    mount: "wk1", unitLabel: "[지구시스템과학1 Ⅰ-1] 이야기 ① 세 행성의 갈림길",
    items: [
      { id: "e1a", label: "원시 지구가 지구시스템의 네 권역을 갖추기까지", hint: "미행성 집적 → 마그마 바다 → 층상 분화 → 원시 대기 → 원시 바다 → 생명체 출현의 순서로, 각 단계에서 어느 권역이 만들어졌는지 짚어 쓰세요." },
      { id: "e1b", label: "금성과 화성에게 모자랐던 것", hint: "금성과 화성이 지구와 달라진 까닭을 ‘받는 햇빛’과 ‘대기를 붙잡는 힘’이라는 말을 넣어 각각 한 문장씩 쓰세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ② 25억 년 된 줄무늬
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "g2", key: "p2", title: "조사관의 첫 추리",
    question: "세계의 호상철광층이 약 25억 년 전에 몰려 있는 까닭은 무엇일까요?",
    options: [
      "㉠ 그 무렵 지구에 철을 실은 운석이 집중적으로 떨어졌다",
      "㉡ 그 무렵 바다에 산소가 퍼져 녹아 있던 철이 한꺼번에 가라앉았다",
      "㉢ 그 무렵 화산 활동이 가장 활발해 철이 많이 뿜어져 나왔다"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 장면 2 : 산소 수지 ---- */
  var FE = 100, NT = 200;
  function oxy(P, V) {
    var net = P - V;
    var tStar = net > 0 ? FE / net : null;
    return { net: net, tStar: tStar, start: net > 0 && tStar < NT };
  }
  function ironAt(net, t) { return net > 0 ? Math.max(0, FE - net * t) : FE; }
  function atmAt(net, tStar, t) { return (net > 0 && t > tStar) ? (t - tStar) * net * 0.30 : 0; }

  (function () {
    var canvas = $("b-c1"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var P = 0, V = 6, got = window.sthState("b2") || { a: false, b: false, c: false };
    var mv = null, RB = K.rng(12), SPECK = [];
    for (var sq = 0; sq < 16; sq++) SPECK.push([RB(), RB()]);

    function paint() {
      var r = oxy(P, V), net = r.net, tS = r.tStar, tt = mv ? mv.t : 0;
      var atmEnd = atmAt(net, tS, NT), ironEnd = ironAt(net, NT), aMax = Math.max(120, atmEnd);
      ctx.clearRect(0, 0, W, H);
      /* ── 위 : 네 권역을 거치는 산소의 길 ── */
      var TH = 176;
      K.stage(ctx, 0, 0, W, TH, "night", { seed: 6 });
      K.pill(ctx, "산소가 가는 길 · 남세균이 나타난 지 200칸 뒤", 16, 28, { s: 13, c: KC.blue });
      K.pill(ctx, "🌋 화산 기체(H₂·H₂S)도 산소를 " + V + "만큼 먹어 치운다", W - 16, 28, { s: 11.5, a: "right", c: KC.red });
      var cards = [
        { t: "생물권", s: "남세균의 광합성", val: "산소 생산 " + P, c: KC.green },
        { t: "수권", s: "바닷속 철 이온 Fe²⁺", val: "잔량 " + Math.round(ironEnd), c: KC.blue },
        { t: "지권", s: "해저의 호상철광층", val: "퇴적 " + Math.round(FE - ironEnd), c: KC.orange },
        { t: "기권", s: "대기에 쌓인 산소", val: "축적 " + atmEnd.toFixed(0), c: KC.violet }
      ];
      var cy0 = 42, ch = 122, cw = 196;
      cards.forEach(function (b, i) {
        var x = 16 + i * 222;
        glass(ctx, x, cy0, cw, ch, b.c);
        K.pill(ctx, b.t, x + 12, cy0 + 24, { s: 12.5, c: b.c, box: [x, x + cw] });
        K.t(ctx, b.s, x + 12, cy0 + 46, { s: 11, c: KC.mute });
        K.t(ctx, b.val, x + 12, cy0 + 66, { s: 13, w: "900", c: KC.ink });
        var ix = x + 12, iy = cy0 + 78, iw = cw - 24, ih = 34, k, n;
        ctx.save(); ctx.beginPath(); ctx.roundRect(ix, iy, iw, ih, 8); ctx.clip();
        if (i === 0) {                       /* 남세균 사슬과 산소 거품 */
          ctx.fillStyle = "rgba(20,70,50,.6)"; ctx.fillRect(ix, iy, iw, ih);
          n = Math.round(P / 20 * 9);
          for (k = 0; k < 9; k++) {
            var on = k < n, bx = ix + 12 + k * 19, by = iy + 22 + Math.sin(k * 1.3) * 4;
            ctx.globalAlpha = on ? 1 : .25; K.planet(ctx, bx, by, 5, "#5fe0a0", "#0f5a3a"); ctx.globalAlpha = 1;
            if (on) { var bu = (tt * .5 + k * .37) % 1; ctx.globalAlpha = 1 - bu; K.glow(ctx, bx + 4, by - 8 - bu * 18, 1.6, KC.violet, 3); ctx.globalAlpha = 1; }
          }
        } else if (i === 1) {                /* 녹아 있는 철 이온 */
          var wg = ctx.createLinearGradient(0, iy, 0, iy + ih); wg.addColorStop(0, "#16568f"); wg.addColorStop(1, "#08223f");
          ctx.fillStyle = wg; ctx.fillRect(ix, iy, iw, ih);
          n = Math.round(ironEnd / FE * 16);
          for (k = 0; k < n; k++) K.glow(ctx, ix + 8 + SPECK[k][0] * (iw - 16) + Math.sin(tt * 1.5 + k) * 2, iy + 6 + SPECK[k][1] * (ih - 12), 1.8, "rgba(120,240,220,.95)", 3);
        } else if (i === 2) {                /* 줄무늬 바위 — 산화철 띠가 쌓인다 */
          ctx.fillStyle = "#3a3440"; ctx.fillRect(ix, iy, iw, ih);
          n = Math.round((FE - ironEnd) / FE * 8);
          for (k = 0; k < 8; k++) {
            var yb = iy + ih - (k + 1) * 4.2;
            ctx.fillStyle = k < n ? (k % 2 ? "#8c8a96" : "#b8402c") : "rgba(255,255,255,.04)";
            ctx.fillRect(ix, yb, iw, 4.2);
          }
        } else {                             /* 대기의 산소 분자 */
          var sg = ctx.createLinearGradient(0, iy, 0, iy + ih); sg.addColorStop(0, "#1a1f55"); sg.addColorStop(1, "#2e2a6e");
          ctx.fillStyle = sg; ctx.fillRect(ix, iy, iw, ih);
          n = Math.round(clamp(atmEnd / aMax, 0, 1) * 16);
          for (k = 0; k < n; k++) K.glow(ctx, ix + 8 + SPECK[15 - k][0] * (iw - 16), iy + 6 + SPECK[15 - k][1] * (ih - 12) + Math.sin(tt + k) * 2, 1.9, KC.violet, 3);
        }
        ctx.restore();
        if (i < 3) {
          var a = { x: x + cw + 3, y: cy0 + 62 }, bpt = { x: x + 219, y: cy0 + 62 };
          var live = i === 0 ? P > 0 : (i === 1 ? net > 0 : r.start);
          K.arrow(ctx, a, bpt, live ? KC.violet : "rgba(160,170,220,.35)", 2.4, 8);
          if (live) flow(ctx, a, { x: bpt.x - 6, y: bpt.y }, tt * .8, KC.violet, 2, 1.8);
        }
      });

      /* ── 아래 : 시간에 따른 변화 ── */
      var GY0 = TH + 8;
      K.stage(ctx, 0, GY0, W, H - GY0, "lab", { seed: 4 });
      var g = K.chart(ctx, { x: 0, y: GY0, w: W, h: H - GY0, pl: 64, pt: 44, pr: 22, x0: 0, x1: NT, y0: 0, y1: 100, xt: 4, yt: 4,
        xl: "남세균이 나타난 뒤 흐른 시간 (칸)" });
      var endX = r.start ? g.X(tS) : g.R;
      if (P > 0) {
        ctx.fillStyle = "rgba(255,120,80,.08)"; ctx.fillRect(g.L, g.T, endX - g.L, g.B - g.T);
        if (endX - g.L > 230) K.pill(ctx, net > 0 ? "철이 산화되어 가라앉는 기간" : "산소가 모두 소모되는 기간", (g.L + endX) / 2, g.T + 22, { a: "center", s: 11, c: KC.orange });
      }
      var ip = [], ap = [];
      for (var i2 = 0; i2 <= 200; i2++) {
        var t2 = i2 / 200 * NT;
        ip.push([t2, ironAt(net, t2) / FE * 100]);
        ap.push([t2, clamp(atmAt(net, tS, t2) / aMax, 0, 1) * 100]);
      }
      K.plot(ctx, g, ip, KC.blue);
      K.plot(ctx, g, ap, KC.violet);
      if (r.start) {
        K.line(ctx, { x: g.X(tS), y: g.T }, { x: g.X(tS), y: g.B }, KC.yellow, 2, [5, 5]);
        K.pill(ctx, "철이 바닥남 (" + tS.toFixed(0) + "칸)", g.X(tS) + 8, g.T + 22, { s: 11, c: KC.yellow, box: [0, W - 8] });
        K.glow(ctx, g.X(tS), g.B, 3.5, KC.yellow, 3.5);
      }
      var lr = K.pill(ctx, "● 바닷속 철 이온 잔량 (처음 = 100)", 64, GY0 + 28, { s: 11.5, c: KC.blue });
      K.pill(ctx, "● 대기에 쌓인 산소 (상대값)", lr.x + lr.w + 14, GY0 + 28, { s: 11.5, c: KC.violet });
    }
    function draw() {
      paint();
      var r = oxy(P, V), net = r.net, tS = r.tStar, atmEnd = atmAt(net, tS, NT);
      $("b-c1-info").innerHTML = P === 0
        ? "남세균이 아직 산소를 만들지 않습니다. <b>산소 생산 속도</b>를 올려 보세요."
        : (net <= 0
          ? "산소를 <b>" + P + "</b>만큼 만들지만 화산 기체가 <b>" + V + "</b>만큼 먹어 치웁니다. 남는 산소가 없어 바닷속 철도 줄지 않고 대기에도 아무것도 쌓이지 않습니다."
          : "순수하게 남는 산소는 <b>" + net + "</b>입니다. 이 산소가 먼저 바닷속 철 이온을 산화시켜 해저에 <b>호상철광층</b>으로 쌓고, 철이 바닥나는 <b>" + tS.toFixed(0) + "칸</b>부터 비로소 <b>대기</b>에 쌓이기 시작합니다. 200칸까지의 대기 축적량은 " + atmEnd.toFixed(0) + "입니다.");

      var ch = false;
      if (P >= 1 && net <= 0 && !got.a) { got.a = true; ch = true; }
      if (r.start && !got.b) { got.b = true; ch = true; }
      if (net > 0 && tS <= 50 && !got.c) { got.c = true; ch = true; }
      if (ch) { window.sthState("b2", got); mission(); }
    }
    function mission() {
            if (got.a) done("m2-2a");
      if (got.b) done("m2-2b");
      if (got.c) done("m2-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>산소는 <b>소모처를 다 채운 뒤에야</b> 대기에 쌓입니다. 호상철광층은 그 ‘소모되던 기간’의 영수증인 셈입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    mv = mover(canvas, paint, "산소 흐름");
    $("b-p").addEventListener("input", function (e) { P = +e.target.value; $("b-p-val").textContent = P; draw(); });
    $("b-v").addEventListener("input", function (e) { V = +e.target.value; $("b-v-val").textContent = V; draw(); });
    draw(); mission();
    if (ep.cleared(1)) window.sthMission("m2-2", true);
  })();

  /* ---- 장면 3 : 산소 농도 곡선 ---- */
  var CURVE = [[46, 0.0001], [24, 0.0001], [20, 2], [8, 2], [5.4, 15], [3, 30], [2, 15], [0, 21]];
  function o2At(age) {
    if (age >= 46) return 0.0001;
    if (age <= 0) return 21;
    for (var i = 0; i < CURVE.length - 1; i++) {
      var a = CURVE[i], b = CURVE[i + 1];
      if (age <= a[0] && age >= b[0]) return a[1] + (b[1] - a[1]) * ((a[0] - age) / (a[0] - b[0]));
    }
    return 21;
  }
  var ERA = [
    { hi: 46, lo: 40, t: "지구 탄생과 마그마 바다. 산소는 사실상 0입니다." },
    { hi: 40, lo: 35, t: "원시 바다가 자리 잡고, 최초의 생명체가 나타난 것으로 추정되는 시기입니다." },
    { hi: 35, lo: 27, t: "산소를 쓰지 않는 미생물의 시대입니다. 대기는 질소와 이산화 탄소가 주인공입니다." },
    { hi: 27, lo: 24, t: "남세균이 광합성을 시작했지만, 산소는 바닷속 철 이온과 화산 기체가 모두 먹어 치웁니다. 호상철광층이 쌓이는 시기입니다." },
    { hi: 24, lo: 20, t: "대산소화 사건. 바닷속 철이 바닥나자 산소가 대기에 쌓이기 시작합니다." },
    { hi: 20, lo: 8, t: "산소 농도가 낮은 상태로 오래 머뭅니다. 진핵생물이 나타나는 시기이기도 합니다." },
    { hi: 8, lo: 5.4, t: "산소가 다시 크게 늘어납니다. 곧이어 몸집이 큰 동물들이 폭발적으로 늘어납니다." },
    { hi: 5.4, lo: 3, t: "오존층이 두꺼워지고 식물과 동물이 육상으로 올라옵니다. 거대한 숲이 만들어지며 산소는 최고치에 이릅니다." },
    { hi: 3, lo: 2, t: "숲의 탄소가 대량으로 묻히던 시기가 끝나고 산소가 줄어듭니다." },
    { hi: 2, lo: 0, t: "산소 농도가 21% 부근에서 안정됩니다. 오늘날의 대기입니다." }
  ];
  function eraOf(age) { for (var i = 0; i < ERA.length; i++) if (age <= ERA[i].hi && age >= ERA[i].lo) return ERA[i].t; return ERA[ERA.length - 1].t; }

  (function () {
    var canvas = $("b-c2"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var age = 46, got = window.sthState("b3") || { a: false, b: false }, okQ = !!window.sthState("b3q");
    var LO = Math.log(0.0001) / Math.LN10, HI = Math.log(40) / Math.LN10;
    var X0 = 84, X1 = 876;

    function px(a) { return X0 + (46 - a) / 46 * (X1 - X0); }
    function py(val, y0, y1) { return y1 - (Math.log(Math.max(val, 0.0001)) / Math.LN10 - LO) / (HI - LO) * (y1 - y0); }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      K.stage(ctx, 0, 0, W, H, "lab", { seed: 15, title: "대기 중 산소 농도 (%, 로그 눈금)" });
      var y0 = 56, y1 = H - 52, i;
      ctx.fillStyle = "rgba(255,255,255,.03)"; ctx.fillRect(X0, y0, X1 - X0, y1 - y0);
      /* 산소가 거의 없던 시대 */
      ctx.fillStyle = "rgba(255,120,80,.07)"; ctx.fillRect(X0, y0, px(24) - X0, y1 - y0);
      K.t(ctx, "산소가 거의 없던 시대", (X0 + px(24)) / 2, y0 + 44, { s: 11, a: "center", c: KC.orange });
      [0.0001, 0.001, 0.01, 0.1, 1, 10].forEach(function (g) {
        var gy = py(g, y0, y1);
        K.line(ctx, { x: X0, y: gy }, { x: X1, y: gy }, KC.grid, 1);
        K.t(ctx, g + "%", X0 - 6, gy + 4, { s: 10.5, c: KC.mute, a: "right", w: "600" });
      });
      [46, 40, 30, 24, 20, 10, 5, 0].forEach(function (g) {
        K.t(ctx, g + "", px(g), y1 + 16, { s: 10.5, c: KC.mute, a: "center", w: "600" });
      });
      K.t(ctx, "억 년 전", X1, y1 + 34, { s: 11, c: KC.mute, a: "right" });
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X0, y0); ctx.lineTo(X0, y1); ctx.lineTo(X1, y1); ctx.stroke();

      /* 곡선 아래 칠하기 + 빛나는 곡선 */
      var pts = [];
      for (i = 0; i <= 460; i++) { var a = 46 - i / 460 * 46; pts.push([px(a), py(o2At(a), y0, y1)]); }
      var ag = ctx.createLinearGradient(0, y0, 0, y1); ag.addColorStop(0, "rgba(63,211,163,.32)"); ag.addColorStop(1, "rgba(63,211,163,0)");
      ctx.fillStyle = ag; ctx.beginPath(); ctx.moveTo(pts[0][0], y1);
      pts.forEach(function (p) { ctx.lineTo(p[0], p[1]); }); ctx.lineTo(pts[pts.length - 1][0], y1); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.strokeStyle = KC.green; ctx.lineWidth = 3; ctx.shadowColor = KC.green; ctx.shadowBlur = 10;
      ctx.beginPath(); pts.forEach(function (p, k) { if (k) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); ctx.restore();

      [[24, "대산소화 사건"], [4.4, "육상 진출"]].forEach(function (mk) {
        var mxx = px(mk[0]);
        K.line(ctx, { x: mxx, y: y0 }, { x: mxx, y: y1 }, KC.yellow, 1.8, [5, 5]);
        K.pill(ctx, mk[1], mxx + 6, y0 + 16, { s: 11, c: KC.yellow, box: [0, W - 6] });
      });

      var val = o2At(age), cxp = px(age), cyp = py(val, y0, y1);
      K.line(ctx, { x: cxp, y: y0 }, { x: cxp, y: y1 }, KC.blue, 1.6, [4, 4]);
      K.glow(ctx, cxp, cyp, 5, KC.blue, 4);
      var right = cxp > 700;
      K.pill(ctx, age.toFixed(1) + "억 년 전 · " + (val < 0.01 ? val.toFixed(4) : val.toFixed(1)) + "%", cxp + (right ? -12 : 12), val > 3 ? cyp + 30 : cyp - 14,
        { a: right ? "right" : "left", s: 13, c: KC.blue, box: [X0, W - 6] });

      $("b-c2-info").innerHTML = "약 <b>" + age.toFixed(1) + "억 년 전</b>, 대기 중 산소 농도는 약 <b>"
        + (val < 0.01 ? val.toFixed(4) : val.toFixed(1)) + "%</b>였습니다. " + eraOf(age);

      var ch = false;
      if (Math.abs(val - 1) <= 0.25 && !got.a) { got.a = true; ch = true; }
      if (Math.abs(age - 3) <= 0.3 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("b3", got); mission(); }
    }
    function mission() {
            if (got.a) done("m2-3a");
      if (got.b) done("m2-3b");
      if (okQ) done("m2-3c");
      if (got.a && got.b && okQ) {
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>산소는 <b>한 번에</b> 오늘 수준이 된 것이 아니라, 약 24억 년 전과 약 6억 년 전에 <b>두 번</b> 크게 늘었습니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("b-age").addEventListener("input", function (e) { age = +e.target.value; $("b-age-val").textContent = age.toFixed(1); draw(); });
    window.sthPick({
      mount: "b-q1",
      q: "호상철광층이 약 25억 년 전 전후에 몰려 있고, 그 뒤로는 거의 만들어지지 않은 까닭은?",
      options: [
        "지구에 있던 철이 그때 모두 써 버려 남지 않았기 때문",
        "산소가 퍼진 바다에서는 철이 녹아 있지 못하고 곧바로 산화·침전되어, 한꺼번에 쌓일 만큼 모이지 않기 때문",
        "그 뒤로 남세균이 멸종해 산소를 만들지 못했기 때문",
        "그 뒤로 화산 활동이 완전히 멈추어 철이 공급되지 않았기 때문"
      ],
      answer: 1,
      why: [
        "지구의 철은 대부분 핵에 있습니다. 문제는 철의 양이 아니라 <b>바닷물에 녹아 있을 수 있는가</b>입니다.",
        "산소가 없는 바다에서만 철 이온(Fe²⁺)이 녹은 채 오래 쌓일 수 있습니다. 대산소화 사건 뒤에는 그런 바다가 사라졌습니다.",
        "남세균은 지금도 살아 있습니다.",
        "화산 활동은 지금도 계속되고 있습니다."
      ],
      onDone: function () { okQ = true; window.sthState("b3q", 1); mission(); }
    });
    draw(); mission();
    if (ep.cleared(2)) window.sthMission("m2-3", true);
  })();

  /* ---- 장면 4 : 오존층 ---- */
  function ozone(pct) {
    var pal = pct / 21;
    var rel = 100 * Math.pow(Math.max(pal, 0), 0.55);          // 오늘날을 100으로 본 오존층 두께
    return { rel: rel, tr: Math.exp(-5.81 * rel / 100) };
  }

  (function () {
    var canvas = $("b-c3"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var pct = 2, got = window.sthState("b4") || { a: false, b: false }, mv = null;
    var RO = K.rng(31), O3 = [];
    for (var oq = 0; oq < 26; oq++) O3.push([RO(), RO()]);

    function o3(x, y, s) {
      K.planet(ctx, x - s, y + s * .6, s, "#d8c8ff", "#4b3a8a"); K.planet(ctx, x + s, y + s * .6, s, "#d8c8ff", "#4b3a8a"); K.planet(ctx, x, y - s * .7, s, "#d8c8ff", "#4b3a8a");
    }
    function paint() {
      var o = ozone(pct), tr = o.tr, tt = mv ? mv.t : 0;
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽 : 하늘과 땅 ── */
      var LW = 556, ozY = 150, ground = 318;
      K.stage(ctx, 0, 0, LW, H, "night", { seed: 9 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      var sk = ctx.createLinearGradient(0, 0, 0, ground);
      sk.addColorStop(0, "#070a24"); sk.addColorStop(.42, "#1b2f6a"); sk.addColorStop(1, "#4f8fcf");
      ctx.fillStyle = sk; ctx.fillRect(0, 0, LW, ground);
      K.sun(ctx, 46, 46, 13);
      /* 오존층 */
      var th = clamp(o.rel / 100 * 40, 2, 48), oa = clamp(0.15 + o.rel / 130, 0.15, 0.9);
      var og = ctx.createLinearGradient(0, ozY - th / 2 - 8, 0, ozY + th / 2 + 8);
      og.addColorStop(0, "rgba(182,156,255,0)"); og.addColorStop(.5, "rgba(182,156,255," + oa + ")"); og.addColorStop(1, "rgba(182,156,255,0)");
      ctx.fillStyle = og; ctx.fillRect(0, ozY - th / 2 - 8, LW, th + 16);
      var nO = Math.round(clamp(o.rel / 100, 0, 1.3) * 20);
      for (var k = 0; k < nO; k++) o3(20 + O3[k][0] * (LW - 40), ozY - th / 2 + O3[k][1] * th, 2.6);
      /* 자외선 — 오존층에서 막히거나 땅까지 내려온다 */
      var N = 6;
      for (var i = 0; i < N; i++) {
        var ax = 96 + i * 76, pass = (i + 0.5) / N <= tr, stopY = pass ? ground - 4 : ozY - th / 2 + 2;
        K.line(ctx, { x: ax, y: 70 }, { x: ax, y: stopY }, "rgba(255,90,200,.28)", 2);
        for (var p = 0; p < 3; p++) {
          var u = (tt * .55 + p / 3 + i * .17) % 1, yy = 70 + u * (ground - 70);
          if (yy > stopY) { if (!pass && yy < stopY + 26) { ctx.globalAlpha = 1 - (yy - stopY) / 26; K.glow(ctx, ax, stopY, 3, "rgba(255,200,255,.95)", 4); ctx.globalAlpha = 1; } continue; }
          ctx.save(); ctx.strokeStyle = "#ff6ad5"; ctx.shadowColor = "#ff6ad5"; ctx.shadowBlur = 8; ctx.lineWidth = 2.4;
          ctx.beginPath();
          for (var z = 0; z <= 14; z++) { var zy = yy - 26 + z * 2, zx = ax + Math.sin(z * 1.4) * 4; if (z) ctx.lineTo(zx, zy); else ctx.moveTo(zx, zy); }
          ctx.stroke(); ctx.restore();
        }
        if (!pass) { ctx.strokeStyle = "rgba(255,170,230,.55)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax - 7, ozY + th / 2 + 8); ctx.lineTo(ax + 7, ozY + th / 2 + 22); ctx.moveTo(ax + 7, ozY + th / 2 + 8); ctx.lineTo(ax - 7, ozY + th / 2 + 22); ctx.stroke(); }
      }
      /* 땅과 바다 */
      var lg = ctx.createLinearGradient(0, ground, 0, H);
      if (tr < 0.01) { lg.addColorStop(0, "#4f8a3c"); lg.addColorStop(1, "#22401c"); } else { lg.addColorStop(0, "#9a6a46"); lg.addColorStop(1, "#4a2e1c"); }
      ctx.fillStyle = lg; ctx.fillRect(0, ground, 330, H - ground);
      var sg = ctx.createLinearGradient(0, ground, 0, H); sg.addColorStop(0, "#2f7fd0"); sg.addColorStop(1, "#0a2a5a");
      ctx.fillStyle = sg; ctx.fillRect(330, ground + 6, LW - 330, H - ground);
      ctx.strokeStyle = "rgba(200,235,255,.5)"; ctx.lineWidth = 1.2;
      for (var wv = 0; wv < 3; wv++) { ctx.beginPath(); for (var wx = 334; wx <= LW; wx += 6) { var wy = ground + 12 + wv * 16 + Math.sin(wx * .08 + tt * 2 + wv) * 2; if (wx === 334) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy); } ctx.stroke(); }
      if (tr < 0.01) {
        for (var pl = 0; pl < 9; pl++) {
          var tx = 26 + pl * 34, tb = ground + 2, hgt = 18 + (pl % 3) * 8;
          ctx.strokeStyle = "#2f6a2a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx, tb); ctx.lineTo(tx, tb - hgt); ctx.stroke();
          for (var lf = 0; lf < 4; lf++) { ctx.fillStyle = lf % 2 ? "#5fd06a" : "#3fae55"; ctx.beginPath(); ctx.ellipse(tx + (lf % 2 ? 6 : -6), tb - hgt + 4 + lf * 4, 7, 3, lf % 2 ? -.5 : .5, 0, 6.2832); ctx.fill(); }
        }
      } else {
        for (var rk = 0; rk < 7; rk++) K.planet(ctx, 30 + rk * 42, ground + 10 + (rk % 2) * 6, 5 + (rk % 3) * 2, "#b08060", "#3a2416");
      }
      ctx.restore();
      K.pill(ctx, "☀️ 태양 자외선", 76, 34, { s: 12, c: "#ff9ae6" });
      K.pill(ctx, "오존층 (O₃)", 16, ozY - th / 2 - 12, { s: 12, c: KC.violet });
      K.pill(ctx, "두께 " + o.rel.toFixed(0) + " (오늘날 = 100)", LW - 16, ozY - th / 2 - 12, { s: 11.5, a: "right", c: KC.violet, box: [0, LW] });
      K.pill(ctx, tr < 0.01 ? "🌿 육지에 생물이 살 수 있다" : "🏜️ 육지는 자외선에 그대로 노출된다", 16, ground + 44, { s: 12.5, c: tr < 0.01 ? KC.green : KC.orange });
      K.pill(ctx, "바닷속은 물이 자외선을 막아 준다", 443, H - 14, { s: 10.5, a: "center", c: "#bfe6ff", box: [330, LW] });

      /* ── 오른쪽 : 계기판 ── */
      var RX = LW + 8, RW = W - RX, mid = RX + RW / 2;
      K.stage(ctx, RX, 0, RW, H, "lab", { seed: 2, title: "지표에 닿는 자외선" });
      var tcol = tr < 0.01 ? KC.green : (tr > 0.3 ? KC.red : KC.yellow);
      ctx.save(); ctx.shadowColor = tcol; ctx.shadowBlur = 16;
      K.t(ctx, (tr * 100).toFixed(1) + " %", mid, 98, { s: 34, w: "900", a: "center", c: tcol }); ctx.restore();
      var bx = RX + 22, bw = RW - 44, f = clamp((Math.log(Math.max(tr * 100, 0.1)) / Math.LN10 + 1) / 3, 0, 1);
      gbar(ctx, bx, 116, bw, 12, f, tcol);
      [[1, "1%"], [30, "30%"]].forEach(function (m) {
        var mx = bx + bw * (Math.log(m[0]) / Math.LN10 + 1) / 3;
        K.line(ctx, { x: mx, y: 110 }, { x: mx, y: 134 }, "#ffffff", 1.5, [3, 2]);
        K.t(ctx, m[1], mx, 148, { s: 10.5, a: "center", c: KC.mute });
      });
      K.t(ctx, "0.1%", bx, 148, { s: 10, c: KC.dim }); K.t(ctx, "100%", bx + bw, 148, { s: 10, a: "right", c: KC.dim });
      K.t(ctx, "산소 농도 " + pct.toFixed(1) + "% 일 때 (막대는 10배씩 눈금)", mid, 170, { s: 11, a: "center", c: KC.mute });
      K.pill(ctx, "O₂ + 자외선 → O + O", RX + 22, 210, { s: 12.5, c: KC.violet });
      K.pill(ctx, "O + O₂ → O₃ (오존)", RX + 22, 240, { s: 12.5, c: KC.violet });
      K.t(ctx, "산소가 많아질수록 오존이 많이 만들어지고,", RX + 22, 280, { s: 11, c: KC.mute });
      K.t(ctx, "오존층이 두꺼워질수록 자외선이 더 많이 막힌다.", RX + 22, 299, { s: 11, c: KC.mute });
      K.t(ctx, "자외선 투과율이 1% 아래로 내려가야", RX + 22, 334, { s: 11, c: KC.ink });
      K.t(ctx, "육상 생물이 살아남을 수 있다.", RX + 22, 353, { s: 11, c: KC.ink });
    }
    function draw() {
      paint();
      var o = ozone(pct), tr = o.tr;
      $("b-c3-info").innerHTML = "대기 산소 농도 <b>" + pct.toFixed(1) + "%</b> → 오존층 두께 <b>" + o.rel.toFixed(0)
        + "</b> (오늘날을 100으로 본 값), 지표에 닿는 자외선 <b>" + (tr * 100).toFixed(1) + "%</b>. "
        + (tr < 0.01 ? "자외선이 거의 막혔습니다. 물 밖으로 나와도 살 수 있습니다."
          : (tr > 0.3 ? "자외선이 그대로 쏟아집니다. 생물은 물속 깊은 곳에 숨어 있어야 합니다."
            : "아직 위험합니다. 산소가 더 쌓여야 합니다."));

      var ch = false;
      if (tr >= 0.30 && !got.a) { got.a = true; ch = true; }
      if (tr < 0.01 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("b4", got); mission(); }
    }
    function mission() {
            if (got.a) done("m2-4a");
      if (got.b) done("m2-4b");
      if (got.a && got.b) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>오존층은 <b>산소로 만들어진 방패</b>입니다. 생물이 만든 기체가 하늘을 바꾸고, 그 하늘이 다시 생물이 살 곳을 넓혔습니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    mv = mover(canvas, paint, "자외선");
    $("b-o2").addEventListener("input", function (e) { pct = +e.target.value; $("b-o2-val").textContent = pct.toFixed(1); draw(); });
    draw(); mission();
    if (ep.cleared(3)) window.sthMission("m2-4", true);
  })();

  /* ---- 장면 5 : 결말 ---- */
  var STEPS = [
    "바다에서 남세균이 광합성으로 산소를 만들기 시작한다",
    "산소가 바닷속 철 이온(Fe²⁺)을 산화시켜 산화철로 가라앉힌다",
    "가라앉은 산화철이 해저에 줄무늬로 쌓여 호상철광층이 된다",
    "바닷속 철이 거의 바닥나자 산소가 대기에 쌓이기 시작한다 (대산소화 사건)",
    "대기의 산소로 성층권에 오존층이 만들어진다",
    "오존층이 자외선을 막아 주어 생물이 육상으로 진출한다"
  ];
  function reveal() {
    $("e2-wrap").hidden = false;
    var p = window.sthState("p2") || "";
    $("e2-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>"
      + (p.indexOf("㉡") === 0 ? "정확했습니다. 줄무늬 바위는 산소가 바다를 먼저 채웠다는 증거였습니다."
        : "철이 아니라 <b>산소</b>가 주인공이었습니다. 운석도 화산도 아니고, 생물이 만든 기체가 범인이었습니다.");
  }
  function finish() { window.sthState("r2", "해결 · 철이 먼저, 하늘은 나중. 대산소화 사건 → 오존층 → 육상 진출까지 추적"); }
  if (ep.cleared(4)) {
    $("b-order").innerHTML = "<div class='order sort'><div class='slots'>"
      + STEPS.map(function (s) { return "<div class='slot filled'>" + s + "</div>"; }).join("") + "</div></div>";
    reveal();
  } else {
    window.sthOrder({ mount: "b-order", steps: STEPS, onDone: function () { reveal(); ep.clear(4); } });
  }
  window.sthWork({
    mount: "wk2", unitLabel: "[지구시스템과학1 Ⅰ-1] 이야기 ② 25억 년 된 줄무늬",
    items: [
      { id: "w1", label: "산소 농도가 늘어난 계기", hint: "대기 중 산소 농도 그래프에서 크게 꺾이는 지점을 짚고, 무엇이 그 변화를 만들었는지 쓰세요." },
      { id: "e2b", label: "산소가 바꾼 세 권역", hint: "생물권에서 만들어진 산소가 수권·지권·기권을 각각 어떻게 바꾸었는지 순서대로 쓰세요. ‘호상철광층’과 ‘오존층’이라는 말을 넣으세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 눈덩이 지구를 녹인 것
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  window.sthGate({
    gate: "g3", key: "p3", title: "연구원의 첫 추리",
    question: "적도까지 얼어붙었던 지구가 다시 녹은 까닭은 무엇일까요?",
    options: [
      "㉠ 태양이 갑자기 밝아졌다",
      "㉡ 얼음 때문에 풍화가 멎은 사이, 화산이 내보낸 이산화 탄소가 쌓였다",
      "㉢ 큰 운석이 떨어지며 낸 열이 얼음을 녹였다"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 장면 2 : 물의 순환 ---- */
  function water(T) {
    return { sc: Math.exp((T - 15) / 28), ice: clamp((18 - T) / 28, 0, 1) };
  }

  (function () {
    var canvas = $("c-c1"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var T = 0, got = window.sthState("c2") || { a: false, b: false, c: false }, mv = null;
    var RW0 = K.rng(17), DROPS = [];
    for (var dq = 0; dq < 40; dq++) DROPS.push([RW0(), RW0()]);

    function paint() {
      var w = water(T), sc = w.sc, ice = w.ice, tt = mv ? mv.t : 0, snow = T < 0;
      ctx.clearRect(0, 0, W, H);
      var LW = 692, SEA = 262, COAST = 330;
      K.stage(ctx, 0, 0, LW, H, "night", { seed: 3 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      var sk = ctx.createLinearGradient(0, 0, 0, SEA);
      sk.addColorStop(0, "#0b1a44"); sk.addColorStop(1, ice > .9 ? "#7d8fa8" : "#4f8fcf");
      ctx.fillStyle = sk; ctx.fillRect(0, 0, LW, SEA);
      /* 바다 */
      var og = ctx.createLinearGradient(0, SEA, 0, H); og.addColorStop(0, "#2f7fd0"); og.addColorStop(1, "#06204a");
      ctx.fillStyle = og; ctx.fillRect(COAST, SEA, LW - COAST, H - SEA);
      ctx.strokeStyle = "rgba(200,235,255,.35)"; ctx.lineWidth = 1.2;
      for (var wv = 0; wv < 4; wv++) { ctx.beginPath(); for (var wx = COAST; wx <= LW; wx += 6) { var wy = SEA + 14 + wv * 30 + Math.sin(wx * .06 + tt * 1.6 + wv) * 2; if (wx === COAST) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy); } ctx.stroke(); }
      /* 땅 · 지하수 */
      var lg = ctx.createLinearGradient(0, 150, 0, H); lg.addColorStop(0, "#6f5a44"); lg.addColorStop(.55, "#4a3626"); lg.addColorStop(1, "#2a1c12");
      ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, 236); ctx.lineTo(130, 150); ctx.lineTo(214, 214); ctx.lineTo(290, 258); ctx.lineTo(COAST, SEA + 4); ctx.lineTo(COAST + 20, H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(90,150,230,.22)"; ctx.fillRect(0, 352, COAST + 12, H - 352);
      ctx.strokeStyle = "rgba(140,190,255,.3)"; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(0, 352); ctx.lineTo(COAST + 12, 352); ctx.stroke(); ctx.setLineDash([]);
      if (ice < .98) {                       /* 풀빛 */
        ctx.strokeStyle = "rgba(90,180,90," + (.8 * (1 - ice)) + ")"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(0, 236); ctx.lineTo(60, 197); ctx.moveTo(214, 214); ctx.lineTo(290, 258); ctx.lineTo(COAST, SEA + 4); ctx.stroke();
      }
      /* 빙하 — 기온이 낮을수록 산 아래로, 바다 위로 넓어진다 */
      if (ice > 0) {
        var capY = 152 + ice * 120;
        ctx.save(); ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, 236); ctx.lineTo(130, 150); ctx.lineTo(214, 214); ctx.lineTo(290, 258); ctx.lineTo(COAST, SEA + 4); ctx.lineTo(COAST + 20, H); ctx.closePath(); ctx.clip();
        var ig = ctx.createLinearGradient(0, 150, 0, capY); ig.addColorStop(0, "#ffffff"); ig.addColorStop(1, "#cfe6ff");
        ctx.fillStyle = ig; ctx.fillRect(0, 140, COAST + 20, capY - 140); ctx.restore();
        if (ice > .55) { ctx.fillStyle = "rgba(235,245,255,.95)"; ctx.fillRect(COAST, SEA - 2, (LW - COAST) * clamp((ice - .55) / .45, 0, 1), 9); }
      }
      /* 구름 — 순환이 셀수록 커진다 */
      var cs = clamp(.5 + .45 * sc, .45, 1.35), cx0 = 300, cy0 = 96;
      ctx.fillStyle = ice > .9 ? "rgba(220,228,240,.75)" : "rgba(240,246,255,.9)";
      [[-70, 8, 30], [-36, -10, 38], [4, -16, 44], [44, -4, 36], [76, 10, 26], [0, 14, 40]].forEach(function (c) { ctx.beginPath(); ctx.arc(cx0 + c[0] * cs, cy0 + c[1] * cs, c[2] * cs, 0, 6.2832); ctx.fill(); });
      /* 비(눈) — 육지 쪽과 바다 쪽 */
      var nr = Math.round(clamp(sc, 0, 1.8) / 1.8 * 40), base = cy0 + 30 * cs;
      for (var r = 0; r < nr; r++) {
        var land = r % 3 === 0, rx = land ? 222 + DROPS[r][0] * 70 : 350 + DROPS[r][0] * 58;
        var bottom = land ? 200 : SEA, u = (tt * (snow ? .25 : .9) + DROPS[r][1]) % 1, ry = base + u * (bottom - base);
        if (snow) { ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.beginPath(); ctx.arc(rx + Math.sin(tt * 2 + r) * 3, ry, 2, 0, 6.2832); ctx.fill(); }
        else { ctx.strokeStyle = "rgba(170,215,255,.85)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 2, ry + 9); ctx.stroke(); }
      }
      ctx.restore();
      /* 흐름 화살표 (굵기 = 흐름의 양) */
      var flows = [
        { a: { x: 600, y: 254 }, b: { x: 432, y: 104 }, val: 413000 * sc, c: KC.blue },
        { a: { x: 386, y: 132 }, b: { x: 404, y: 252 }, val: 373000 * sc, c: "#9fe3ff" },
        { a: { x: 252, y: 132 }, b: { x: 238, y: 196 }, val: 113000 * sc, c: "#9fe3ff" },
        { a: { x: 150, y: 302 }, b: { x: 352, y: 302 }, val: 40000 * sc, c: KC.orange }
      ];
      flows.forEach(function (f, i) {
        var lw = clamp(2 + 8 * (f.val / 500000), 2, 11);
        ctx.save(); ctx.globalAlpha = .55; K.arrow(ctx, f.a, f.b, f.c, lw, 10 + lw); ctx.restore();
        if (sc > .05 && (i === 0 || i === 3)) flow(ctx, f.a, f.b, tt * .5 * clamp(sc, .3, 2), i ? KC.orange : "#bfe9ff", 4, 2);
      });
      K.pill(ctx, "물의 순환 · 저장고와 흐름", 16, 28, { s: 13, c: KC.blue });
      K.pill(ctx, "기권 · 수증기 " + num(12.9 * sc, 1) + " 천 km³", 300, 40, { a: "center", s: 11.5, c: KC.ink, box: [200, LW] });
      K.pill(ctx, "🔽 육지 강수 " + num(113000 * sc) + " km³/년", 16, 74, { s: 11, c: "#9fe3ff" });
      K.pill(ctx, "수권 · 빙하 " + num(224000 * ice, 0) + " 천 km³", 120, 136, { a: "center", s: 11.5, c: KC.violet, box: [0, 300] });
      K.pill(ctx, "🔼 해양 증발 " + num(413000 * sc) + " km³/년", LW - 12, 168, { a: "right", s: 11, c: KC.blue, box: [0, LW] });
      K.pill(ctx, "🔽 해양 강수 " + num(373000 * sc) + " km³/년", 414, 236, { s: 11, c: "#9fe3ff", box: [0, 580] });
      K.pill(ctx, "➡️ 하천·지하수 유출 " + num(40000 * sc) + " km³/년", 30, 332, { s: 11, c: KC.orange });
      K.pill(ctx, "수권 · 지하수·하천 " + num(23576 * clamp(1 - ice, 0.02, 1), 0) + " 천 km³", 16, 400, { s: 11.5, c: KC.green });
      K.pill(ctx, "수권 · 해양 " + num(1338000 - 224000 * ice + 24064, 0) + " 천 km³", LW - 12, 400, { a: "right", s: 11.5, c: KC.blue, box: [0, LW] });

      /* ── 오른쪽 : 계기판 ── */
      var RX = LW + 8, RW = W - RX, mid = RX + RW / 2;
      K.stage(ctx, RX, 0, RW, H, "lab", { seed: 7 });
      glass(ctx, RX + 12, 14, RW - 24, 104);
      K.t(ctx, "얼음이 덮은 넓이", mid, 40, { s: 11, c: KC.mute, a: "center" });
      ctx.save(); ctx.shadowColor = KC.violet; ctx.shadowBlur = 12;
      K.t(ctx, Math.round(ice * 100) + " %", mid, 82, { s: 28, w: "900", a: "center", c: KC.violet }); ctx.restore();
      gbar(ctx, RX + 26, 96, RW - 52, 8, ice, KC.violet);
      glass(ctx, RX + 12, 128, RW - 24, 116);
      K.t(ctx, "물의 순환 세기", mid, 154, { s: 11, c: KC.mute, a: "center" });
      ctx.save(); ctx.shadowColor = KC.blue; ctx.shadowBlur = 12;
      K.t(ctx, Math.round(sc * 100) + " %", mid, 196, { s: 28, w: "900", a: "center", c: KC.blue }); ctx.restore();
      gbar(ctx, RX + 26, 210, RW - 52, 8, sc / 2.5, KC.blue);
      K.t(ctx, "(지금을 100으로 본 값)", mid, 236, { s: 10, c: KC.dim, a: "center" });
      K.t(ctx, "따뜻할수록 증발이 늘어", RX + 16, 282, { s: 11, c: KC.mute });
      K.t(ctx, "물의 순환이 빨라지고,", RX + 16, 300, { s: 11, c: KC.mute });
      K.t(ctx, "추울수록 물이 빙하에", RX + 16, 326, { s: 11, c: KC.mute });
      K.t(ctx, "붙잡혀 순환이 느려진다.", RX + 16, 344, { s: 11, c: KC.mute });
      K.t(ctx, "지구 전체 물의 양은 늘 같다", RX + 16, 380, { s: 11, c: KC.ink });
      K.t(ctx, "— 자리만 바뀐다", RX + 16, 398, { s: 11, c: KC.ink });
    }
    function draw() {
      paint();
      var w = water(T), sc = w.sc, ice = w.ice;
      $("c-c1-info").innerHTML = "평균 기온 <b>" + T + " ℃</b> · 얼음이 덮은 넓이 <b>" + Math.round(ice * 100)
        + "%</b> · 물의 순환 세기 <b>" + Math.round(sc * 100) + "%</b>. "
        + (ice >= 0.999 ? "지구 전체가 얼음에 덮였습니다. 증발도 비도 거의 없어 <b>물의 순환이 사실상 멎었습니다</b>. 이때 함께 멎는 것이 또 하나 있습니다 — 빗물이 암석을 녹이는 <b>풍화</b>입니다."
          : (ice <= 0.001 ? "빙하가 모두 녹았습니다. 증발과 강수가 훨씬 활발해지고, 비가 많아지면 암석의 <b>풍화도 빨라집니다</b>."
            : "빙하와 바다가 함께 있는 상태입니다. 기온을 바꿔 가며 저장고의 물이 어떻게 옮겨 다니는지 보세요."));

      var ch = false;
      if (Math.abs(T - 15) <= 1 && !got.a) { got.a = true; ch = true; }
      if (ice >= 0.999 && sc <= 0.20 && !got.b) { got.b = true; ch = true; }
      if (ice <= 0.001 && sc >= 1.5 && !got.c) { got.c = true; ch = true; }
      if (ch) { window.sthState("c2", got); mission(); }
    }
    function mission() {
            if (got.a) done("m3-2a");
      if (got.b) done("m3-2b");
      if (got.c) done("m3-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>지구의 물은 늘 같은 양이지만 <b>어디에 머무느냐</b>가 기온에 따라 크게 달라집니다. 그리고 물의 순환이 멎으면 <b>풍화</b>도 함께 멎습니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    mv = mover(canvas, paint, "비·증발");
    $("c-temp").addEventListener("input", function (e) { T = +e.target.value; $("c-temp-val").textContent = T; draw(); });
    draw(); mission();
    if (ep.cleared(1)) window.sthMission("m3-2", true);
  })();

  /* ---- 장면 3 : 탄소 순환의 정상 상태 ---- */
  function carbon(V, k) {
    var x = Math.log(V / k) / Math.LN2 / 0.7213;     // log2(CO₂ / 280ppm)
    return { x: x, P: 280 * Math.pow(2, x), T: 15 + 4 * x };
  }

  (function () {
    var canvas = $("c-c2"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var V = 1, k = 1, got = window.sthState("c3") || { a: false, b: false }, okQ = !!window.sthState("c3q"), mv = null;
    var RC = K.rng(23), MOL = [];
    for (var mq = 0; mq < 40; mq++) MOL.push([RC(), RC()]);

    function tree(x, y, s) {
      ctx.fillStyle = "#4a3020"; ctx.fillRect(x - 2, y - 10 * s, 4, 10 * s);
      var g = ctx.createRadialGradient(x - 4 * s, y - 22 * s, 2, x, y - 18 * s, 13 * s);
      g.addColorStop(0, "#8be08a"); g.addColorStop(1, "#1f6a32");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 18 * s, 12 * s, 0, 6.2832); ctx.fill();
    }
    function paint() {
      var r = carbon(V, k), P = r.P, T = r.T, tt = mv ? mv.t : 0;
      var wRate = Math.pow(2, 0.7213 * r.x) * k;       // = V (정상 상태)
      ctx.clearRect(0, 0, W, H);
      var SURF = 226, ROCK = 300;
      K.stage(ctx, 0, 0, W, H, "night", { seed: 27 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, H, 14); ctx.clip();
      var sk = ctx.createLinearGradient(0, 0, 0, SURF); sk.addColorStop(0, "#080e30"); sk.addColorStop(1, T >= 28 ? "#6a4a3a" : (T <= 0 ? "#6f86a8" : "#2f5f9a"));
      ctx.fillStyle = sk; ctx.fillRect(0, 0, W, SURF);
      /* 대기 CO₂ — 많을수록 촘촘하다 */
      var nm = Math.round(clamp(4 + 6 * r.x, 2, 40));
      for (var i = 0; i < nm; i++) K.glow(ctx, 250 + MOL[i][0] * 620, 50 + MOL[i][1] * 150 + Math.sin(tt + i) * 3, 1.6, "rgba(255,190,120,.9)", 3);
      /* 땅 · 바다 · 암석층 */
      var lg = ctx.createLinearGradient(0, SURF, 0, ROCK); lg.addColorStop(0, T <= 0 ? "#dfe9f5" : "#5a7a3a"); lg.addColorStop(1, "#4a3424");
      ctx.fillStyle = lg; ctx.fillRect(0, SURF, 640, ROCK - SURF);
      var og = ctx.createLinearGradient(0, SURF, 0, ROCK); og.addColorStop(0, "#2f7fd0"); og.addColorStop(1, "#0a2f62");
      ctx.fillStyle = og; ctx.fillRect(640, SURF + 4, W - 640, ROCK - SURF - 4);
      var bands = ["#3b2a20", "#4a3628", "#5a4a3c", "#43352c", "#cfc3a8", "#bfb294"];
      bands.forEach(function (c, j) { ctx.fillStyle = c; ctx.fillRect(0, ROCK + j * 20, W, 20); });
      ctx.fillStyle = "rgba(255,255,255,.1)"; for (var f = 0; f < 30; f++) ctx.fillRect((f * 37) % W, ROCK + 82 + (f % 3) * 12, 14, 2);
      /* 마그마와 화산 */
      var vx = 360, mg = ctx.createRadialGradient(vx, ROCK + 50, 4, vx, ROCK + 50, 60);
      mg.addColorStop(0, "rgba(255,200,90,.95)"); mg.addColorStop(.5, "rgba(255,90,40,.6)"); mg.addColorStop(1, "rgba(255,60,30,0)");
      ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(vx, ROCK + 50, 70, 34, 0, 0, 6.2832); ctx.fill();
      var vg = ctx.createLinearGradient(vx - 60, 0, vx + 60, 0); vg.addColorStop(0, "#3a2a22"); vg.addColorStop(.5, "#6a4a38"); vg.addColorStop(1, "#2a1e18");
      ctx.fillStyle = vg; ctx.beginPath(); ctx.moveTo(vx - 64, SURF + 4); ctx.lineTo(vx - 12, 172); ctx.lineTo(vx + 12, 172); ctx.lineTo(vx + 64, SURF + 4); ctx.closePath(); ctx.fill();
      K.glow(ctx, vx, 174, 4, "rgba(255,170,80,.95)", 4);
      /* 숲 */
      for (var tq = 0; tq < 8; tq++) tree(46 + tq * 26, SURF + 2, .8 + (tq % 3) * .15);
      /* 풍화 자리의 비 */
      var nr = Math.round(clamp(wRate, 0, 10) * 3 + 2);
      for (var q = 0; q < nr; q++) { var u = (tt * .9 + MOL[q][1]) % 1, rx = 548 + MOL[q][0] * 64, ry = 70 + u * (SURF - 70); ctx.strokeStyle = "rgba(170,215,255,.7)"; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 2, ry + 8); ctx.stroke(); }
      ctx.restore();
      /* 흐름 화살표 */
      var vw = clamp(2 + 3.0 * V, 2, 16), ww = clamp(2 + 3.0 * wRate, 2, 16);
      K.arrow(ctx, { x: vx, y: 166 }, { x: vx, y: 66 }, KC.red, vw, 12 + vw * .6);
      flow(ctx, { x: vx, y: 166 }, { x: vx, y: 72 }, tt * .45 * Math.sqrt(V), "rgba(255,200,170,.95)", 4, 2.2);
      K.arrow(ctx, { x: 580, y: 66 }, { x: 580, y: ROCK + 86 }, KC.green, ww, 12 + ww * .6);
      flow(ctx, { x: 580, y: 70 }, { x: 580, y: ROCK + 80 }, tt * .35 * Math.sqrt(wRate), "rgba(160,255,220,.95)", 5, 2.2);
      [[{ x: 202, y: 206 }, { x: 202, y: 168 }], [{ x: 218, y: 168 }, { x: 218, y: 206 }], [{ x: 762, y: 222 }, { x: 762, y: 182 }], [{ x: 778, y: 182 }, { x: 778, y: 222 }]].forEach(function (a, j) {
        K.arrow(ctx, a[0], a[1], j < 2 ? "#6fe08a" : KC.blue, 2.5, 8);
      });
      /* 이름표 */
      glass(ctx, 16, 44, 220, 116);
      K.t(ctx, "균형이 잡힌 뒤의 상태", 126, 66, { s: 11, c: KC.mute, a: "center" });
      ctx.save(); ctx.shadowColor = KC.orange; ctx.shadowBlur = 10;
      K.t(ctx, Math.round(P) + " ppm", 126, 100, { s: 24, w: "900", a: "center", c: KC.orange });
      var tc = T <= 0 ? KC.blue : (T >= 28 ? KC.red : KC.green); ctx.shadowColor = tc;
      K.t(ctx, (T >= 0 ? "+" : "") + T.toFixed(1) + " ℃", 126, 140, { s: 26, w: "900", a: "center", c: tc }); ctx.restore();
      K.pill(ctx, "기권 · 대기 CO₂ " + Math.round(P) + " ppm", 470, 32, { a: "center", s: 13, c: KC.orange });
      K.pill(ctx, "🌋 화산 탈가스 · 지금의 " + V.toFixed(2) + "배", 376, 124, { s: 11.5, c: KC.red });
      K.pill(ctx, "🌧️ 규산염 풍화 → 석회암으로 묻힘", 598, 92, { s: 11.5, c: KC.green, box: [0, W - 8] });
      K.pill(ctx, "풍화 세기 " + wRate.toFixed(2) + "배", 598, 120, { s: 11.5, c: KC.green });
      K.pill(ctx, "광합성·호흡 (빠른 순환)", 16, 192, { s: 11, c: "#8be08a" });
      K.pill(ctx, "바다-대기 교환 (빠른 순환)", W - 16, 160, { s: 11, a: "right", c: KC.blue });
      K.pill(ctx, "생물권 · 숲과 토양 약 2,300 Gt C", 22, 266, { s: 11.5, c: "#8be08a" });
      K.pill(ctx, "수권 · 해양 약 38,000 Gt C", W - 16, 268, { s: 11.5, a: "right", c: KC.blue });
      K.pill(ctx, "지권 · 석회암·화석 연료 약 6,000만 Gt C", 762, 368, { a: "center", s: 11.5, c: KC.yellow });
      K.pill(ctx, "화산이 내보낸 만큼을 풍화가 치워 낼 때 균형이 잡힌다", 16, 408, { s: 11, c: KC.ink });
      K.pill(ctx, "풍화 조건 " + k.toFixed(1) + "배", W - 16, 408, { s: 11, a: "right", c: KC.mute });
    }
    function draw() {
      paint();
      var r = carbon(V, k), P = r.P, T = r.T;
      $("c-c2-info").innerHTML = "화산 활동 <b>" + V.toFixed(2) + "배</b>, 풍화가 일어나기 쉬운 정도 <b>" + k.toFixed(1)
        + "배</b> → 균형을 이룬 대기 CO₂는 <b>" + Math.round(P) + " ppm</b>, 평균 기온은 <b>" + T.toFixed(1) + " ℃</b>입니다. "
        + (T >= 28 ? "화산이 내보내는 탄소가 많아 온실 상태가 되었습니다. 다만 기온이 오른 만큼 풍화도 빨라져 <b>무한정 더워지지는 않습니다</b>."
          : (T <= 0 ? "대기 CO₂가 너무 적어 얼어붙기 직전입니다. 여기서 얼음이 퍼지면 햇빛을 되쏘아 더 추워지는 <b>양의 되먹임</b>이 시작됩니다."
            : "지금의 지구와 비슷한 균형점입니다. 두 슬라이더를 움직여 균형점이 어디로 옮겨 가는지 보세요."));

      var ch = false;
      if (T >= 28 && !got.a) { got.a = true; ch = true; }
      if (T <= 0 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("c3", got); mission(); }
    }
    function mission() {
            if (got.a) done("m3-3a");
      if (got.b) done("m3-3b");
      if (okQ) done("m3-3c");
      if (got.a && got.b && okQ) {
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>대기 CO₂는 <b>화산이 내보내는 속도</b>와 <b>풍화가 치워 내는 속도</b>가 같아지는 곳에서 정해집니다. 이 균형이 수억 년 동안 지구의 온도 조절기 노릇을 해 왔습니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    mv = mover(canvas, paint, "탄소 흐름");
    $("c-volc").addEventListener("input", function (e) { V = +e.target.value; $("c-volc-val").textContent = V.toFixed(2); draw(); });
    $("c-land").addEventListener("input", function (e) { k = +e.target.value; $("c-land-val").textContent = k.toFixed(1); draw(); });
    window.sthPick({
      mount: "c-q1",
      q: "화산 활동이 갑자기 2배로 늘어도 대기 이산화 탄소가 끝없이 쌓이지 않고 새 균형점에서 멈춥니다. 왜 그럴까요?",
      options: [
        "바다가 이산화 탄소를 얼마든지 흡수해 주기 때문",
        "기온이 올라가면 비가 많아지고 규산염 풍화가 빨라져, 이산화 탄소를 더 빨리 치워 내기 때문",
        "화산이 내보낸 이산화 탄소는 금방 우주로 빠져나가기 때문",
        "식물이 늘어난 이산화 탄소를 모두 흡수해 영구히 붙잡아 두기 때문"
      ],
      answer: 1,
      why: [
        "바다가 흡수할 수 있는 양에는 한계가 있고, 흡수 속도도 느립니다. 화면의 <b>풍화 세기</b> 숫자를 보세요.",
        "이것이 규산염 풍화의 <b>음의 되먹임</b>입니다. 더워지면 치우는 속도가 빨라져 스스로 브레이크가 걸립니다.",
        "이산화 탄소는 우주로 빠져나가지 않습니다.",
        "식물이 흡수한 탄소는 대부분 호흡과 분해로 곧 대기에 돌아옵니다(빠른 순환)."
      ],
      onDone: function () { okQ = true; window.sthState("c3q", 1); mission(); }
    });
    draw(); mission();
    if (ep.cleared(2)) window.sthMission("m3-3", true);
  })();

  /* ---- 장면 4 : 눈덩이 탈출 ---- */
  function escapeRun(V) {
    var P = 280, dt = 0.5, out = { t: [], P: [], T: [] }, esc = null;
    for (var t = 0; t <= 60 + 1e-9; t += dt) {
      var Tice = -50 + 4 * (Math.log(P / 280) / Math.LN2);
      out.t.push(+t.toFixed(1)); out.P.push(P); out.T.push(Tice);
      if (esc === null && Tice >= -15) esc = +t.toFixed(1);
      P += 3500 * V * dt;
    }
    out.esc = esc;
    return out;
  }

  (function () {
    var canvas = $("c-c3"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var V = 1, got = window.sthState("c4") || { a: false, b: false }, log = window.sthState("c4log") || [];

    function chart(sim, upto) {
      ctx.clearRect(0, 0, W, H);
      var LW = 640, x0 = 72, x1 = 616, y0 = 66, y1 = H - 56, n = sim.t.length - 1;
      K.stage(ctx, 0, 0, LW, H, "lab", { seed: 19 });
      ctx.fillStyle = "rgba(255,255,255,.03)"; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      [0, 10, 20, 30, 40, 50, 60].forEach(function (g) {
        var gx = x0 + g / 60 * (x1 - x0);
        K.line(ctx, { x: gx, y: y0 }, { x: gx, y: y1 }, KC.grid, 1);
        K.t(ctx, g + "", gx, y1 + 16, { s: 10.5, c: KC.mute, a: "center", w: "600" });
      });
      [-60, -45, -30, -15, 0].forEach(function (tv) {
        var gy = y1 - (tv + 60) / 60 * (y1 - y0);
        K.line(ctx, { x: x0, y: gy }, { x: x1, y: gy }, KC.grid, 1);
        K.t(ctx, tv + "℃", x0 - 6, gy + 4, { s: 10, c: KC.blue, a: "right", w: "600" });
      });
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      K.t(ctx, "얼어붙은 뒤 흐른 시간 (백만 년)", x1, y1 + 34, { s: 11, c: KC.mute, a: "right" });

      /* 탈출 문턱선 */
      var thrY = y1 - clamp((-15 + 60) / 60, 0, 1) * (y1 - y0);
      K.line(ctx, { x: x0, y: thrY }, { x: x1, y: thrY }, KC.yellow, 2, [6, 5]);
      K.pill(ctx, "얼음이 녹기 시작하는 문턱 (−15 ℃)", x0 + 8, thrY - 10, { s: 11, c: KC.yellow });

      var pMax = Math.max(150000, sim.P[n]), pp = [], tp = [];
      for (var i = 0; i <= upto; i++) {
        var xx = x0 + i / n * (x1 - x0);
        pp.push([xx, y1 - clamp(sim.P[i] / pMax, 0, 1) * (y1 - y0)]);
        tp.push([xx, y1 - clamp((sim.T[i] + 60) / 60, 0, 1) * (y1 - y0)]);
      }
      [[pp, KC.orange], [tp, KC.blue]].forEach(function (s) {
        if (s[0].length < 2) return;
        ctx.save(); ctx.strokeStyle = s[1]; ctx.lineWidth = 3; ctx.shadowColor = s[1]; ctx.shadowBlur = 9; ctx.lineJoin = "round";
        ctx.beginPath(); s[0].forEach(function (p, k) { if (k) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); ctx.restore();
        var last = s[0][s[0].length - 1]; K.glow(ctx, last[0], last[1], 3.5, s[1], 3.5);
      });
      var lp = K.pill(ctx, "● 대기 CO₂ (0 ~ " + num(Math.round(pMax)) + " ppm)", 16, 30, { s: 12, c: KC.orange });
      K.pill(ctx, "● 얼음 위 기온 (−60 ~ 0 ℃)", lp.x + lp.w + 12, 30, { s: 12, c: KC.blue, box: [0, LW] });
      if (sim.esc !== null && upto >= Math.round(sim.esc / 0.5)) {
        var ex = x0 + sim.esc / 60 * (x1 - x0);
        K.line(ctx, { x: ex, y: y0 }, { x: ex, y: y1 }, KC.red, 1.6, [3, 4]);
        K.pill(ctx, "탈출 " + sim.esc + "백만 년", clamp(ex + 8, x0, 520), y0 + 18, { s: 11, c: KC.red, box: [0, LW] });
      }

      /* ── 오른쪽 : 지금의 지구 ── */
      var RX = LW + 8, RW = W - RX, mid = RX + RW / 2, cur = Math.min(upto, n);
      var escaped = sim.esc !== null && sim.t[cur] >= sim.esc;
      K.stage(ctx, RX, 0, RW, H, "space", { seed: 41 });
      glass(ctx, RX + 14, 14, RW - 28, 108);
      K.t(ctx, sim.t[cur].toFixed(0) + " 백만 년 뒤", mid, 38, { s: 11.5, c: KC.mute, a: "center" });
      K.t(ctx, num(Math.round(sim.P[cur])) + " ppm", mid, 72, { s: 19, w: "900", a: "center", c: KC.orange });
      K.t(ctx, sim.T[cur].toFixed(1) + " ℃", mid, 106, { s: 19, w: "900", a: "center", c: KC.blue });
      var gx0 = mid, gy0 = 222, gr = 64;
      var hz = ctx.createRadialGradient(gx0, gy0, gr, gx0, gy0, gr + 22);
      hz.addColorStop(0, escaped ? "rgba(255,150,80,.55)" : "rgba(180,220,255,.45)"); hz.addColorStop(1, "rgba(180,220,255,0)");
      ctx.fillStyle = hz; ctx.beginPath(); ctx.arc(gx0, gy0, gr + 22, 0, 6.2832); ctx.fill();
      var gg = ctx.createRadialGradient(gx0 - gr * .38, gy0 - gr * .42, gr * .08, gx0, gy0, gr);
      if (escaped) { gg.addColorStop(0, "#d4f0ff"); gg.addColorStop(.4, "#2f86e0"); gg.addColorStop(1, "#0f2f70"); }
      else { gg.addColorStop(0, "#ffffff"); gg.addColorStop(.5, "#d6e8fb"); gg.addColorStop(1, "#5a78a0"); }
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(gx0, gy0, gr, 0, 6.2832); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(gx0, gy0, gr, 0, 6.2832); ctx.clip();
      if (escaped) {
        ctx.fillStyle = "rgba(240,248,255,.9)"; ctx.beginPath(); ctx.ellipse(gx0, gy0 - gr, gr * .75, 16, 0, 0, 6.2832); ctx.fill(); ctx.beginPath(); ctx.ellipse(gx0, gy0 + gr, gr * .7, 14, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = "rgba(90,170,100,.8)"; ctx.beginPath(); ctx.ellipse(gx0 - 14, gy0 + 4, 20, 12, .5, 0, 6.2832); ctx.fill();
      } else {
        ctx.strokeStyle = "rgba(90,130,190,.5)"; ctx.lineWidth = 1.3;
        for (var c = -2; c <= 2; c++) { ctx.beginPath(); ctx.moveTo(gx0 - gr, gy0 + c * 24); ctx.lineTo(gx0 + 4, gy0 + c * 24 + 10); ctx.lineTo(gx0 + gr, gy0 + c * 24 - 4); ctx.stroke(); }
      }
      [[-30, -20], [18, 26], [34, -34]].forEach(function (v0) { K.glow(ctx, gx0 + v0[0], gy0 + v0[1], 2.4, "rgba(255,120,60,.95)", 3.4); });
      var sh = ctx.createRadialGradient(gx0 - gr * .5, gy0 - gr * .5, gr * .6, gx0 - gr * .2, gy0 - gr * .2, gr * 1.55);
      sh.addColorStop(0, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,15,.6)"); ctx.fillStyle = sh; ctx.fillRect(gx0 - gr, gy0 - gr, 2 * gr, 2 * gr);
      ctx.restore();
      K.pill(ctx, "🌋 얼음을 뚫는 화산", mid, gy0 + gr + 26, { a: "center", s: 10.5, c: KC.orange, box: [RX, W] });
      K.pill(ctx, escaped ? "🔥 얼음이 녹는다" : "🧊 아직 눈덩이 지구", mid, 352, { a: "center", s: 13, c: escaped ? KC.red : KC.blue, box: [RX, W] });
      K.t(ctx, escaped ? "쌓인 CO₂가 초온실을 만든다" : "풍화가 멎어 CO₂만 쌓인다", mid, 380, { s: 11, c: KC.mute, a: "center" });
    }

    function report() {
      var rows = log.slice(-4).map(function (r) {
        return "🌋 화산 " + r.v + "배 → " + (r.esc === null ? "60백만 년이 지나도 <b>탈출 실패</b>" : "<b>" + r.esc + "백만 년</b> 만에 탈출");
      });
      $("c-c3-info").innerHTML = rows.length ? "<b>실험 기록</b><br>" + rows.join("<br>")
        : "화산 활동의 세기를 정하고 실행하세요. 여러 번 시도할 수 있습니다.";
    }
    function mission() {
      if (got.a) done("m3-4a");
      if (got.b) done("m3-4b");
      if (got.a && got.b) {
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>얼음이 <b>풍화라는 브레이크</b>를 멈춰 세운 사이, 화산이 내보낸 이산화 탄소가 수백만~수천만 년 동안 쌓여 결국 지구를 녹였습니다. 실제 연구에서도 탈출에 필요한 CO₂는 약 0.1기압(10만 ppm 안팎)으로 추정합니다.");
        ep.clear(3);
      }
    }

    var still = escapeRun(1);
    canvas._redraw = function () { chart(still, 0); };
    chart(still, 0);

    $("c-esc").addEventListener("input", function (e) { V = +e.target.value; $("c-esc-val").textContent = V.toFixed(1); });
    $("c-run").addEventListener("click", function () {
      var runV = V, sim = escapeRun(runV), n = sim.t.length - 1, i = 0, btn = $("c-run");
      btn.disabled = true;
      canvas._redraw = function () { chart(sim, Math.min(i, n)); };
      (function step() {
        i = Math.min(n, i + Math.ceil(n / 90));
        chart(sim, i);
        if (i < n) { window.setTimeout(step, 22); return; }
        btn.disabled = false; btn.textContent = "▶ 다른 세기로 흘려보내기";
        log.push({ v: runV.toFixed(1), esc: sim.esc });
        log = log.slice(-6);
        window.sthState("c4log", log);
        var ch = false;
        if ((sim.esc === null || sim.esc > 50) && !got.a) { got.a = true; ch = true; }
        if (sim.esc !== null && sim.esc <= 30 && !got.b) { got.b = true; ch = true; }
        if (ch) window.sthState("c4", got);
        report(); mission();
      })();
    });
    report(); mission();
    if (ep.cleared(3)) window.sthMission("m3-4", true);
  })();

  /* ---- 장면 5 : 결말 ---- */
  function reveal() {
    $("e3-wrap").hidden = false;
    var p = window.sthState("p3") || "";
    $("e3-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>"
      + (p.indexOf("㉡") === 0 ? "정확했습니다. 범인은 ‘쌓기만 하고 치우지 않은 수천만 년’이었습니다."
        : "태양도 운석도 아니었습니다. 지구를 녹인 것은 <b>지구 자신의 탄소 순환</b>이었습니다.");
  }
  function finish() { window.sthState("r3", "해결 · 얼음이 풍화를 멈추자 화산 CO₂가 쌓여 초온실. 규산염 풍화는 음의 되먹임"); }

  var ITEMS = [
    { t: "식물의 광합성으로 대기의 CO₂가 잎으로 들어간다", a: "f", why: "며칠에서 몇 해 만에 오가는 빠른 순환입니다." },
    { t: "생물의 호흡과 분해로 탄소가 대기로 돌아온다", a: "f", why: "빠른 순환입니다." },
    { t: "바다 표면과 대기가 CO₂를 주고받는다", a: "f", why: "해마다 대량으로 오가는 빠른 순환입니다.", hint: "바다 ‘표면’입니다. 깊은 바다나 암석이 아닙니다." },
    { t: "산불로 숲에 저장된 탄소가 며칠 만에 대기로 간다", a: "f", why: "빠른 순환입니다." },
    { t: "화산이 지구 속에 있던 탄소를 CO₂로 내보낸다", a: "s", why: "지권과 기권을 잇는 느린 순환입니다." },
    { t: "빗물에 녹은 CO₂가 규산염 암석을 풍화시킨다", a: "s", why: "수만 년 이상 걸리는 느린 순환이며, 지구의 온도 조절기입니다.", hint: "이 과정이 멎어서 눈덩이 지구가 녹았습니다." },
    { t: "바다에서 석회암(탄산염 암석)이 되어 해저에 묻힌다", a: "s", why: "느린 순환입니다. 지구에서 가장 큰 탄소 저장고를 만듭니다." },
    { t: "묻힌 생물의 유해가 수억 년에 걸쳐 화석 연료가 된다", a: "s", why: "느린 순환입니다. 사람은 이것을 수백 년 만에 되돌려 놓고 있습니다." }
  ];
  if (ep.cleared(4)) {
    $("c-sort").innerHTML = "<div class='sort' style='padding:16px 18px 18px'><div class='msg'>🎉 여덟 과정을 모두 분류했습니다.</div></div>";
    reveal();
  } else {
    window.sthSort({
      mount: "c-sort",
      buckets: [
        { id: "f", label: "빠른 탄소 순환", sub: "수년 ~ 수백 년" },
        { id: "s", label: "느린 탄소 순환", sub: "수만 년 ~ 수억 년" }
      ],
      items: ITEMS,
      doneText: "사람이 화석 연료를 태우는 일은, 느린 순환으로 묻어 둔 탄소를 빠른 순환으로 꺼내는 일입니다.",
      onDone: function () { reveal(); ep.clear(4); }
    });
  }
  window.sthWork({
    mount: "wk3", unitLabel: "[지구시스템과학1 Ⅰ-1] 이야기 ③ 눈덩이 지구를 녹인 것",
    items: [
      { id: "w2", label: "탄소가 머무는 곳", hint: "탄소가 가장 많이 저장된 곳과 가장 빠르게 움직이는 경로를 각각 쓰고 근거를 대세요." },
      { id: "e3b", label: "눈덩이 지구가 스스로 풀린 과정", hint: "‘얼음 → 풍화가 멎음 → 화산 CO₂ 축적 → 해빙 → 초온실 → 덮개 탄산암’의 순서로, 물의 순환과 탄소 순환을 연결해 쓰세요." }
    ]
  });
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[지구시스템과학1 Ⅰ-1] 지구의 탄생과 물질의 순환 — 정리",
  recap: [
    { key: "r1", label: "① 세 행성의 갈림길" },
    { key: "r2", label: "② 25억 년 된 줄무늬" },
    { key: "r3", label: "③ 눈덩이 지구를 녹인 것" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "권역이 만들어진 일, 산소가 권역을 바꾼 일, 탄소와 물이 권역 사이를 오가는 일. 세 이야기에 공통으로 들어 있는 생각을 ‘지구시스템’과 ‘상호 작용’이라는 말을 넣어 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "esys-1-1", unitLabel: "[지구시스템과학1 Ⅰ-1] 지구의 탄생과 물질의 순환",
  rows: [
    { key: "r1", label: "① 세 행성의 갈림길" },
    { key: "r2", label: "② 25억 년 된 줄무늬" },
    { key: "r3", label: "③ 눈덩이 지구를 녹인 것" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
