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
/* ---- 스튜디오 + 블록 모형 공용 (_tools/STUDIO_GUIDE.md) ---- */
var LT = K.LT, DEG = Math.PI / 180;
/* 흰 카드 위 줄 바꿈 글 */
function twrap(ctx, s, x, y, maxW, lh, o) {
  o = o || {};
  ctx.font = (o.w || "700") + " " + (o.s || 11.5) + "px " + K.FONT;
  var line = "", lines = [], i;
  for (i = 0; i < s.length; i++) {
    var t = line + s.charAt(i);
    if (ctx.measureText(t).width > maxW && line.length) { lines.push(line); line = s.charAt(i); } else line = t;
  }
  lines.push(line);
  for (i = 0; i < lines.length; i++) K.t(ctx, lines[i], x, y + i * lh, o);
  return lines.length;
}
/* 움직이지 않는 부분은 숨은 캔버스에 한 번 그려 두고(drawImage) 움직이는 것만 다시 그린다 */
function stash(canvas, W, H) {
  var off = null, key = null;
  return function (k, paint) {
    if (!off) off = document.createElement("canvas");
    if (key !== k || off.width !== canvas.width) {
      off.width = canvas.width; off.height = canvas.height;
      var c = off.getContext("2d"), dpr = canvas.width / W;
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
      paint(c); key = k;
    }
    return off;
  };
}
/* 두 색 섞기: mixc("#ff0000", "#0000ff", 0.5, 밝기) */
function mixc(a, b, t, f) {
  var p = parseInt(a.slice(1), 16), q = parseInt(b.slice(1), 16), o = [], i; t = clamp(t, 0, 1); f = f || 1;
  for (i = 16; i >= 0; i -= 8) { var x = (p >> i) & 255, y = (q >> i) & 255; o.push(clamp(Math.round((x + (y - x) * t) * f), 0, 255)); }
  return "rgb(" + o.join(",") + ")";
}
/* 매끈한 무늬(−1 ~ 1) */
function wob(lo, la, s) { s = s || 1; return .5 * Math.sin(lo * .07 * s + la * .05 * s) * Math.cos(la * .09 * s - lo * .03 * s) + .3 * Math.sin(lo * .19 * s + la * .23 * s + 1.7) + .2 * Math.cos(lo * .41 * s - la * .37 * s); }
/* 위도·경도로 정한 대륙 모양(모식) — 지구본 미니어처의 겉면용 */
var LANDS = [[-100, 45, 26, 1.1], [-60, -15, 20, 1], [20, 5, 22, 1], [80, 48, 34, 1.2], [135, -25, 14, 1], [10, 50, 12, .8], [105, 25, 16, .8]];
function landAt(lon, lat) {
  if (lat < -72) return 2;
  var s = 0;
  for (var i = 0; i < LANDS.length; i++) {
    var q = LANDS[i], dl = ((lon - q[0] + 540) % 360) - 180, dx = dl * Math.cos(lat * DEG), dy = lat - q[1];
    s = Math.max(s, q[3] * Math.exp(-(dx * dx + dy * dy) / (2 * q[2] * q[2])));
  }
  s += 0.12 * Math.sin(lon * 0.21 + lat * 0.13) * Math.cos(lat * 0.17 - lon * 0.05);
  return s > 0.52 ? 1 : 0;
}
/* 반쪽 자른 지구(입체 단면 모형): 구를 방위각 a0~a1 쐐기 모양으로 잘라 내고, 자른 두 벽에 층을 그린다.
   o.surf(경도°, 위도°, 밝기) → 겉면 색 · o.layers [{ r, c: [안쪽색, 바깥색] }, …] 바깥부터 · o.onWall(ctx, k) 벽 좌표(u 오른쪽, v 위, 반지름 1)에 덧그리기 */
function globe(ctx, cx, cy, R, o) {
  o = o || {};
  var phi = o.phi == null ? 0.36 : o.phi, sp = Math.sin(phi), cp = Math.cos(phi);
  var a0 = (o.a0 == null ? 32 : o.a0) * DEG, a1 = (o.a1 == null ? 138 : o.a1) * DEG, cut = o.cut !== false;
  var nLon = o.nLon || 120, nLat = o.nLat || 60, i, j;
  var Lx = -0.52, Ly = 0.5, Lz = 0.69;
  function P(x, y, z) { return { x: cx + R * x, y: cy - R * (z * cp - y * sp) }; }
  function S(lon, lat) { var cl = Math.cos(lat); return [cl * Math.cos(lon), cl * Math.sin(lon), Math.sin(lat)]; }
  function inCut(lon) { if (!cut) return false; var l = ((lon - a0) % 6.2832 + 6.2832) % 6.2832; return l < (a1 - a0) - 1e-6; }
  if (o.shadow !== false) {
    var fy = cy + R * cp + R * .1, fg = ctx.createRadialGradient(cx, fy, 4, cx, fy, R * 1.15);
    fg.addColorStop(0, "rgba(20,30,50,.34)"); fg.addColorStop(.6, "rgba(20,30,50,.10)"); fg.addColorStop(1, "rgba(20,30,50,0)");
    ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(cx, fy, R * 1.15, R * .26, 0, 0, 6.2832); ctx.fill();
  }
  if (o.glow) {
    var gg = ctx.createRadialGradient(cx, cy, R * .95, cx, cy, R * 1.22);
    gg.addColorStop(0, o.glow); gg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(cx, cy, R * 1.22, 0, 6.2832); ctx.fill();
  }
  for (j = 0; j < nLat; j++) {
    var la0 = -Math.PI / 2 + Math.PI * j / nLat, la1 = la0 + Math.PI / nLat;
    for (i = 0; i < nLon; i++) {
      var lo0 = 2 * Math.PI * i / nLon, lo1 = lo0 + 2 * Math.PI / nLon, lc = (lo0 + lo1) / 2, tc = (la0 + la1) / 2;
      var n = S(lc, tc);
      if (n[1] * cp + n[2] * sp <= -0.02) continue;
      if (inCut(lc)) continue;
      var lt = clamp(.42 + .72 * Math.max(0, n[0] * Lx + n[1] * Ly + n[2] * Lz), .35, 1.18);
      var col = o.surf ? o.surf(lc / DEG, tc / DEG, lt) : K.tint("#8a8f99", lt);
      var p = [S(lo0, la0), S(lo1, la0), S(lo1, la1), S(lo0, la1)].map(function (q) { return P(q[0], q[1], q[2]); });
      ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); ctx.lineTo(p[1].x, p[1].y); ctx.lineTo(p[2].x, p[2].y); ctx.lineTo(p[3].x, p[3].y); ctx.closePath();
      ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = .8; ctx.stroke();
    }
  }
  function wallT(k, fn) {
    var a = k ? a1 : a0;
    ctx.save(); ctx.transform(R * Math.cos(a), R * Math.sin(a) * sp, 0, -R * cp, cx, cy); fn(); ctx.restore();
  }
  if (cut) {
    [0, 1].forEach(function (k) {
      if (k === 0 && Math.cos(a0) <= 0) return;
      if (k === 1 && Math.cos(a1) >= 0) return;
      wallT(k, function () {
        var L = o.layers || [{ r: 1, c: ["#b0784a", "#8a5a36"] }];
        L.forEach(function (ly, li) {
          var rin = li + 1 < L.length ? L[li + 1].r : 0;
          var g = ctx.createRadialGradient(0, 0, rin, 0, 0, ly.r); g.addColorStop(0, ly.c[0]); g.addColorStop(1, ly.c[1]);
          ctx.beginPath(); ctx.moveTo(0, -ly.r); ctx.arc(0, 0, ly.r, -Math.PI / 2, Math.PI / 2, false); ctx.closePath();
          ctx.fillStyle = g; ctx.fill();
          if (li) { ctx.strokeStyle = "rgba(40,20,10,.35)"; ctx.lineWidth = 1.2 / R; ctx.beginPath(); ctx.arc(0, 0, ly.r, -Math.PI / 2, Math.PI / 2, false); ctx.stroke(); }
        });
        if (o.onWall) o.onWall(ctx, k);
        ctx.beginPath(); ctx.moveTo(0, -1); ctx.arc(0, 0, 1, -Math.PI / 2, Math.PI / 2, false); ctx.closePath();
        var sh = ctx.createLinearGradient(0, 1, .8, -1); sh.addColorStop(0, k ? "rgba(10,20,50,.30)" : "rgba(255,255,255,.10)"); sh.addColorStop(1, k ? "rgba(10,20,50,.12)" : "rgba(0,0,0,.06)");
        ctx.fillStyle = sh; ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.6 / R; ctx.stroke();
      });
    });
  }
  return { P: P, wall: wallT, R: R, cx: cx, cy: cy, sp: sp, cp: cp, a0: a0, a1: a1,
    wp: function (k, u, v) { var a = k ? a1 : a0; return { x: cx + R * u * Math.cos(a), y: cy - R * (v * cp - u * Math.sin(a) * sp) }; } };
}
function hyp(a, b) { return Math.sqrt(a * a + b * b); }
/* 밝은 바탕용 이름표: 색 바탕 + 흰 글자 */
function lpill(ctx, s, x, y, o) { o = o || {}; o.bg = o.c || LT.ink; o.c = "#ffffff"; return K.pill(ctx, s, x, y, o); }
/* 화면 점 p 에 지시선 이름표 */
function pin(ctx, p, s, dx, dy, col, box) {
  ctx.strokeStyle = "rgba(20,25,40,.75)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + dx, p.y + dy); ctx.stroke();
  ctx.fillStyle = "#111622"; ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, 6.283); ctx.fill();
  return K.pill(ctx, s, p.x + dx + (dx < 0 ? -4 : 4), p.y + dy + 4, { s: 12, a: dx < 0 ? "right" : "left", c: col || "#e8ecff", box: box });
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
    var R = 20, got = window.sthState("a2") || { a: false, b: false }, cache = stash(canvas, W, H);
    var RK = K.rng(4), SPOTS = [], q, mv = null;
    for (q = 0; q < 70; q++) SPOTS.push([RK() * 6.2832, Math.sqrt(RK()), 4 + RK() * 9]);
    var CRACKS = [];
    for (q = 0; q < 11; q++) {
      var cp = [], ca = RK() * 6.2832, cr = RK() * .5;
      for (var cs = 0; cs < 4; cs++) { cp.push([ca, cr]); ca += (RK() - .5) * .9; cr = Math.min(1.02, cr + .18 + RK() * .25); }
      CRACKS.push(cp);
    }

    function paint() {
      var T = surfT(R), tt = mv ? mv.t : 0, kind = T >= 1200 ? 2 : (T >= 700 ? 1 : 0);
      var LW = 572, cx = 262, cy = 214, rad = 122, i;
      ctx.clearRect(0, 0, W, H);
      /* 움직이지 않는 지구 모형은 상태가 바뀔 때만 다시 그린다 */
      var img = cache(kind, function (c) {
        var keep = ctx; ctx = c;
        K.studio(ctx, 0, 0, LW, H, null);
        globe(ctx, cx, cy, rad, {
          glow: kind === 2 ? "rgba(255,140,60,.55)" : (kind === 1 ? "rgba(255,140,60,.25)" : null),
          surf: function (lo, la, lt) {
            var nz = wob(lo, la, 1.1), cr = Math.abs(wob(lo + 40, la, 2.2));
            if (kind === 2) return nz > .25 ? mixc("#e0581e", "#6a2412", (nz - .25) * 2.2, lt) : mixc("#ffd27a", "#e0581e", (nz + .6) * 1.2, lt);
            if (kind === 1) return cr < .07 ? mixc("#ffb050", "#ff6a20", cr * 14, lt) : mixc("#5e4a40", "#3e302a", (nz + 1) / 2, lt);
            return cr < .03 ? mixc("#4a4550", "#6a6570", cr * 30, lt) : mixc("#9a95a0", "#6c6874", (nz + 1) / 2, lt);
          },
          layers: kind === 2 ? [{ r: 1, c: ["#ff7a2a", "#ffe08a"] }, { r: .64, c: ["#a8482a", "#cf6a36"] }]
            : (kind === 1 ? [{ r: 1, c: ["#4a3a34", "#5c4a42"] }, { r: .95, c: ["#ff8a3a", "#ffc070"] }, { r: .8, c: ["#a8482a", "#c86434"] }]
              : [{ r: 1, c: ["#6a6470", "#8a8590"] }, { r: .93, c: ["#a8482a", "#c47a52"] }])
        });
        ctx = keep;
      });
      ctx.drawImage(img, 0, 0, W, H);
      /* 떨어지는 미행성 — 충돌 빈도에 비례해 개수가 늘어난다 */
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      var n = Math.round(R / 4);
      for (var k = 0; k < n; k++) {
        var ang = -2.6 + (k * .618 % 1) * 2.2, ph = (tt * (.32 + (k % 3) * .08) + k * .618) % 1;
        var d0 = rad + 190, dd = d0 - (d0 - rad) * ph;
        var px = cx + Math.cos(ang) * dd, py = cy + Math.sin(ang) * dd, tx = cx + Math.cos(ang) * (dd + 34), ty = cy + Math.sin(ang) * (dd + 34);
        var tg = ctx.createLinearGradient(px, py, tx, ty); tg.addColorStop(0, "rgba(255,150,60,.9)"); tg.addColorStop(1, "rgba(255,150,60,0)");
        ctx.strokeStyle = tg; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tx, ty); ctx.stroke();
        K.planet(ctx, px, py, 5, "#b8a58a", "#3a3028");
        if (ph > .86) { ctx.globalAlpha = (ph - .86) / .14; K.glow(ctx, cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, 5, "rgba(255,220,140,.95)", 4.5); ctx.globalAlpha = 1; }
      }
      ctx.restore();
      var box = [0, LW];
      var lab = function (u, v, s, dx, dy, col) {           /* 자른 벽(앞쪽 벽) 위 점에 지시선 이름표 */
        var a = 32 * DEG; pin(ctx, { x: cx + rad * u * Math.cos(a), y: cy - rad * (v * Math.cos(.36) - u * Math.sin(a) * Math.sin(.36)) }, s, dx, dy, col, box);
      };
      if (kind === 2) { lab(.82, .3, "마그마 바다 (녹은 암석)", 120, -34, "#ffd0a0"); lab(.3, -.2, "뜨거운 지구 속", 150, 40, "#ffe2c8"); }
      else if (kind === 1) { lab(.97, .2, "얇게 굳었다 녹았다 하는 겉", 110, -40, "#e8ecff"); lab(.86, -.1, "아직 녹아 있는 층", 130, 26, "#ffd0a0"); }
      else { lab(.96, .26, "굳은 지각", 120, -40, "#e8ecff"); lab(.4, -.2, "뜨거운 지구 속", 150, 40, "#ffe2c8"); }
      K.bigText(ctx, "지표 " + Math.round(T) + " ℃", 22, 52, 30, kind === 2 ? "#ffb35a" : (kind === 1 ? "#ffd35a" : "#ffffff"));
      K.bigText(ctx, kind === 2 ? "지구 전체가 녹은 마그마 바다" : (kind === 1 ? "겉은 굳었다 녹았다 한다" : "식으며 지각이 굳기 시작"), 22, 86, 18, "#ffffff");
      K.warn(ctx, LW - 14, H - 12, "⚠ 미행성 크기·층 두께는 실제 비율이 아님", "right");

      /* ── 오른쪽 : 흰 판정 카드 — 열 수지와 온도계 ── */
      var RX = LW + 10, px0 = RX + 18, px1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "지표를 달구는 열 (W/m²)");
      var rows = [
        { n: "☄️ 미행성 충돌 에너지", val: 6500 * R, c: LT.orange },
        { n: "☢️ 방사성 원소 붕괴열", val: 60, c: LT.violet },
        { n: "☀️ 태양 복사", val: 238, c: LT.yellow }
      ];
      var tot = rows[0].val + rows[1].val + rows[2].val;
      rows.forEach(function (r, i2) {
        var y = 60 + i2 * 44;
        K.row(ctx, r.n, num(Math.round(r.val)), px0, px1, y, r.c);
        K.bar(ctx, px0, y + 9, px1 - px0, r.val / Math.max(tot, 1), r.c);
      });
      /* 온도계 */
      var tx0 = px0 + 16, tTop = 206, tBot = H - 70, TMIN = -100, TMAX = 1700;
      function TY(v0) { return tBot - (v0 - TMIN) / (TMAX - TMIN) * (tBot - tTop); }
      ctx.fillStyle = "#e3e9f1"; ctx.beginPath(); ctx.roundRect(tx0 - 7, tTop - 6, 14, tBot - tTop + 16, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(tx0, tBot + 16, 13, 0, 6.2832); ctx.fill();
      var tcol = kind === 2 ? LT.red : (kind === 1 ? LT.orange : LT.blue);
      ctx.fillStyle = tcol; ctx.beginPath(); ctx.roundRect(tx0 - 4, TY(clamp(T, TMIN, TMAX)), 8, tBot + 10 - TY(clamp(T, TMIN, TMAX)), 4); ctx.fill();
      ctx.beginPath(); ctx.arc(tx0, tBot + 16, 9.5, 0, 6.2832); ctx.fill();
      [[1200, "1200 ℃ 암석이 모두 녹음", LT.red], [700, "700 ℃ 지각이 굳음", LT.orange]].forEach(function (m) {
        var my = TY(m[0]);
        K.line(ctx, { x: tx0 - 10, y: my }, { x: tx0 + 16, y: my }, m[2], 1.6, [4, 3]);
        K.t(ctx, m[1], tx0 + 22, my + 4, { s: 11, w: "800", c: m[2] });
      });
      K.t(ctx, "지표 평균 온도", px1, tTop + 64, { s: 12, w: "700", a: "right", c: LT.mute });
      K.t(ctx, Math.round(T) + " ℃", px1, tTop + 100, { s: 30, w: "900", a: "right", c: tcol });
      K.tip(ctx, kind === 2 ? "마그마 바다 — 지구 전체가 녹아 있다" : (kind === 1 ? "아직 뜨겁지만 다 녹지는 않았다" : "지각이 굳기 시작한다"), px0 - 4, H - 50, px1 - px0 + 8, kind === 2 ? true : (kind === 0 ? true : null));
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
    var t = 0, got = window.sthState("a3") || { a: false, b: false }, okQ = !!window.sthState("a3q"), cache = stash(canvas, W, H);
    var mv = null;

    function paint() {
      var p = prog(t), tt = mv ? mv.t : 0, i;
      var LW = 520, cx = 246, cy = 222, rad = 132, coreR = 0.546 * Math.sqrt(p), crust = p > 0.88;
      var A0 = 32 * DEG, A1 = 138 * DEG, SP = Math.sin(.36), CP = Math.cos(.36);
      function wallT(k, fn) { var a = k ? A1 : A0; ctx.save(); ctx.transform(rad * Math.cos(a), rad * Math.sin(a) * SP, 0, -rad * CP, cx, cy); fn(); ctx.restore(); }
      function wpt(k, u, v) { var a = k ? A1 : A0; return { x: cx + rad * u * Math.cos(a), y: cy - rad * (v * CP - u * Math.sin(a) * SP) }; }
      ctx.clearRect(0, 0, W, H);
      var img = cache(t, function (c) {
        var keep = ctx; ctx = c;
        K.studio(ctx, 0, 0, LW, H, null);
        var L = [];
        if (crust) L.push({ r: 1, c: ["#5b4a40", "#6e5c50"] });
        L.push({ r: crust ? .965 : 1, c: ["#c8582a", "#ffb35c"] });
        if (coreR > .01) L.push({ r: coreR, c: ["#f4f1ea", "#9a9aa6"] });
        globe(ctx, cx, cy, rad, { glow: crust ? null : "rgba(255,140,60,.45)", layers: L,
          surf: function (lo, la, lt) {
            var nz = wob(lo, la, 1.1);
            if (crust) return mixc("#7a6a5e", "#4e4038", (nz + 1) / 2, lt);
            return nz > .25 ? mixc("#e0581e", "#7a2a14", (nz - .25) * 2, lt) : mixc("#ffd27a", "#e0581e", (nz + .6) * 1.2, lt);
          } });
        ctx = keep;
      });
      ctx.drawImage(img, 0, 0, W, H);
      /* 자른 벽 위: 가라앉는 철 방울과 떠오르는 규산염 */
      var drops = Math.round(9 * (1 - p)), nb = Math.round(7 * (1 - p));
      [0, 1].forEach(function (k) {
        wallT(k, function () {
          for (i = 0; i < drops; i++) {
            var th = (-70 + ((i * 47 + k * 23) % 140)) * DEG, u = (tt * .22 + (i % 5) / 5 + i * .13) % 1;
            var rr = lerp(.9, Math.max(coreR + .07, .16), u), x = rr * Math.cos(th), y = rr * Math.sin(th);
            var g = ctx.createRadialGradient(x - .01, y + .012, .002, x, y, .04);
            g.addColorStop(0, "#ffffff"); g.addColorStop(.35, "#b9bec9"); g.addColorStop(1, "#3b3f4a");
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, .034, 0, 6.2832); ctx.fill();
            ctx.strokeStyle = "rgba(220,225,240,.55)"; ctx.lineWidth = .02; ctx.beginPath(); ctx.moveTo(x + .045 * Math.cos(th), y + .045 * Math.sin(th)); ctx.lineTo(x + .11 * Math.cos(th), y + .11 * Math.sin(th)); ctx.stroke();
          }
          for (i = 0; i < nb; i++) {
            var th2 = (-60 + ((i * 61 + k * 37) % 120)) * DEG, u2 = (tt * .15 + i / 7) % 1, r2 = lerp(Math.max(coreR + .1, .25), .92, u2);
            ctx.globalAlpha = Math.sin(u2 * Math.PI) * .9;
            var g2 = ctx.createRadialGradient(r2 * Math.cos(th2), r2 * Math.sin(th2), 0, r2 * Math.cos(th2), r2 * Math.sin(th2), .05);
            g2.addColorStop(0, "rgba(255,250,220,1)"); g2.addColorStop(1, "rgba(255,240,200,0)");
            ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(r2 * Math.cos(th2), r2 * Math.sin(th2), .05, 0, 6.2832); ctx.fill();
            ctx.globalAlpha = 1;
          }
        });
      });
      var box = [0, LW];
      if (p < .95) pin(ctx, wpt(0, .7, .5), "⬇ 가라앉는 철 방울", 96, -60, "#e8ecff", box);
      pin(ctx, wpt(0, .55, -.35), crust ? "맨틀 (규산염)" : "녹은 규산염 (마그마 바다)", 120, 30, "#ffd0a0", box);
      if (coreR > .12) pin(ctx, wpt(1, coreR * .5, -coreR * .3), "핵 (철·니켈)", -70, 64, "#f4f1ea", box);
      if (crust) pin(ctx, wpt(1, .98, .3), "지각", -60, -40, "#e8ecff", box);
      K.bigText(ctx, "층상 분화 " + (p * 100).toFixed(0) + "%", 20, 50, 28, p >= .95 ? "#7ef0b8" : "#ffd35a");
      K.bigText(ctx, p <= 0 ? "무거운 것과 가벼운 것이 뒤섞인 채" : (p < .95 ? "철은 가라앉고 규산염은 떠오른다" : "핵·맨틀·지각이 갈라섰다"), 20, 84, 17, "#ffffff");
      K.warn(ctx, LW - 12, H - 12, "⚠ 철 방울 크기·지각 두께는 과장", "right");

      /* ── 오른쪽 : 흰 판정 카드 ── */
      var RX = LW + 10, px0 = RX + 18, px1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "층상 분화 진행도");
      K.t(ctx, (p * 100).toFixed(1) + " %", px0, 66, { s: 26, w: "900", c: p >= .95 ? LT.green : LT.orange });
      K.t(ctx, t + "백만 년 뒤", px1, 66, { s: 14, w: "900", a: "right", c: LT.ink });
      K.bar(ctx, px0, 78, px1 - px0, p, p >= .95 ? LT.green : LT.orange);
      var g = K.chart(ctx, { x: RX + 6, y: 100, w: W - RX - 14, h: 190, light: true, x0: 0, x1: 200, y0: 0, y1: 100, xt: 4, yt: 4, xl: "지구 형성 뒤 (백만 년)", yf: function (v0) { return v0 + "%"; } });
      var pts = [];
      for (var k2 = 0; k2 <= 100; k2++) { var tk = k2 / 100 * 200; pts.push([tk, prog(tk) * 100]); }
      K.plot(ctx, g, pts, LT.green, { light: true });
      var mx = g.X(t), my = g.Y(p * 100);
      K.line(ctx, { x: mx, y: g.T }, { x: mx, y: g.B }, LT.blue, 1.5, [5, 4]);
      ctx.fillStyle = LT.blue; ctx.beginPath(); ctx.arc(mx, my, 5, 0, 6.2832); ctx.fill();
      K.row(ctx, "핵의 반지름", Math.round(coreR * 6371).toLocaleString() + " km", px0, px1, 326, LT.ink);
      K.tip(ctx, p >= .95 ? "핵·맨틀·지각 분리 완료" : (p > 0 ? "밀도 차이로 층이 나뉘는 중" : "아직 섞여 있다"), px0 - 4, 344, px1 - px0 + 8, p >= .95 ? true : null);
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
    var d = 1.00, m = 1.00, got = window.sthState("a4") || {}, cache = stash(canvas, W, H);
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
      /* ── 왼쪽 : 스튜디오 위 행성 미니어처 ── */
      var LW = 440, cx = 250, cy = 206, rad = Math.round(clamp(40 + 52 * Math.pow(m, 1 / 3), 40, 112));
      var img = cache(w.kind + rad + (w.keep >= .1 ? "a" : ""), function (c) {
        var keep = ctx; ctx = c;
        K.studio(ctx, 0, 0, LW, H, null);
        globe(ctx, cx, cy, rad, { cut: false,
          glow: w.keep >= .1 ? (w.kind === "vapor" ? "rgba(255,190,90,.75)" : "rgba(120,190,255,.6)") : null,
          surf: function (lo, la, lt) {
            var nz = wob(lo, la, 1.3);
            if (w.kind === "ocean") { var ld = landAt(lo, la); return ld === 2 ? K.tint("#f2f6fb", lt) : (ld ? mixc("#5f9a48", "#a8915a", (nz + 1) / 2, lt) : mixc("#2f7fd8", "#15488f", (nz + 1) / 2, lt)); }
            if (w.kind === "vapor") return mixc("#f6e2a8", "#c9a25a", (Math.sin(la * .16 + nz * 1.5) + 1) / 2, lt);
            if (w.kind === "ice") return Math.abs(wob(lo, la, 2.4)) < .05 ? K.tint("#8fb0d6", lt) : mixc("#ffffff", "#cfe0f4", (nz + 1) / 2, lt);
            return Math.abs(wob(lo + 30, la, 2.6)) < .06 ? K.tint("#5a5650", lt) : mixc("#b8b2a8", "#7c766e", (nz + 1) / 2, lt);
          } });
        if (w.kind === "ocean") {                     /* 구름 몇 줄기 */
          ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 4; ctx.lineCap = "round";
          [[-.5, -.3, .5], [.1, -.1, .55], [-.2, .45, .45]].forEach(function (q) { ctx.beginPath(); ctx.arc(cx + q[0] * rad, cy + q[1] * rad, q[2] * rad, .3, 1.2); ctx.stroke(); });
          ctx.lineCap = "butt";
        }
        ctx = keep;
      });
      ctx.drawImage(img, 0, 0, W, H);
      var sr = clamp(12 / d, 6, 34);
      K.sun(ctx, 40, 150, sr * .55);
      K.planet(ctx, 40, 150, sr * .55, "#ffd25a", "#e0801e");
      K.pill(ctx, "태양 (가까울수록 크게)", 18, 150 + sr * .9 + 22, { s: 11, c: "#ffe2a0", box: [0, LW] });
      K.bigText(ctx, KD.name, 18, 48, 24, w.kind === "ocean" ? "#9fdcff" : (w.kind === "vapor" ? "#ffb35a" : (w.kind === "ice" ? "#d8ccff" : "#ffffff")));
      K.bigText(ctx, "지표 평균 " + Math.round(w.T) + " ℃", 18, 80, 18, "#ffffff");
      K.pill(ctx, "대기 CO₂ " + (w.kind === "vapor" ? Math.round(w.co2) + "기압" : (w.kind === "ocean" ? "약 0.04%" : (w.kind === "ice" ? "적음" : "거의 없음"))) + " · 받는 햇빛 " + Math.round(w.sAbs) + " W/m²", cx - 20, H - 16, { a: "center", s: 11.5, c: "#e8ecff", box: [0, LW] });
      K.warn(ctx, LW - 12, 30, "⚠ 크기·거리 비율 아님", "right");

      /* ── 오른쪽 : 흰 카드 — 갈림길 지도 ── */
      var RX = LW + 8, LC = { ocean: LT.blue, vapor: LT.red, ice: LT.violet, bare: "#9aa0b0" };
      K.card(ctx, RX, 0, W - RX, H, "갈림길 지도");
      K.t(ctx, "가로 = 태양까지 거리 · 세로 = 질량(지구 = 1)", W - 18, 28, { s: 11, a: "right", c: LT.mute });
      ctx.globalAlpha = .38;
      CELLS.forEach(function (c) { ctx.fillStyle = LC[c[2]]; ctx.fillRect(MX0 + c[0] * 10, MY0 + c[1] * 10, 10, 10); });
      ctx.globalAlpha = 1;
      ctx.strokeStyle = LT.line; ctx.lineWidth = 1.5; ctx.strokeRect(MX0, MY0, MW, MH);
      [[0.3, "0.3"], [1.0, "1.0 AU"], [2.0, "2.0"]].forEach(function (g) {
        K.t(ctx, g[1], clamp(mapX(g[0]), MX0 + 10, MX0 + MW - 16), MY0 + MH + 16, { s: 10.5, c: LT.mute, a: "center", w: "700" });
      });
      [[2, "질량 2"], [0.2, "0.2"], [0.02, "0.02"]].forEach(function (g) {
        K.t(ctx, g[1], MX0 - 6, clamp(mapY(g[0]) + 4, MY0 + 8, MY0 + MH + 2), { s: 10.5, c: LT.mute, a: "right", w: "700" });
      });
      K.t(ctx, "태양에서 멀어짐 →", MX0 + MW, MY0 + MH + 34, { s: 10.5, c: LT.dim, a: "right" });
      var curX = clamp(mapX(d), MX0, MX0 + MW), curY = clamp(mapY(m), MY0, MY0 + MH);
      REAL.forEach(function (p) {
        var px = mapX(p.d), py = mapY(p.m), near = Math.abs(curX - px) < 70 && Math.abs(curY - py) < 22 && curX >= px - 4;
        ctx.fillStyle = LT.ink; ctx.beginPath(); ctx.arc(px, py, 3.6, 0, 6.2832); ctx.fill();
        K.pill(ctx, p.n, near ? px - 22 : px + 9, py + 4, { s: 11, a: near ? "right" : "left", c: "#ffffff", bg: "rgba(18,32,58,.82)", box: [MX0, MX0 + MW] });
      });
      ctx.strokeStyle = LT.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(curX, curY, 10, 0, 6.2832); ctx.stroke();
      ctx.strokeStyle = LC[w.kind]; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(curX, curY, 6, 0, 6.2832); ctx.stroke();
      K.line(ctx, { x: curX - 18, y: curY }, { x: curX - 12, y: curY }, LT.ink, 2); K.line(ctx, { x: curX + 12, y: curY }, { x: curX + 18, y: curY }, LT.ink, 2);
      var lx = RX + 14;
      ["ocean", "vapor", "ice", "bare"].forEach(function (k) {
        var r = K.pill(ctx, "■ " + KIND[k].name.slice(3), lx, 384, { s: 10.5, c: "#ffffff", bg: LC[k], box: [RX, W] });
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
    var P = 0, V = 6, got = window.sthState("b2") || { a: false, b: false, c: false }, cache = stash(canvas, W, H);
    var mv = null, RB = K.rng(12), SPECK = [];
    for (var sq = 0; sq < 16; sq++) SPECK.push([RB(), RB()]);
    /* 블록 모형: x 왼쪽 위(해안·화산) → 오른쪽 아래(먼바다), 앞면 = 바다 단면(물속 철 이온, 바닥의 호상철광층) */
    var I = K.iso({ ox: 330, oy: 184, s: 0.54, L: 380, D: 150 }), BL = I.L, BD = I.D;
    var SL = 104, BASE = 14, TOPB = 14 + 8 * 4.2, XS = 46;
    function bed(u) { return u < XS ? 116 + 6 * Math.sin(u / 9) : (u < 150 ? lerp(SL - 8, TOPB, clamp((u - XS - 20) / 84, 0, 1)) : TOPB); }
    var STROM = [[78, 30], [96, 70], [70, 110], [116, 40], [104, 128], [130, 92]];
    function paint() {
      var r = oxy(P, V), net = r.net, tS = r.tStar, tt = mv ? mv.t : 0, i, k;
      var atmEnd = atmAt(net, tS, NT), ironEnd = ironAt(net, NT), aMax = Math.max(120, atmEnd);
      var nb = Math.round((FE - ironEnd) / FE * 8), TH = 330, LW = 600;
      ctx.clearRect(0, 0, W, H);
      var img = cache(P + "/" + V, function (c) {
        var keep = ctx; ctx = c;
        K.studio(ctx, 0, 0, LW, TH, { x: I.P(BL, BD, 0).x - 120, y: I.P(BL, BD, 0).y - 10, rx: 300, ry: 46 });
        ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, TH, 14); ctx.clip();
        ["front", "right"].forEach(function (side) {
          I.face(ctx, side, function (Lw) {
            var zf = side === "front" ? bed : function () { return TOPB; };
            ctx.save(); I.profile(ctx, side, zf, 0); ctx.clip();
            var g = ctx.createLinearGradient(0, 0, 0, 130); g.addColorStop(0, "#3b3330"); g.addColorStop(1, "#7a6a5c");
            ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, 140);
            for (var b = 0; b < 8; b++) {
              var z0 = BASE + b * 4.2;
              ctx.fillStyle = b < nb ? (b % 2 ? "#8c8a96" : "#b8402c") : "#5a4e46";
              ctx.fillRect(side === "front" ? 120 : 0, z0, Lw, 4.2);
            }
            var R0 = K.rng(side === "front" ? 5 : 9);
            for (var q = 0; q < Lw * 1.2; q++) { ctx.fillStyle = R0() > .5 ? "rgba(255,255,255,.12)" : "rgba(30,20,10,.25)"; ctx.fillRect(R0() * Lw, R0() * 130, 1.4, 1.4); }
            ctx.restore();
          });
        });
        I.top(ctx, bed, function (n, u) { return u < XS ? (n % 2 ? "#a08a6a" : "#9a8464") : K.tint("#8a7a62", .95 + .1 * (n % 2)); }, 60);
        STROM.forEach(function (s) {                    /* 남세균이 쌓은 스트로마톨라이트 */
          var p = I.P(s[0], s[1], bed(s[0]));
          var g2 = ctx.createRadialGradient(p.x - 4, p.y - 8, 1, p.x, p.y - 4, 13);
          g2.addColorStop(0, "#9be07a"); g2.addColorStop(1, "#2f6a2a");
          ctx.fillStyle = g2; ctx.beginPath(); ctx.ellipse(p.x, p.y - 3, 13, 9, 0, Math.PI, 0); ctx.lineTo(p.x + 13, p.y); ctx.ellipse(p.x, p.y, 13, 4, 0, 0, Math.PI); ctx.fill();
        });
        I.water(ctx, SL, function (u, side) { return side === "front" ? bed(u) : TOPB; }, {
          clipSurface: function (c2) { var a = I.P(XS + 6, 0, SL), b2 = I.P(BL, 0, SL), cc = I.P(BL, BD, SL), d = I.P(XS + 6, BD, SL); c2.beginPath(); c2.moveTo(a.x, a.y); c2.lineTo(b2.x, b2.y); c2.lineTo(cc.x, cc.y); c2.lineTo(d.x, d.y); c2.closePath(); c2.clip(); },
          top: "rgba(80,170,190,.45)", deep: "rgba(20,70,110,.72)" });
        I.shade(ctx, "front", function (u) { return Math.max(bed(u), SL); });
        I.shade(ctx, "right", function () { return SL; });
        I.edges(ctx, SL, SL);
        /* 해안의 화산 */
        var vb = I.P(20, 128, 118), vh = 30 + V * 1.6;
        var vg = ctx.createLinearGradient(vb.x - 34, 0, vb.x + 34, 0); vg.addColorStop(0, "#6b4b3b"); vg.addColorStop(.5, "#493227"); vg.addColorStop(1, "#2b1d17");
        ctx.fillStyle = vg; ctx.beginPath(); ctx.moveTo(vb.x - 36, vb.y); ctx.quadraticCurveTo(vb.x - 10, vb.y - vh * .5, vb.x - 7, vb.y - vh); ctx.lineTo(vb.x + 7, vb.y - vh); ctx.quadraticCurveTo(vb.x + 10, vb.y - vh * .5, vb.x + 36, vb.y); ctx.closePath(); ctx.fill();
        K.glow(ctx, vb.x, vb.y - vh, 4, "rgba(255,120,50,.95)", 3);
        ctx.restore();
        ctx = keep;
      });
      ctx.drawImage(img, 0, 0, W, H);
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, TH, 14); ctx.clip();
      /* 화산 기체 */
      var vb2 = I.P(20, 128, 118), vh2 = 30 + V * 1.6;
      for (k = 0; k < Math.round(V / 2) + 1; k++) {
        var u = ((tt * .25 + k / 6) % 1 + 1) % 1;
        ctx.fillStyle = "rgba(140,130,120," + (.5 * (1 - u)).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(vb2.x - u * 40, vb2.y - vh2 - 6 - u * 34, 5 + u * 10, 0, 6.283); ctx.fill();
      }
      /* 앞면 물속: 녹아 있는 철 이온(Fe²⁺)과 가라앉는 산화철 */
      I.face(ctx, "front", function () {
        var nI = Math.round(ironEnd / FE * 24);
        for (i = 0; i < nI; i++) { var sx = 160 + SPECK[i % 16][0] * 200 + (i > 15 ? 9 : 0), sz = TOPB + 8 + SPECK[i % 16][1] * (SL - TOPB - 16) + Math.sin(tt * 1.5 + i) * 2; K.glow(ctx, sx, sz, 1.6, "rgba(90,230,220,.95)", 2.6); }
        if (net > 0 && ironEnd > 0) for (i = 0; i < 10; i++) { var fu = (tt * .3 + i / 10) % 1; ctx.fillStyle = "#c0562e"; ctx.fillRect(166 + i * 20, lerp(SL - 10, TOPB + 2, fu), 2.6, 2.6); }
        if (P > 0) for (i = 0; i < Math.round(P / 3) + 1; i++) { var bu = (tt * .5 + i * .23) % 1; K.glow(ctx, 70 + i * 14, lerp(SL - 24, SL, bu), 1.4, "rgba(200,180,255,.95)", 2.6); }
      });
      /* 기권: 대기에 쌓인 산소 분자 */
      var nO = Math.round(clamp(atmEnd / aMax, 0, 1) * 16);
      for (k = 0; k < nO; k++) {
        var mx = 300 + SPECK[15 - k][0] * 280 + Math.sin(tt * .6 + k) * 4, my = 100 + SPECK[15 - k][1] * 70;
        K.planet(ctx, mx - 4, my, 4.4, "#d8c8ff", "#5b3fb0"); K.planet(ctx, mx + 4, my, 4.4, "#d8c8ff", "#5b3fb0");
      }
      ctx.restore();
      var box = [0, LW];
      I.label(ctx, 90, 40, bed(90) + 6, "생물권 · 남세균 (스트로마톨라이트)", -60, 74, "#c8f5b0", box);
      I.label(ctx, 300, BD, (TOPB + SL) / 2 + 10, "수권 · 바닷물 속 철 이온 Fe²⁺", 50, -30, "#9ff0e8", box);
      I.label(ctx, 260, BD, BASE + 12, "지권 · 호상철광층 " + nb + "/8 줄", 50, 12, "#ffc8a8", box);
      if (nO > 0) K.pill(ctx, "기권 · 산소 O₂", LW - 14, 72, { a: "right", s: 12, c: "#d8ccff", box: box });
      K.pill(ctx, "🌋 화산 기체가 산소 " + V + " 소모", vb2.x - 30, vb2.y + 28, { s: 11, a: "right", c: "#ffd0b0", box: box });
      K.bigText(ctx, P === 0 ? "산소를 만드는 생물이 없다" : (net <= 0 ? "산소는 생겨도 남지 않는다" : (r.start ? "철이 바닥나자 대기로!" : "산소가 철을 녹슬게 한다")), 18, 46, 24, net > 0 && r.start ? "#ffd35a" : "#ffffff");
      K.bigText(ctx, "남는 산소 " + Math.max(0, net) + (r.start ? " · 철 바닥 " + tS.toFixed(0) + "칸" : ""), 18, 76, 16, "#ffd35a");
      K.warn(ctx, LW - 14, 30, "⚠ 두께·크기는 보기 쉽게 과장", "right");

      /* 오른쪽 흰 카드: 네 권역 */
      var RX = LW + 10, px0 = RX + 18, px1 = W - 18;
      K.card(ctx, RX, 0, W - RX, TH, "산소가 가는 길 (200칸 뒤)");
      K.row(ctx, "생물권 · 산소 생산", String(P), px0, px1, 58, LT.green);
      K.row(ctx, "화산 기체 · 소모", "−" + V, px0, px1, 84, LT.red);
      K.row(ctx, "수권 · 철 이온 잔량", Math.round(ironEnd) + " / 100", px0, px1, 118, LT.teal);
      K.bar(ctx, px0, 126, px1 - px0, ironEnd / FE, LT.teal);
      K.row(ctx, "지권 · 호상철광층", Math.round(FE - ironEnd) + "", px0, px1, 162, LT.orange);
      K.bar(ctx, px0, 170, px1 - px0, (FE - ironEnd) / FE, LT.orange);
      K.row(ctx, "기권 · 대기 산소", atmEnd.toFixed(0), px0, px1, 206, LT.violet);
      K.bar(ctx, px0, 214, px1 - px0, clamp(atmEnd / aMax, 0, 1), LT.violet);
      K.t(ctx, "산소가 가는 차례", px0, 300, { s: 12, w: "800", c: LT.mute });
      K.t(ctx, "생물권 → 수권(철) → 지권 → 기권", px0, 320, { s: 12.5, w: "900", c: LT.ink });
      K.tip(ctx, P === 0 ? "산소 생산 0" : (net <= 0 ? "화산 기체가 다 먹어 치움" : (r.start ? "철이 바닥난 뒤 대기에 쌓임" : "아직 철을 산화시키는 중")), px0 - 4, 238, px1 - px0 + 8, net > 0 ? (r.start ? true : null) : false);

      /* ── 아래 : 시간에 따른 변화(밝은 그래프) ── */
      var GY0 = TH + 8;
      K.studio(ctx, 0, GY0, W, H - GY0, null);
      var g = K.chart(ctx, { x: 0, y: GY0, w: W, h: H - GY0, pl: 64, pt: 40, pr: 22, light: true, x0: 0, x1: NT, y0: 0, y1: 100, xt: 4, yt: 4,
        xl: "남세균이 나타난 뒤 흐른 시간 (칸)" });
      var endX = r.start ? g.X(tS) : g.R;
      if (P > 0) {
        ctx.fillStyle = "rgba(232,89,12,.08)"; ctx.fillRect(g.L, g.T, endX - g.L, g.B - g.T);
        if (endX - g.L > 230) K.t(ctx, net > 0 ? "철이 산화되어 가라앉는 기간" : "산소가 모두 소모되는 기간", (g.L + endX) / 2, g.T + 22, { a: "center", s: 12, w: "800", c: LT.orange });
      }
      var ip = [], ap = [];
      for (var i2 = 0; i2 <= 200; i2++) {
        var t2 = i2 / 200 * NT;
        ip.push([t2, ironAt(net, t2) / FE * 100]);
        ap.push([t2, clamp(atmAt(net, tS, t2) / aMax, 0, 1) * 100]);
      }
      K.plot(ctx, g, ip, LT.teal, { light: true });
      K.plot(ctx, g, ap, LT.violet, { light: true });
      if (r.start) {
        K.line(ctx, { x: g.X(tS), y: g.T }, { x: g.X(tS), y: g.B }, LT.yellow, 2, [5, 5]);
        K.pill(ctx, "철이 바닥남 (" + tS.toFixed(0) + "칸)", g.X(tS) + 8, g.T + 44, { s: 11, c: "#ffffff", bg: LT.yellow, box: [0, W - 8] });
      }
      K.t(ctx, "● 바닷속 철 이온 잔량 (처음 = 100)", 64, GY0 + 26, { s: 12, w: "800", c: LT.teal });
      K.t(ctx, "● 대기에 쌓인 산소 (상대값)", 330, GY0 + 26, { s: 12, w: "800", c: LT.violet });
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
    var X0 = 70, X1 = 600;

    function px(a) { return X0 + (46 - a) / 46 * (X1 - X0); }
    function py(val, y0, y1) { return y1 - (Math.log(Math.max(val, 0.0001)) / Math.LN10 - LO) / (HI - LO) * (y1 - y0); }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 620;
      K.studio(ctx, 0, 0, LW, H, null);
      var y0 = 104, y1 = H - 44, i;
      ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fillRect(X0, y0, X1 - X0, y1 - y0);
      ctx.fillStyle = "rgba(232,89,12,.08)"; ctx.fillRect(X0, y0, px(24) - X0, y1 - y0);
      K.t(ctx, "산소가 거의 없던 시대", (X0 + px(24)) / 2, y1 - 14, { s: 12, w: "800", a: "center", c: LT.orange });
      [0.0001, 0.001, 0.01, 0.1, 1, 10].forEach(function (g) {
        var gy = py(g, y0, y1);
        K.line(ctx, { x: X0, y: gy }, { x: X1, y: gy }, LT.grid, 1);
        K.t(ctx, g + "%", X0 - 6, gy + 4, { s: 10.5, c: LT.mute, a: "right", w: "700" });
      });
      [46, 40, 30, 24, 20, 10, 5, 0].forEach(function (g) { K.t(ctx, g + "", px(g), y1 + 16, { s: 10.5, c: LT.mute, a: "center", w: "700" }); });
      K.t(ctx, "억 년 전", X1, y1 + 34, { s: 11, c: LT.mute, a: "right" });
      ctx.strokeStyle = LT.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X0, y0); ctx.lineTo(X0, y1); ctx.lineTo(X1, y1); ctx.stroke();
      var pts = [];
      for (i = 0; i <= 460; i++) { var a = 46 - i / 460 * 46; pts.push([px(a), py(o2At(a), y0, y1)]); }
      var ag = ctx.createLinearGradient(0, y0, 0, y1); ag.addColorStop(0, "rgba(15,159,118,.28)"); ag.addColorStop(1, "rgba(15,159,118,0)");
      ctx.fillStyle = ag; ctx.beginPath(); ctx.moveTo(pts[0][0], y1);
      pts.forEach(function (p) { ctx.lineTo(p[0], p[1]); }); ctx.lineTo(pts[pts.length - 1][0], y1); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.strokeStyle = LT.green; ctx.lineWidth = 3.4; ctx.lineJoin = "round";
      ctx.beginPath(); pts.forEach(function (p, k) { if (k) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); ctx.restore();
      [[24, "대산소화 사건"], [4.4, "육상 진출"]].forEach(function (mk) {
        var mxx = px(mk[0]);
        K.line(ctx, { x: mxx, y: y0 }, { x: mxx, y: y1 }, LT.yellow, 1.8, [5, 5]);
        K.pill(ctx, mk[1], mxx + (mk[0] < 10 ? -6 : 6), y0 + 18, { s: 11, a: mk[0] < 10 ? "right" : "left", c: "#ffffff", bg: LT.yellow, box: [0, LW - 6] });
      });
      var val = o2At(age), cxp = px(age), cyp = py(val, y0, y1), vs = val < 0.01 ? val.toFixed(4) : val.toFixed(1);
      K.line(ctx, { x: cxp, y: y0 }, { x: cxp, y: y1 }, LT.blue, 1.6, [4, 4]);
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(cxp, cyp, 8, 0, 6.2832); ctx.fill();
      ctx.fillStyle = LT.blue; ctx.beginPath(); ctx.arc(cxp, cyp, 5.5, 0, 6.2832); ctx.fill();
      K.bigText(ctx, "산소 " + vs + "%", 18, 50, 30, val >= 15 ? "#7ef0b8" : (val >= 1 ? "#ffd35a" : "#ffffff"));
      K.bigText(ctx, age.toFixed(1) + "억 년 전 대기", 18, 84, 18, "#ffffff");
      K.pill(ctx, "로그 눈금 — 한 칸 오를 때마다 10배", LW - 14, 30, { a: "right", s: 11, c: "#e8ecff", box: [0, LW] });

      /* 오른쪽 흰 판정 카드: 그 시대의 지구 */
      var RX = LW + 10, px0 = RX + 18, px1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "그 시대의 지구");
      K.t(ctx, age.toFixed(1) + "억 년 전", px0, 62, { s: 22, w: "900", c: LT.ink });
      K.row(ctx, "대기 중 산소", vs + " %", px0, px1, 96, LT.green);
      K.bar(ctx, px0, 104, px1 - px0, (Math.log(Math.max(val, 0.0001)) / Math.LN10 + 4) / (HI - LO), LT.green);
      K.row(ctx, "오늘(21%)과 비교", val >= 0.21 ? Math.round(val / 21 * 100) + " %" : "1% 미만", px0, px1, 140, LT.ink);
      twrap(ctx, eraOf(age), px0, 176, px1 - px0, 19, { s: 12, w: "700", c: LT.ink });
      K.tip(ctx, age > 24 ? "산소가 거의 없는 바다·하늘" : (age > 6 ? "산소가 처음 쌓인 뒤 낮게 머문 시기" : "산소가 두 번째로 크게 늘어난 뒤"), px0 - 4, H - 50, px1 - px0 + 8, age <= 6 ? true : (age > 24 ? false : null));
      $("b-c2-info").innerHTML = "약 <b>" + age.toFixed(1) + "억 년 전</b>, 대기 중 산소 농도는 약 <b>"
        + vs + "%</b>였습니다. " + eraOf(age);

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
    var pct = 2, got = window.sthState("b4") || { a: false, b: false }, mv = null, cache = stash(canvas, W, H);
    var RO = K.rng(31), O3 = [];
    for (var oq = 0; oq < 26; oq++) O3.push([RO(), RO()]);

    function o3(x, y, s) {
      K.planet(ctx, x - s, y + s * .6, s, "#d8c8ff", "#4b3a8a"); K.planet(ctx, x + s, y + s * .6, s, "#d8c8ff", "#4b3a8a"); K.planet(ctx, x, y - s * .7, s, "#d8c8ff", "#4b3a8a");
    }
    /* 블록 모형: 왼쪽 위 = 육지, 오른쪽 아래 = 바다. 위에 떠 있는 보라색 판 = 오존층(두께 = 오존의 양) */
    var I = K.iso({ ox: 268, oy: 262, s: 0.58, L: 360, D: 180 }), BL = I.L, BD = I.D, XC = 170, GZ = 64, SZ = 58, OZ = 214;
    function gz(u) { return u < XC ? GZ + 6 * Math.sin(u / 23) : 14; }
    function paint() {
      var o = ozone(pct), tr = o.tr, tt = mv ? mv.t : 0, LW = 556, i;
      var th = clamp(o.rel / 100 * 36, 1.5, 46), green = tr < 0.01;
      ctx.clearRect(0, 0, W, H);
      var img = cache(pct, function (c) {
        var keep = ctx; ctx = c;
        K.studio(ctx, 0, 0, LW, H, { x: I.P(BL, BD, 0).x - 120, y: I.P(BL, BD, 0).y - 16, rx: 280, ry: 44 });
        ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
        ["front", "right"].forEach(function (side) {
          I.face(ctx, side, function (Lw) {
            var zf = side === "front" ? gz : function () { return 14; };
            ctx.save(); I.profile(ctx, side, zf, 0); ctx.clip();
            var g = ctx.createLinearGradient(0, 0, 0, 70); g.addColorStop(0, "#5a4636"); g.addColorStop(1, green ? "#7a5a3a" : "#9a7a58");
            ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, 80);
            ctx.strokeStyle = "rgba(40,25,10,.25)"; ctx.lineWidth = 1; for (var y = 10; y < 70; y += 12) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(Lw, y + 2); ctx.stroke(); }
            ctx.restore();
          });
        });
        I.top(ctx, gz, function (n, u) { return u < XC ? (green ? K.tint("#5f9a48", .95 + .08 * (n % 2)) : K.tint("#b08a62", .95 + .08 * (n % 2))) : "#8e7b63"; }, 60);
        I.water(ctx, SZ, function (u, side) { return side === "front" ? gz(u) : 14; }, {
          clipSurface: function (c2) { var a = I.P(XC, 0, SZ), b = I.P(BL, 0, SZ), cc = I.P(BL, BD, SZ), d = I.P(XC, BD, SZ); c2.beginPath(); c2.moveTo(a.x, a.y); c2.lineTo(b.x, b.y); c2.lineTo(cc.x, cc.y); c2.lineTo(d.x, d.y); c2.closePath(); c2.clip(); } });
        I.shade(ctx, "front", function (u) { return Math.max(gz(u), u >= XC ? SZ : 0); });
        I.shade(ctx, "right", function () { return SZ; });
        I.edges(ctx, SZ, SZ);
        if (green) [[30, 30], [70, 60], [120, 40], [40, 120], [100, 140], [150, 100], [60, 170], [140, 165]].forEach(function (t, k) { I.tree(ctx, t[0], t[1], gz(t[0]), .9 + (k % 3) * .15); });
        else [[40, 50], [110, 90], [70, 150], [150, 40]].forEach(function (t) { var p = I.P(t[0], t[1], gz(t[0])); K.planet(ctx, p.x, p.y - 3, 5, "#b89a7a", "#4a3626"); });
        /* 떠 있는 오존층 판 */
        I.box(ctx, 0, 0, OZ, BL, BD, OZ + th, "rgba(182,156,255,.55)", "rgba(140,110,230,.55)", "rgba(110,80,200,.55)");
        var R3 = K.rng(31), nO = Math.round(clamp(o.rel / 100, 0, 1.3) * 22);
        for (i = 0; i < nO; i++) { var q = I.P(R3() * BL, R3() * BD, OZ + th); K.planet(ctx, q.x - 3, q.y + 1, 2.6, "#efe6ff", "#5b3fb0"); K.planet(ctx, q.x + 3, q.y + 1, 2.6, "#efe6ff", "#5b3fb0"); K.planet(ctx, q.x, q.y - 3, 2.6, "#efe6ff", "#5b3fb0"); }
        ctx.restore();
        ctx = keep;
      });
      ctx.drawImage(img, 0, 0, W, H);
      /* 자외선 — 오존층에서 막히거나 땅까지 내려온다 */
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      var RAYS = [[40, 40], [90, 120], [150, 70], [220, 150], [280, 60], [330, 130]];
      RAYS.forEach(function (rp, k) {
        var pass = (k + 0.5) / RAYS.length <= tr, ground = rp[0] < XC ? gz(rp[0]) : SZ;
        var top = I.P(rp[0], rp[1], 330), sl = I.P(rp[0], rp[1], OZ + th), bt = I.P(rp[0], rp[1], ground), stop = pass ? bt : sl;
        K.line(ctx, top, stop, "rgba(225,60,180,.28)", 2);
        for (var p2 = 0; p2 < 2; p2++) {
          var u = (tt * .5 + p2 / 2 + k * .17) % 1, yy = lerp(top.y, bt.y, u);
          if (yy > stop.y) { if (!pass && yy < stop.y + 30) { ctx.globalAlpha = 1 - (yy - stop.y) / 30; K.glow(ctx, stop.x, stop.y, 3, "rgba(255,170,240,.95)", 4); ctx.globalAlpha = 1; } continue; }
          ctx.strokeStyle = "#d6249f"; ctx.lineWidth = 2.6; ctx.beginPath();
          for (var z = 0; z <= 12; z++) { var zy = yy - 24 + z * 2, zx = top.x + Math.sin(z * 1.4) * 4; if (z) ctx.lineTo(zx, zy); else ctx.moveTo(zx, zy); }
          ctx.stroke();
        }
      });
      ctx.restore();
      var box = [0, LW];
      K.sun(ctx, 40, 150, 10); K.planet(ctx, 40, 150, 10, "#ffe27a", "#f08c1e");
      K.pill(ctx, "☀️ 태양 자외선", 62, 155, { s: 12, c: "#ffb3ea", box: box });
      I.label(ctx, BL, BD * .5, OZ + th / 2, "오존층 O₃ · 두께 " + o.rel.toFixed(0), 40, -10, "#e0d4ff", box);
      I.label(ctx, 60, BD, gz(60) - 6, green ? "육지 — 생물이 살 수 있다" : "육지 — 자외선에 그대로 노출", -30, 46, green ? "#c8f5b0" : "#ffd0a8", box);
      I.label(ctx, 290, BD, 30, "바닷속은 물이 자외선을 막는다", 30, 40, "#bfe6ff", box);
      K.bigText(ctx, "자외선 " + (tr * 100).toFixed(1) + "% 통과", 18, 50, 28, green ? "#7ef0b8" : (tr > .3 ? "#ff9a8a" : "#ffd35a"));
      K.bigText(ctx, green ? "육지가 안전해졌다" : (tr > .3 ? "육지는 아직 죽음의 땅" : "아직 위험하다"), 18, 84, 18, "#ffffff");
      K.warn(ctx, LW - 12, 30, "⚠ 오존층 높이·두께는 과장", "right");

      /* ── 오른쪽 : 흰 판정 카드 ── */
      var RX = LW + 10, px0 = RX + 18, px1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "지표에 닿는 자외선");
      var tcol = green ? LT.green : (tr > 0.3 ? LT.red : LT.yellow);
      K.t(ctx, (tr * 100).toFixed(1) + " %", px0, 70, { s: 30, w: "900", c: tcol });
      var bx = px0, bw = px1 - px0, f = clamp((Math.log(Math.max(tr * 100, 0.1)) / Math.LN10 + 1) / 3, 0, 1);
      K.bar(ctx, bx, 86, bw, f, tcol);
      [[1, "1%"], [30, "30%"]].forEach(function (m) {
        var mx = bx + bw * (Math.log(m[0]) / Math.LN10 + 1) / 3;
        K.line(ctx, { x: mx, y: 80 }, { x: mx, y: 102 }, LT.ink, 1.5, [3, 2]);
        K.t(ctx, m[1], mx, 116, { s: 10.5, a: "center", w: "800", c: LT.mute });
      });
      K.t(ctx, "0.1%", bx, 116, { s: 10, c: LT.dim }); K.t(ctx, "100%", bx + bw, 116, { s: 10, a: "right", c: LT.dim });
      K.row(ctx, "대기 산소 농도", pct.toFixed(1) + " %", px0, px1, 150, LT.blue);
      K.row(ctx, "오존층 두께 (오늘 = 100)", o.rel.toFixed(0), px0, px1, 176, LT.violet);
      K.t(ctx, "O₂ + 자외선 → O + O", px0, 214, { s: 13, w: "900", c: LT.violet });
      K.t(ctx, "O + O₂ → O₃ (오존)", px0, 238, { s: 13, w: "900", c: LT.violet });
      twrap(ctx, "산소가 많을수록 오존이 많이 생기고, 오존층이 두꺼울수록 자외선이 더 많이 막힌다.", px0, 270, bw, 18, { s: 11.5, c: LT.mute });
      K.tip(ctx, green ? "1% 아래 — 육상 생물 가능" : "1% 아래로 내려가야 육상 진출", px0 - 4, H - 50, bw + 8, green);
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
    var T = 0, got = window.sthState("c2") || { a: false, b: false, c: false }, mv = null, cache = stash(canvas, W, H);
    var RW0 = K.rng(17), DROPS = [];
    for (var dq = 0; dq < 40; dq++) DROPS.push([RW0(), RW0()]);

    /* 블록 모형: 왼쪽 위 = 산과 빙하가 있는 육지, 오른쪽 아래 = 바다. 앞면 = 땅속(지하수)과 바닷물 단면 */
    var I = K.iso({ ox: 262, oy: 246, s: 0.6, L: 460, D: 190 }), BL = I.L, BD = I.D, XC = 236, SL = 56;
    function zOf(x, y) {
      var m = 150 * Math.exp(-(Math.pow(x - 80, 2) / (2 * 62 * 62) + Math.pow(y - 92, 2) / (2 * 70 * 70)));
      var land = 46 + m + 6 * Math.sin(x / 17) * Math.cos(y / 23);
      var t = clamp((x - XC + 30) / 60, 0, 1);
      return lerp(land, 18 + 3 * Math.sin(x / 31 + y / 19), t * t * (3 - 2 * t));
    }
    function paint() {
      var w = water(T), sc = w.sc, ice = w.ice, tt = mv ? mv.t : 0, snow = T < 0, LW = 640, i, k;
      var snowline = 210 - ice * 175, seaIce = clamp((ice - .55) / .45, 0, 1);
      ctx.clearRect(0, 0, W, H);
      var img = cache(T, function (c) {
        var keep = ctx; ctx = c;
        K.studio(ctx, 0, 0, LW, H, { x: I.P(BL, BD, 0).x - 150, y: I.P(BL, BD, 0).y - 16, rx: 330, ry: 48 });
        ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
        /* 땅속 단면 + 지하수 띠 */
        ["front", "right"].forEach(function (side) {
          var zf = side === "front" ? function (u) { return zOf(u, BD); } : function (u) { return zOf(BL, u); };
          I.face(ctx, side, function (Lw) {
            ctx.save(); I.profile(ctx, side, zf, 0); ctx.clip();
            var g = ctx.createLinearGradient(0, 0, 0, 180); g.addColorStop(0, "#4a3a2c"); g.addColorStop(1, "#9a7a56");
            ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, 200);
            ctx.strokeStyle = "rgba(40,25,10,.22)"; ctx.lineWidth = 1; for (var y = 8; y < 180; y += 13) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(Lw, y + 3); ctx.stroke(); }
            if (side === "front") { ctx.fillStyle = "rgba(70,150,230," + (.42 * (1 - ice * .6)).toFixed(2) + ")"; ctx.fillRect(0, 10, XC + 20, 22); }
            ctx.restore();
          });
        });
        I.field(ctx, zOf, function (x, y, z, lt) {
          if (z > snowline && x < XC + 10) return K.tint(z > snowline + 14 ? "#f6f9fd" : "#dde9f6", lt);
          if (x < XC - 18) return K.tint(z > 150 ? "#8a8a7a" : (ice > .9 ? "#9a9a8a" : "#6a9e4c"), lt);
          return K.tint(z > SL - 2 ? "#d8c08a" : "#8e7b63", lt);
        }, 46, 19, function (c2, x0, y0, x1, y1, zMax, zMin) {
          if (SL > zMin + 0.4) {
            var a = I.P(x0, y0, SL), b = I.P(x1, y0, SL), cc = I.P(x1, y1, SL), d = I.P(x0, y1, SL), depth = SL - zMin;
            var frozen = x0 >= XC - 6 && (x0 - XC) / (BL - XC) < seaIce;
            c2.beginPath(); c2.moveTo(a.x, a.y); c2.lineTo(b.x, b.y); c2.lineTo(cc.x, cc.y); c2.lineTo(d.x, d.y); c2.closePath();
            c2.fillStyle = frozen ? "rgba(236,244,252,.96)" : "rgba(" + Math.round(70 - depth * .4) + "," + Math.round(160 - depth * .6) + ",225," + Math.min(.82, .35 + depth / 70).toFixed(2) + ")"; c2.fill();
          }
        });
        I.water(ctx, SL, function (u, side) { return side === "front" ? zOf(u, BD) : zOf(BL, u); }, { surface: false });
        I.shade(ctx, "front", function (u) { return Math.max(zOf(u, BD), SL); });
        I.shade(ctx, "right", function (u) { return Math.max(zOf(BL, u), SL); });
        I.edges(ctx, SL, SL);
        if (ice < .999) {                                  /* 강: 산에서 바다로 */
          ctx.strokeStyle = "rgba(60,150,235,.9)"; ctx.lineWidth = 2.6; ctx.lineCap = "round"; ctx.beginPath();
          for (var x = 110; x <= XC + 8; x += 6) { var y = 128 + 14 * Math.sin(x / 26), p = I.P(x, y, zOf(x, y) + 1); if (x === 110) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
          ctx.stroke(); ctx.lineCap = "butt";
        }
        if (ice < .9) [[150, 40], [180, 160], [200, 60], [160, 120], [30, 175], [200, 175]].forEach(function (t2, k2) { var z2 = zOf(t2[0], t2[1]); if (z2 < snowline - 6) I.tree(ctx, t2[0], t2[1], z2, .85 + (k2 % 3) * .12); });
        /* 구름 — 순환이 셀수록 커진다 */
        var cs = clamp(.55 + .4 * sc, .5, 1.3), cc0 = I.P(250, 70, 250);
        ctx.save(); ctx.shadowColor = "rgba(20,30,60,.2)"; ctx.shadowBlur = 8;
        [[-60, 8, 24], [-30, -8, 32], [6, -14, 38], [42, -4, 30], [70, 8, 22], [0, 12, 34], [-36, 14, 26], [34, 14, 26]].forEach(function (q) {
          var px = cc0.x + q[0] * cs, py = cc0.y + q[1] * cs, r = q[2] * cs;
          var g2 = ctx.createRadialGradient(px - r * .35, py - r * .4, r * .1, px, py, r);
          g2.addColorStop(0, "#ffffff"); g2.addColorStop(1, ice > .9 ? "#b8c2d0" : "#cfd8e6");
          ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(px, py, r, 0, 6.2832); ctx.fill();
        });
        ctx.restore();
        ctx.restore();
        ctx = keep;
      });
      ctx.drawImage(img, 0, 0, W, H);
      /* 움직이는 것: 비(눈) · 증발 */
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      var nr = Math.round(clamp(sc, 0, 1.8) / 1.8 * 34);
      for (var r = 0; r < nr; r++) {
        var land = r % 3 === 0, wx = land ? 150 + DROPS[r][0] * 70 : 250 + DROPS[r][0] * 90, wy = 40 + DROPS[r][1] * 80;
        var gz = land ? zOf(wx, wy) : SL, u = (tt * (snow ? .22 : .8) + DROPS[r][1]) % 1, zz = lerp(232, gz, u), p = I.P(wx, wy, zz);
        if (snow) { ctx.fillStyle = "rgba(255,255,255,.95)"; ctx.beginPath(); ctx.arc(p.x + Math.sin(tt * 2 + r) * 3, p.y, 2.2, 0, 6.2832); ctx.fill(); }
        else { ctx.strokeStyle = "rgba(40,120,220,.75)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 1, p.y + 8); ctx.stroke(); }
      }
      if (sc > .08 && seaIce < .99) for (k = 0; k < 4; k++) {
        var ex = 300 + k * 44, ey = 150 - k * 30, a = I.P(ex, ey, SL + 4), b = I.P(250 + k * 14, 66, 226);
        ctx.save(); ctx.globalAlpha = .35 + .2 * clamp(sc, 0, 2); ctx.strokeStyle = "#1c7ed6"; ctx.lineWidth = 1.6; ctx.setLineDash([4, 5]); ctx.lineDashOffset = -tt * 20;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(a.x + 14, (a.y + b.y) / 2, b.x, b.y); ctx.stroke(); ctx.restore();
      }
      ctx.restore();
      var box = [0, LW];
      K.pill(ctx, "기권 · 수증기·구름 " + num(12.9 * sc, 1) + " 천 km³", I.P(250, 70, 250).x + 70, I.P(250, 70, 250).y - 40, { s: 12, c: "#e8ecff", box: box });
      if (ice > .02) I.label(ctx, 80, 92, zOf(80, 92), "수권 · 빙하 " + num(224000 * ice, 0) + " 천 km³", -60, -50, "#e0ecff", box);
      if (sc > .08 && seaIce < .99) K.pill(ctx, "🔼 증발", I.P(380, 110, SL + 60).x + 18, I.P(380, 110, SL + 60).y, { s: 12, c: "#bfe6ff", box: box });
      I.label(ctx, 120, BD, 20, "수권 · 지하수 " + num(23576 * clamp(1 - ice, 0.02, 1), 0) + " 천 km³", -40, 44, "#bfe6ff", box);
      I.label(ctx, 380, BD, 36, "수권 · 해양 " + num(1338000 - 224000 * ice + 24064, 0) + " 천 km³", 30, 44, "#bfe6ff", box);
      K.bigText(ctx, ice >= .999 ? "물의 순환이 멎었다" : (ice <= .001 ? "얼음이 모두 녹았다" : "기온 " + T + " ℃의 지구"), 18, 50, 28, ice >= .999 ? "#cfe6ff" : (ice <= .001 ? "#ffd35a" : "#ffffff"));
      K.bigText(ctx, "순환 세기 " + Math.round(sc * 100) + "% · 얼음 " + Math.round(ice * 100) + "%", 18, 84, 18, "#ffd35a");
      K.warn(ctx, LW - 12, 30, "⚠ 높이·두께는 과장", "right");

      /* ── 오른쪽 : 흰 판정 카드 — 흐름의 양 ── */
      var RX = LW + 10, px0 = RX + 16, px1 = W - 16, bw = px1 - px0;
      K.card(ctx, RX, 0, W - RX, H, "물의 흐름 (km³/년)");
      [["🔼 해양 증발", 413000 * sc, LT.blue], ["🔽 해양 강수", 373000 * sc, LT.teal], ["🔽 육지 강수", 113000 * sc, LT.green], ["➡️ 하천·지하수 유출", 40000 * sc, LT.orange]].forEach(function (f, i2) {
        var y = 58 + i2 * 46;
        K.row(ctx, f[0], num(f[1]), px0, px1, y, f[2]);
        K.bar(ctx, px0, y + 9, bw, f[1] / 600000, f[2]);
      });
      K.row(ctx, "얼음이 덮은 넓이", Math.round(ice * 100) + " %", px0, px1, 260, LT.violet);
      K.bar(ctx, px0, 269, bw, ice, LT.violet);
      K.row(ctx, "물의 순환 세기 (지금 = 100)", Math.round(sc * 100) + " %", px0, px1, 306, LT.blue);
      K.bar(ctx, px0, 315, bw, sc / 2.5, LT.blue);
      twrap(ctx, "지구 전체 물의 양은 늘 같다 — 머무는 자리만 바뀐다.", px0, 354, bw, 18, { s: 11.5, w: "800", c: LT.ink });
      K.tip(ctx, ice >= .999 ? "증발·비가 멎음 → 풍화도 멎음" : (ice <= .001 ? "비가 많아져 풍화가 빨라짐" : "빙하와 바다가 함께 있다"), px0 - 4, H - 50, bw + 8, ice >= .999 ? false : (ice <= .001 ? true : null));
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
    var V = 1, k = 1, got = window.sthState("c3") || { a: false, b: false }, okQ = !!window.sthState("c3q"), mv = null, cache = stash(canvas, W, H);
    var RC = K.rng(23), MOL = [];
    for (var mq = 0; mq < 40; mq++) MOL.push([RC(), RC()]);

    /* 블록 모형: 왼쪽 위 = 숲과 화산이 있는 육지, 오른쪽 아래 = 바다. 앞면 = 땅속(마그마 방)과 바다 밑 석회암 */
    var I = K.iso({ ox: 262, oy: 262, s: 0.6, L: 460, D: 180 }), BL = I.L, BD = I.D, XC = 300, SL = 58, VX = 205, VY = 140;
    function zOf(x, y) {
      var land = 62 + 7 * Math.sin(x / 21) * Math.cos(y / 27) + 92 * Math.exp(-(Math.pow(x - VX, 2) + Math.pow(y - VY, 2)) / (2 * 26 * 26));
      var t = clamp((x - XC + 24) / 48, 0, 1);
      return lerp(land, 22, t * t * (3 - 2 * t));
    }
    function paint() {
      var r = carbon(V, k), P = r.P, T = r.T, tt = mv ? mv.t : 0, LW = 630, i;
      var wRate = Math.pow(2, 0.7213 * r.x) * k;       // = V (정상 상태)
      var frozen = T <= 0, hot = T >= 28;
      ctx.clearRect(0, 0, W, H);
      var img = cache(V + "/" + k, function (c) {
        var keep = ctx; ctx = c;
        K.studio(ctx, 0, 0, LW, H, { x: I.P(BL, BD, 0).x - 150, y: I.P(BL, BD, 0).y - 16, rx: 320, ry: 46 });
        ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
        if (hot) { var hz = ctx.createRadialGradient(300, 120, 20, 300, 120, 420); hz.addColorStop(0, "rgba(255,150,70,.28)"); hz.addColorStop(1, "rgba(255,150,70,0)"); ctx.fillStyle = hz; ctx.fillRect(0, 0, LW, H); }
        ["front", "right"].forEach(function (side) {
          var zf = side === "front" ? function (u) { return zOf(u, BD); } : function (u) { return zOf(BL, u); };
          I.face(ctx, side, function (Lw) {
            ctx.save(); I.profile(ctx, side, zf, 0); ctx.clip();
            var g = ctx.createLinearGradient(0, 0, 0, 160); g.addColorStop(0, "#3e342c"); g.addColorStop(1, "#7a6450");
            ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, 200);
            ctx.strokeStyle = "rgba(30,20,10,.25)"; ctx.lineWidth = 1; for (var y = 8; y < 160; y += 12) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(Lw, y + 2); ctx.stroke(); }
            /* 바다 밑 석회암(탄산염) 층 */
            var x0 = side === "front" ? XC - 10 : 0;
            ctx.fillStyle = "#e6dcc2"; ctx.fillRect(x0, 8, Lw, 12);
            ctx.strokeStyle = "rgba(150,120,80,.5)"; ctx.lineWidth = .8; for (var y2 = 10; y2 < 20; y2 += 3) { ctx.beginPath(); ctx.moveTo(x0, y2); ctx.lineTo(Lw, y2); ctx.stroke(); }
            if (side === "front") {                    /* 화산 밑 마그마 방과 통로 */
              var mg = ctx.createRadialGradient(VX, 26, 2, VX, 26, 42); mg.addColorStop(0, "rgba(255,220,120,1)"); mg.addColorStop(.5, "rgba(255,100,40,.85)"); mg.addColorStop(1, "rgba(255,80,30,0)");
              ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(VX, 26, 46, 16, 0, 0, 6.2832); ctx.fill();
              ctx.strokeStyle = "rgba(255,120,50,.85)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(VX, 36); ctx.lineTo(VX - 8, zOf(VX, BD) - 2); ctx.stroke();
            }
            ctx.restore();
          });
        });
        I.field(ctx, zOf, function (x, y, z, lt) {
          if (x > XC + 20 || z < SL - 1) return K.tint("#8e7b63", lt);
          if (frozen) return K.tint(z > 120 ? "#8a7f78" : "#eef4fb", lt);
          var d2 = Math.pow(x - VX, 2) + Math.pow(y - VY, 2);
          if (d2 < 34 * 34) return K.tint(z > 125 ? "#5a4438" : "#7a5e4a", lt);
          if (z < SL + 4) return K.tint("#d8c08a", lt);
          return K.tint(hot ? "#b89a62" : "#6a9e4c", lt);
        }, 46, 18, function (c2, x0, y0, x1, y1, zMax, zMin) {
          if (SL > zMin + 0.4) {
            var a = I.P(x0, y0, SL), b = I.P(x1, y0, SL), cc = I.P(x1, y1, SL), d = I.P(x0, y1, SL), depth = SL - zMin;
            c2.beginPath(); c2.moveTo(a.x, a.y); c2.lineTo(b.x, b.y); c2.lineTo(cc.x, cc.y); c2.lineTo(d.x, d.y); c2.closePath();
            c2.fillStyle = frozen && x0 < XC + 80 ? "rgba(236,244,252,.95)" : "rgba(" + Math.round(70 - depth * .4) + "," + Math.round(160 - depth * .6) + ",225," + Math.min(.82, .35 + depth / 70).toFixed(2) + ")"; c2.fill();
          }
        });
        I.water(ctx, SL, function (u, side) { return side === "front" ? zOf(u, BD) : zOf(BL, u); }, { surface: false });
        I.shade(ctx, "front", function (u) { return Math.max(zOf(u, BD), SL); });
        I.shade(ctx, "right", function (u) { return Math.max(zOf(BL, u), SL); });
        I.edges(ctx, SL, SL);
        if (!frozen) [[30, 30], [60, 70], [95, 40], [40, 120], [80, 150], [120, 100], [20, 165], [130, 160], [110, 20]].forEach(function (t2, k2) { I.tree(ctx, t2[0], t2[1], zOf(t2[0], t2[1]), (hot ? .7 : .95) + (k2 % 3) * .12); });
        var cp = I.P(VX, VY, zOf(VX, VY)); K.glow(ctx, cp.x, cp.y - 2, 4, "rgba(255,150,70,.95)", 3.4);
        ctx.restore();
        ctx = keep;
      });
      ctx.drawImage(img, 0, 0, W, H);
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      /* 대기 CO₂ 분자 — 많을수록 촘촘하다 */
      var nm = Math.round(clamp(4 + 6 * r.x, 2, 28));
      for (i = 0; i < nm; i++) {
        var mx = 120 + MOL[i][0] * 480 + Math.sin(tt * .5 + i) * 5, my = 104 + MOL[i][1] * 90 + Math.cos(tt * .4 + i) * 3;
        K.planet(ctx, mx - 6, my, 3.6, "#ff9a8a", "#a8261a"); K.planet(ctx, mx + 6, my, 3.6, "#ff9a8a", "#a8261a"); K.planet(ctx, mx, my, 4, "#9aa0aa", "#2a2e36");
      }
      /* 화산 탈가스 */
      var cp2 = I.P(VX, VY, zOf(VX, VY)), vw = clamp(2 + 2.2 * V, 2, 14);
      for (i = 0; i < 6; i++) {
        var u = ((tt * .25 + i / 6) % 1 + 1) % 1;
        ctx.fillStyle = "rgba(120,110,105," + (.5 * (1 - u)).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(cp2.x + u * 30, cp2.y - 8 - u * 80, (4 + u * 12) * (.6 + vw / 14), 0, 6.283); ctx.fill();
      }
      ctx.save(); ctx.globalAlpha = .85; K.arrow(ctx, { x: cp2.x - 14, y: cp2.y - 14 }, { x: cp2.x - 14, y: cp2.y - 96 }, LT.red, vw, 10 + vw * .7); ctx.restore();
      /* 풍화: 땅에 내리는 비 → 강 → 바다 → 석회암 */
      var ww = clamp(2 + 2.2 * wRate, 2, 14), nr = Math.round(clamp(wRate, 0, 10) * 3 + 3);
      for (i = 0; i < nr; i++) {
        var wx = 215 + MOL[i % 40][0] * 70, wy = 8 + MOL[i % 40][1] * 60, uu = (tt * (frozen ? .2 : .8) + MOL[i % 40][1]) % 1, pz = lerp(230, zOf(wx, wy), uu), pp = I.P(wx, wy, pz);
        if (frozen) { ctx.fillStyle = "rgba(255,255,255,.95)"; ctx.beginPath(); ctx.arc(pp.x, pp.y, 2, 0, 6.283); ctx.fill(); }
        else { ctx.strokeStyle = "rgba(40,120,220,.7)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(pp.x, pp.y); ctx.lineTo(pp.x - 1, pp.y + 8); ctx.stroke(); }
      }
      var wa = I.P(330, 120, 66), wb = I.P(330, BD, 14);
      ctx.save(); ctx.globalAlpha = .9; K.arrow(ctx, I.P(255, 30, 230), I.P(255, 30, 92), LT.green, ww, 10 + ww * .7);
      K.arrow(ctx, I.P(262, 46, 70), I.P(330, 80, 60), LT.green, Math.max(2, ww * .6), 10); ctx.restore();
      I.face(ctx, "front", function () {
        ctx.strokeStyle = "rgba(15,159,118,.9)"; ctx.lineWidth = 3; ctx.setLineDash([5, 4]); ctx.lineDashOffset = tt * 12;
        ctx.beginPath(); ctx.moveTo(340, SL - 6); ctx.lineTo(340, 24); ctx.stroke(); ctx.setLineDash([]);
      });
      ctx.restore();
      var box = [0, LW];
      K.pill(ctx, "🌋 화산 탈가스 · " + V.toFixed(2) + "배", cp2.x - 26, cp2.y - 60, { a: "right", s: 12, c: "#ffc8b0", box: box });
      K.pill(ctx, "🌧 규산염 풍화 · " + wRate.toFixed(2) + "배", I.P(255, 30, 230).x + 14, I.P(255, 30, 230).y + 4, { s: 12, c: "#b8f0d0", box: box });
      I.label(ctx, 60, 70, zOf(60, 70) + 8, "생물권 · 숲 (빠른 순환)", -50, 80, "#c8f5b0", box);
      I.label(ctx, 420, 100, SL, "수권 · 해양", 40, -30, "#bfe6ff", box);
      I.label(ctx, 400, BD, 14, "지권 · 석회암으로 묻힘", 60, 6, "#fff1cf", box);
      K.pill(ctx, "기권 · 대기 CO₂", LW - 14, 74, { a: "right", s: 12, c: "#ffd0c0", box: box });
      K.bigText(ctx, Math.round(P) + " ppm · " + (T >= 0 ? "+" : "") + T.toFixed(1) + " ℃", 18, 50, 28, frozen ? "#cfe6ff" : (hot ? "#ff9a8a" : "#7ef0b8"));
      K.bigText(ctx, frozen ? "얼어붙기 직전 — 너무 적은 CO₂" : (hot ? "온실 지구 — 그래도 끝없이 오르진 않는다" : "화산 = 풍화, 균형이 잡혔다"), 18, 84, 17, "#ffffff");
      K.warn(ctx, LW - 12, 30, "⚠ 크기·높이는 과장", "right");

      /* ── 오른쪽 : 흰 판정 카드 ── */
      var RX = LW + 10, px0 = RX + 16, px1 = W - 16, bw = px1 - px0;
      K.card(ctx, RX, 0, W - RX, H, "균형이 잡힌 뒤의 상태");
      K.row(ctx, "대기 CO₂", Math.round(P) + " ppm", px0, px1, 60, LT.orange);
      K.row(ctx, "평균 기온", (T >= 0 ? "+" : "") + T.toFixed(1) + " ℃", px0, px1, 88, frozen ? LT.blue : (hot ? LT.red : LT.green));
      K.row(ctx, "🌋 화산이 내보냄", V.toFixed(2) + "배", px0, px1, 126, LT.red);
      K.bar(ctx, px0, 135, bw, V / 10, LT.red);
      K.row(ctx, "🌧 풍화가 치워 냄", wRate.toFixed(2) + "배", px0, px1, 172, LT.green);
      K.bar(ctx, px0, 181, bw, wRate / 10, LT.green);
      K.row(ctx, "풍화 조건(땅·기후)", k.toFixed(1) + "배", px0, px1, 218, LT.mute);
      K.t(ctx, "탄소 저장고 (Gt C)", px0, 256, { s: 12, w: "800", c: LT.mute });
      K.row(ctx, "생물권 · 숲과 토양", "약 2,300", px0, px1, 280, LT.green);
      K.row(ctx, "수권 · 해양", "약 38,000", px0, px1, 304, LT.blue);
      K.row(ctx, "지권 · 석회암·화석 연료", "약 6,000만", px0, px1, 328, LT.orange);
      twrap(ctx, "화산이 내보낸 만큼을 풍화가 치워 낼 때 균형이 잡힌다.", px0, 364, bw, 18, { s: 11.5, w: "800", c: LT.ink });
      K.tip(ctx, frozen ? "0 ℃ 아래 — 얼음이 퍼질 위험" : (hot ? "28 ℃ 이상 — 온실 상태" : "지금 지구와 비슷한 균형"), px0 - 4, H - 50, bw + 8, frozen ? false : (hot ? false : true));
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

    /* ── 위: 얼음에 덮인 바다를 블록으로 잘라 낸 모형(아이소메트릭) · 아래: CO₂·기온 그래프 ──
       x 오른쪽 아래, y 왼쪽 아래, z 위(그림 단위). 두께·높이는 보기 쉽게 과장했다. */
    var DH = 400, mv = null;
    var I = K.iso({ ox: 440, oy: 116, s: 0.68, L: 560, D: 220 });
    var BL = I.L, BD = I.D, BED = 34, SL = 112;          /* 빙하 퇴적층 꼭대기 · 해수면 */
    var VX = 330, VY = 80;                                 /* 얼음을 뚫은 화산 자리 */
    var FR = (function () { var R = K.rng(23), a = []; for (var i = 0; i < 40; i++) a.push(R()); return a; })();
    function state(sim, cur) {
      var T = sim.T[cur], esc = sim.esc !== null && sim.t[cur] >= sim.esc;
      var melt = esc ? clamp((T + 15) / 4 + 0.25, 0, 1) : 0;                 /* 문턱을 넘으면 얼음이 깨지며 녹는다 */
      var th = esc ? 30 * (1 - melt) : lerp(38, 26, clamp((T + 50) / 35, 0, 1));
      return { T: T, P: sim.P[cur], t: sim.t[cur], esc: esc, melt: melt, th: th };
    }
    function drawModel(sim, upto, n, S) {
      var ph = mv ? mv.t : 0, box = [0, W];
      var dbl = Math.max(0, Math.log(S.P / 280) / Math.LN2);                 /* CO₂ 가 몇 번 두 배가 됐나 */
      var cap = 10 * S.melt, bedTop = BED + cap, bot = SL - S.th * .8, tp = SL + S.th * .2;
      K.studio(ctx, 0, 0, W, DH, { x: I.P(BL, BD, 0).x - 150, y: I.P(BL, BD, 0).y - 20, rx: 320, ry: 48 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, DH, 14); ctx.clip();
      /* 대기: CO₂가 쌓일수록 주황빛 */
      var ha = clamp(dbl / 11, 0, 1) * .42, hz = ctx.createRadialGradient(600, 110, 20, 600, 110, 430);
      hz.addColorStop(0, "rgba(255,140,60," + ha.toFixed(3) + ")"); hz.addColorStop(1, "rgba(255,140,60,0)");
      ctx.fillStyle = hz; ctx.fillRect(0, 0, W, DH);
      /* 앞면·오른쪽 면: 기반암 · 빙하 퇴적층 · (녹은 뒤) 덮개 탄산염 · 바닷물 */
      ["front", "right"].forEach(function (side) {
        I.face(ctx, side, function (Lw) {
          ctx.fillStyle = "#3b332e"; ctx.fillRect(0, 0, Lw, 14);
          ctx.fillStyle = "#7a736c"; ctx.fillRect(0, 14, Lw, BED - 14);
          var R = K.rng(side === "front" ? 11 : 13);
          for (var i = 0; i < Lw / 4; i++) {
            var r = .8 + R() * 2.6; ctx.fillStyle = R() > .5 ? "#bdb5aa" : "#4d4640";
            ctx.beginPath(); ctx.ellipse(R() * Lw, 16 + R() * (BED - 19), r * 1.5, r, 0, 0, 6.283); ctx.fill();
          }
          if (cap > .4) {
            ctx.fillStyle = "#eadcbd"; ctx.fillRect(0, BED, Lw, cap);
            ctx.strokeStyle = "rgba(150,115,70,.45)"; ctx.lineWidth = .8;
            for (var c = BED + 2.5; c < bedTop; c += 3) { ctx.beginPath(); ctx.moveTo(0, c); ctx.lineTo(Lw, c); ctx.stroke(); }
          }
          var wg = ctx.createLinearGradient(0, bedTop, 0, SL);
          wg.addColorStop(0, "#0c2f66"); wg.addColorStop(1, S.melt > .5 ? "#2f8fe0" : "#2766ad");
          ctx.fillStyle = wg; ctx.fillRect(0, bedTop, Lw, SL - bedTop);
          ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, SL); ctx.lineTo(Lw, SL); ctx.stroke();
        });
        I.shade(ctx, side, function () { return SL; });
      });
      /* 수면 → 얼음 조각(먼 칸부터) */
      I.plane(ctx, SL, "rgba(48,128,205,.95)", "rgba(255,255,255,.6)");
      if (S.melt > 0) {
        ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.lineWidth = 1;
        for (var w = 0; w < 10; w++) {
          var gx = ((w * .37 + ph * .04) % 1) * BL, gy = ((w * .61) % 1) * BD, a1 = I.P(gx - 14, gy, SL), a2 = I.P(gx + 10, gy, SL);
          ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.quadraticCurveTo((a1.x + a2.x) / 2, a1.y - 3, a2.x, a2.y); ctx.stroke();
        }
      }
      var nx = 8, ny = 4, dx = BL / nx, dy = BD / ny, gap = S.melt > 0 ? 3 + 7 * S.melt : 0;
      if (S.th > .5) {
        for (var s0 = 0; s0 <= nx + ny - 2; s0++) {
          for (var i = Math.max(0, s0 - ny + 1); i <= Math.min(nx - 1, s0); i++) {
            var j = s0 - i;
            if (FR[i * ny + j] < S.melt) continue;
            var edge = j === ny - 1 || i === nx - 1;
            I.box(ctx, i * dx + gap, j * dy + gap, edge ? bot : SL, (i + 1) * dx - gap, (j + 1) * dy - gap, tp, "#f3f8ff", "#cfe2f4", "#a6c1db");
          }
        }
      }
      /* 얼음을 뚫은 화산과 연기 */
      var vb = I.P(VX, VY, Math.max(SL, tp)), vh = 58, vw = 44;
      ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.beginPath(); ctx.ellipse(vb.x, vb.y, vw + 4, (vw + 4) * .36, 0, 0, 6.283); ctx.fill();
      var vg = ctx.createLinearGradient(vb.x - vw, 0, vb.x + vw, 0);
      vg.addColorStop(0, "#6b4b3b"); vg.addColorStop(.5, "#493227"); vg.addColorStop(1, "#2b1d17");
      ctx.fillStyle = vg; ctx.beginPath(); ctx.moveTo(vb.x - vw, vb.y);
      ctx.quadraticCurveTo(vb.x - 14, vb.y - vh * .45, vb.x - 9, vb.y - vh); ctx.lineTo(vb.x + 9, vb.y - vh);
      ctx.quadraticCurveTo(vb.x + 14, vb.y - vh * .45, vb.x + vw, vb.y); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.strokeStyle = "#ff7a2e"; ctx.shadowColor = "#ff7a2e"; ctx.shadowBlur = 8; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(vb.x + 2, vb.y - vh + 2); ctx.quadraticCurveTo(vb.x + 8, vb.y - vh * .5, vb.x + 4, vb.y - vh * .15); ctx.stroke(); ctx.restore();
      K.glow(ctx, vb.x, vb.y - vh, 6, "rgba(255,120,50,.95)", 3);
      for (var k = 0; k < 8; k++) {
        var u = ((ph * .22 + k / 8) % 1 + 1) % 1, pr = 6 + u * 17;
        ctx.fillStyle = "rgba(115,108,104," + (.55 * (1 - u)).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(vb.x + u * 64 + Math.sin(ph * 1.3 + k) * 5, vb.y - vh - 8 - u * 92, pr, 0, 6.283); ctx.fill();
      }
      /* 대기에 쌓이는 CO₂ 알갱이: 두 배가 될 때마다 늘어난다 */
      var R2 = K.rng(57), nd = Math.round(3 + dbl * 2.4);
      for (var d = 0; d < nd; d++) {
        var bx = 360 + ((R2() * 520 + ph * (6 + R2() * 8)) % 520), by = 22 + R2() * 70 + Math.sin(ph + d) * 4;
        K.glow(ctx, bx, by, 2.6, "rgba(255,130,50,.95)", 3);
      }
      ctx.restore();
      /* 이름표 */
      K.pill(ctx, "🌋 얼음을 뚫고 CO₂를 내뿜는 화산", vb.x + 40, vb.y - vh + 18, { s: 12, c: "#ffd2b0", box: box });
      if (S.th > .5) I.label(ctx, 60, BD, tp, S.esc ? "깨지며 녹는 얼음" : "바다를 덮은 얼음", -40, -6, "#e8f4ff", box);
      else I.label(ctx, 60, BD, SL, "다시 열린 바다", -40, -6, "#bfe6ff", box);
      I.label(ctx, 120, BD, (bedTop + SL) / 2 - 8, S.th > .5 ? "얼음 아래 바닷물" : "바닷물", -50, 22, "#bfe6ff", box);
      I.label(ctx, 300, BD, 24, "빙하 퇴적층", -60, 40, "#e6e1d9", box);
      if (cap > 3) I.label(ctx, 480, BD, BED + cap / 2, "덮개 탄산염(새로 쌓이는 탄산염 암석)", 40, 38, "#fff1cf", box);
      K.pill(ctx, S.melt > .5 ? "🌧 비가 다시 내려 풍화가 빨라짐" : "🌨 비가 거의 없어 풍화가 멎음", W - 14, 60, { a: "right", s: 12, c: S.melt > .5 ? "#9ff0c8" : "#cfe6ff", box: box });
      K.warn(ctx, W - 14, 30, "⚠ 두께·높이는 보기 쉽게 과장", "right");
      /* 큰 글자 */
      if (upto === 0) { K.bigText(ctx, "얼음에 갇힌 지구", 22, 52, 28, "#ffffff"); K.bigText(ctx, "화산의 세기를 정하고 흘려보내세요", 22, 86, 17, "#ffd35a"); }
      else if (S.esc) { K.bigText(ctx, "얼음이 녹는다 — 탈출!", 22, 52, 28, "#ffd35a"); K.bigText(ctx, "탈출 " + sim.esc + "백만 년 · " + num(Math.round(S.P)) + " ppm", 22, 86, 17, "#ffffff"); }
      else if (upto >= n) { K.bigText(ctx, "6천만 년, 아직 얼음 속", 22, 52, 28, "#bfe6ff"); K.bigText(ctx, "CO₂ " + num(Math.round(S.P)) + " ppm · " + S.T.toFixed(1) + " ℃", 22, 86, 17, "#ffffff"); }
      else { K.bigText(ctx, "풍화는 멎고 CO₂만 쌓인다", 22, 52, 26, "#ffffff"); K.bigText(ctx, S.t.toFixed(0) + "백만 년 · " + num(Math.round(S.P)) + " ppm", 22, 86, 17, "#ffd35a"); }
    }

    function drawChart(sim, upto, n, S) {
      var Y0 = DH + 8, x0 = 72, x1 = W - 236, y0 = Y0 + 46, y1 = H - 42;
      K.studio(ctx, 0, Y0, W, H - Y0, null);
      ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      [0, 10, 20, 30, 40, 50, 60].forEach(function (g) {
        var gx = x0 + g / 60 * (x1 - x0);
        K.line(ctx, { x: gx, y: y0 }, { x: gx, y: y1 }, LT.grid, 1);
        K.t(ctx, g + "", gx, y1 + 16, { s: 10.5, c: LT.mute, a: "center", w: "600" });
      });
      [-60, -45, -30, -15, 0].forEach(function (tv) {
        var gy = y1 - (tv + 60) / 60 * (y1 - y0);
        K.line(ctx, { x: x0, y: gy }, { x: x1, y: gy }, LT.grid, 1);
        K.t(ctx, tv + "℃", x0 - 6, gy + 4, { s: 10, c: LT.blue, a: "right", w: "600" });
      });
      ctx.strokeStyle = LT.line; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      K.t(ctx, "얼어붙은 뒤 흐른 시간 (백만 년)", x1, y1 + 34, { s: 11, c: LT.mute, a: "right" });

      /* 탈출 문턱선 */
      var thrY = y1 - clamp((-15 + 60) / 60, 0, 1) * (y1 - y0);
      K.line(ctx, { x: x0, y: thrY }, { x: x1, y: thrY }, LT.yellow, 2, [6, 5]);
      lpill(ctx, "얼음이 녹기 시작하는 문턱 (−15 ℃)", x0 + 8, thrY - 10, { s: 11, c: LT.yellow });

      var pMax = Math.max(150000, sim.P[n]), pp = [], tp = [];
      for (var i = 0; i <= upto; i++) {
        var xx = x0 + i / n * (x1 - x0);
        pp.push([xx, y1 - clamp(sim.P[i] / pMax, 0, 1) * (y1 - y0)]);
        tp.push([xx, y1 - clamp((sim.T[i] + 60) / 60, 0, 1) * (y1 - y0)]);
      }
      [[pp, LT.orange], [tp, LT.blue]].forEach(function (s) {
        if (s[0].length < 2) return;
        ctx.save(); ctx.strokeStyle = s[1]; ctx.lineWidth = 3; ctx.shadowColor = s[1]; ctx.shadowBlur = 2; ctx.lineJoin = "round";
        ctx.beginPath(); s[0].forEach(function (p, k) { if (k) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); ctx.restore();
        var last = s[0][s[0].length - 1]; K.glow(ctx, last[0], last[1], 3.5, s[1], 3.5);
      });
      var lp = lpill(ctx, "● 대기 CO₂ (0 ~ " + num(Math.round(pMax)) + " ppm)", 16, Y0 + 26, { s: 12, c: LT.orange });
      lpill(ctx, "● 얼음 위 기온 (−60 ~ 0 ℃)", lp.x + lp.w + 12, Y0 + 26, { s: 12, c: LT.blue, box: [0, x1 + 20] });
      if (sim.esc !== null && upto >= Math.round(sim.esc / 0.5)) {
        var ex = x0 + sim.esc / 60 * (x1 - x0);
        K.line(ctx, { x: ex, y: y0 }, { x: ex, y: y1 }, LT.red, 1.6, [3, 4]);
        lpill(ctx, "탈출 " + sim.esc + "백만 년", clamp(ex + 8, x0, x1 - 110), y1 - 10, { s: 11, c: LT.red, box: [0, x1 + 20] });
      }
      /* 오른쪽 읽음판 */
      var rx = W - 212;
      K.card(ctx, rx - 16, Y0 + 12, 220, H - Y0 - 24, null);
      K.t(ctx, S.t.toFixed(0) + " 백만 년 뒤", rx, Y0 + 44, { s: 12, c: LT.mute });
      K.t(ctx, num(Math.round(S.P)) + " ppm", rx, Y0 + 84, { s: 22, w: "900", c: LT.orange });
      K.t(ctx, S.T.toFixed(1) + " ℃", rx, Y0 + 122, { s: 22, w: "900", c: LT.blue });
      K.t(ctx, S.esc ? "🔥 얼음이 녹는다" : "🧊 아직 눈덩이 지구", rx, Y0 + 164, { s: 15, w: "900", c: S.esc ? LT.red : LT.ink });
      K.t(ctx, S.esc ? "쌓인 CO₂가 초온실을 만든다" : "풍화가 멎어 CO₂만 쌓인다", rx, Y0 + 190, { s: 11, c: LT.mute });
    }

    function chart(sim, upto) {
      var n = sim.t.length - 1, cur = Math.min(upto, n), S = state(sim, cur);
      ctx.clearRect(0, 0, W, H);
      drawModel(sim, upto, n, S);
      drawChart(sim, upto, n, S);
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
    mv = mover(canvas, function () { canvas._redraw(); }, "화산");

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
