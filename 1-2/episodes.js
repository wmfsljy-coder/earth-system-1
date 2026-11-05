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
function num(x, d) { return x.toLocaleString(undefined, { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }

/* ---- 무대 그림 도구 (../assets/kit.js) ---- */
var K = window.sthKit, KC = K.C;
function glass(ctx, x, y, w, h, line) {
  ctx.fillStyle = "rgba(10,14,40,.62)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill();
  ctx.strokeStyle = line || "rgba(160,180,255,.22)"; ctx.lineWidth = 1; ctx.stroke();
}
function gbar(ctx, x, y, w, h, f, col) {
  ctx.fillStyle = "rgba(255,255,255,.07)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.fillStyle = col;
  ctx.beginPath(); ctx.roundRect(x, y, Math.max(h, w * clamp(f, 0, 1)), h, h / 2); ctx.fill(); ctx.restore();
}
/* 계속 도는 움직임 + ⏸ 단추 (단추는 그 장면의 controls 끝에 붙는다). st.t 는 흐른 초 */
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
/* 줌 바꿈 글 (K.t) */
function kwrap(ctx, s, x, y, maxW, lh, o) {
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
/* 판(암석층) 재질 */
function slabFill(ctx, x0, y0, x1, y1, kind) {
  var g = ctx.createLinearGradient(0, y0, 0, y1);
  if (kind === "ocean") { g.addColorStop(0, "#5f7f8a"); g.addColorStop(1, "#24363e"); }
  else { g.addColorStop(0, "#b89a74"); g.addColorStop(1, "#5a4632"); }
  return g;
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
    var lat = 0, got = window.sthState("a2") || { a: false, b: false }, cache = stash(canvas, W, H);

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 440, cx = 214, cy = 206, R = 98, I = incl(lat);
      var img = cache("g", function (c) {
        var keep = ctx; ctx = c;
        K.studio(ctx, 0, 0, LW, H, null);
        globe(ctx, cx, cy, R, { phi: .14, a0: 70, a1: 175,
          surf: function (lo, la, lt) { var ld = landAt(lo, la); return ld === 2 ? K.tint("#f2f6fb", lt) : (ld ? mixc("#6a9e4c", "#a8915a", (wob(lo, la) + 1) / 2, lt) : mixc("#2f7fd8", "#15488f", (wob(lo, la) + 1) / 2, lt)); },
          layers: [{ r: 1, c: ["#7a5a3a", "#8a6a48"] }, { r: .98, c: ["#c0603a", "#e09060"] }, { r: .546, c: ["#ffb040", "#ffd27a"] }, { r: .19, c: ["#fff6dc", "#e8d8b0"] }] });
        ctx = keep;
      });
      ctx.drawImage(img, 0, 0, W, H);
      /* 쌍극자 자기력선: r = L·R·cos²(위도) — 바깥에서는 남쪽에서 나와 북쪽으로 들어간다 */
      [1.32, 1.68, 2.08].forEach(function (L, li) {
        var l0 = Math.acos(Math.sqrt(1 / L));
        [1, -1].forEach(function (side) {
          ctx.save(); ctx.strokeStyle = "rgba(28,126,214," + (.85 - li * .15) + ")"; ctx.lineWidth = 2;
          ctx.beginPath();
          for (var k = 0; k <= 60; k++) {
            var la = -l0 + 2 * l0 * k / 60, r = L * R * Math.cos(la) * Math.cos(la);
            var x = cx + side * r * Math.cos(la), y = cy - r * Math.sin(la);
            if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
          }
          ctx.stroke(); ctx.restore();
          var ex = cx + side * L * R;
          K.arrow(ctx, { x: ex, y: cy + 7 }, { x: ex, y: cy - 7 }, LT.blue, 2.4, 9);
        });
      });
      K.line(ctx, { x: cx - R - 8, y: cy }, { x: cx + R + 8, y: cy }, "rgba(18,32,58,.45)", 1.2, [4, 4]);
      lpill(ctx, "적도 0°", 16, cy + 4, { s: 10.5, c: LT.mute });
      lpill(ctx, "N 자북극 쪽", cx, cy - R - 16, { a: "center", s: 11, c: LT.ink });
      lpill(ctx, "S", cx, cy + R + 28, { a: "center", s: 11, c: LT.ink });
      pin(ctx, { x: cx - R * .37, y: cy + 6 }, "액체 외핵의 흐름이 자기장을 만든다", -10, 150, "#ffe2a0", [0, LW]);
      /* 그 위도의 자침 */
      var th = lat * D2R, sx = cx + R * Math.cos(th), sy = cy - R * Math.sin(th);
      var tg = [-Math.sin(th), -Math.cos(th)], iw = [-Math.cos(th), Math.sin(th)], ir = I * D2R;
      var dx = Math.cos(ir) * tg[0] + Math.sin(ir) * iw[0], dy = Math.cos(ir) * tg[1] + Math.sin(ir) * iw[1];
      K.line(ctx, { x: sx - tg[0] * 52, y: sy - tg[1] * 52 }, { x: sx + tg[0] * 52, y: sy + tg[1] * 52 }, "rgba(18,32,58,.6)", 1.4, [3, 3]);
      var aH = Math.atan2(tg[1], tg[0]), aN = Math.atan2(dy, dx), dA = aN - aH;
      while (dA > Math.PI) dA -= 2 * Math.PI; while (dA < -Math.PI) dA += 2 * Math.PI;
      if (Math.abs(I) > .5) K.wedge(ctx, sx, sy, aH, aH + dA, 36, "rgba(245,159,0,.32)", LT.yellow);
      var nx = -dy, ny = dx, L1 = 32;
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,.3)"; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2;
      ctx.fillStyle = "#e03131"; ctx.beginPath(); ctx.moveTo(sx + dx * L1, sy + dy * L1); ctx.lineTo(sx + nx * 6, sy + ny * 6); ctx.lineTo(sx - nx * 6, sy - ny * 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#f4f6fa"; ctx.beginPath(); ctx.moveTo(sx - dx * L1, sy - dy * L1); ctx.lineTo(sx + nx * 6, sy + ny * 6); ctx.lineTo(sx - nx * 6, sy - ny * 6); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#12203a"; ctx.beginPath(); ctx.arc(sx, sy, 3, 0, 6.2832); ctx.fill();
      K.bigText(ctx, "복각 " + I.toFixed(1) + "°", 18, 48, 28, "#ffd35a");
      K.bigText(ctx, (lat >= 0 ? "북위 " : "남위 ") + Math.abs(lat) + "°의 자침", 18, 80, 17, "#ffffff");
      lpill(ctx, "● 빨간 끝 = 자침의 N극", LW - 14, H - 14, { a: "right", s: 10.5, c: LT.red, box: [0, LW] });
      K.warn(ctx, LW - 14, 30, "⚠ 자침·자기력선은 크게 그림", "right");

      /* ── 오른쪽 : 흰 카드 — 복각-위도 그래프 ── */
      var RX = LW + 10;
      K.card(ctx, RX, 0, W - RX, H, "위도에 따른 복각 — tan(복각) = 2 × tan(위도)");
      var gr = K.chart(ctx, { x: RX + 6, y: 44, w: W - RX - 14, h: H - 48, light: true, x0: -90, x1: 90, y0: -90, y1: 90, xt: 4, yt: 4, xl: "위도 →",
        xf: function (v0) { return Math.round(v0) + "°"; }, yf: function (v0) { return Math.round(v0) + "°"; } });
      K.line(ctx, { x: gr.L, y: gr.Y(0) }, { x: gr.R, y: gr.Y(0) }, LT.line, 1);
      K.line(ctx, { x: gr.X(0), y: gr.T }, { x: gr.X(0), y: gr.B }, LT.line, 1);
      var pts = [];
      for (var k2 = 0; k2 <= 180; k2++) pts.push([-90 + k2, incl(-90 + k2)]);
      K.plot(ctx, gr, pts, LT.green, { light: true });
      [[73.9, "㉮ 73.9°", got.a], [36.1, "㉯ 36.1°", got.b]].forEach(function (t) {
        var yy = gr.Y(t[0]), c = t[2] ? LT.green : LT.yellow;
        K.line(ctx, { x: gr.L, y: yy }, { x: gr.R, y: yy }, c, 1.8, [5, 4]);
        lpill(ctx, (t[2] ? "✔ " : "") + t[1], gr.L + 10, yy - 8, { s: 11, c: c });
      });
      K.line(ctx, { x: gr.X(lat), y: gr.Y(I) }, { x: gr.X(lat), y: gr.B }, LT.red, 1.2, [3, 3]);
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(gr.X(lat), gr.Y(I), 7, 0, 6.2832); ctx.fill();
      ctx.fillStyle = LT.red; ctx.beginPath(); ctx.arc(gr.X(lat), gr.Y(I), 4.5, 0, 6.2832); ctx.fill();
      $("a-c1-info").innerHTML = "위도 <b>" + lat + "°</b>에서 만들어진 암석에는 복각 <b>" + I.toFixed(1) + "°</b>가 기록됩니다. "
        + (lat > 0 ? "북반구에서는 자침의 N극이 아래로 기웁니다(복각 +)." : (lat < 0 ? "남반구에서는 자침의 N극이 위로 들립니다(복각 −)." : "적도에서는 자침이 수평입니다(복각 0)."))
        + " 그래서 <b>암석의 복각을 재면 그 암석이 만들어진 때의 위도</b>를 알 수 있습니다.";
    }
    canvas._redraw = draw;

    function mission() {
      if (got.a) done("m1-2a");
      if (got.b) done("m1-2b");
      if (got.a && got.b) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>오늘 노르웨이 남부는 <b>북위 60°</b>, 그런데 3억 년 전 그곳의 용암은 <b>북위 20°</b>에서 굳었습니다. 실제로 유럽의 석탄기 지층에는 열대 늪지 숲이 쌓여 만들어진 석탄이 들어 있습니다. 그 땅은 <b>저위도(북위 20°)에서 북쪽으로 4,000 km 넘게 옮겨 온 것</b>입니다.");
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
    var NA_COL = "#ff9a6a", EU_COL = KC.blue;

    function disc(x, y, r, deep) {
      var sh = ctx.createRadialGradient(x, y + r * .9, 4, x, y + r * .9, r * 1.1); sh.addColorStop(0, "rgba(20,30,50,.3)"); sh.addColorStop(1, "rgba(20,30,50,0)");
      ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(x, y + r * .9, r * 1.1, r * .3, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = deep ? "#06122c" : "#0a2246"; ctx.beginPath(); ctx.arc(x, y + 9, r, 0, 6.2832); ctx.fill();
      var g = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
      g.addColorStop(0, deep ? "#1e3f7a" : "#2a5a9a"); g.addColorStop(1, deep ? "#0a1838" : "#0d2350");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "rgba(160,200,255,.25)"; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
      [r / 3, r * 2 / 3].forEach(function (rr) { ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832); ctx.stroke(); });
      for (var a = 0; a < 12; a++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a * Math.PI / 6) * r, y + Math.sin(a * Math.PI / 6) * r); ctx.stroke(); }
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(160,210,255,.6)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.stroke();
    }
    function land(pts, x, y, c1, c2) {
      var g = ctx.createLinearGradient(x - 120, y - 100, x + 60, y + 40); g.addColorStop(0, c1); g.addColorStop(1, c2);
      ctx.save(); ctx.shadowColor = c1; ctx.shadowBlur = 10;
      poly(ctx, pts, x, y, g, null); ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1.5; poly(ctx, pts, x, y, null, null); ctx.stroke();
    }
    function draw() {
      var t = c / 100, g = gap(t);
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽 : 북극에서 내려다본 지도 ── */
      var LW = 444, cx = 225, cy = 222, R = 160;
      K.studio(ctx, 0, 0, LW, H, null);
      K.bigText(ctx, "어긋남 " + g.toFixed(1) + "°", 18, 42, 24, g <= 3 ? "#7ef0b8" : "#ffd35a");
      lpill(ctx, "북극에서 내려다본 지도 (모식도)", LW - 14, 30, { a: "right", s: 11.5, c: LT.blue, box: [0, LW] });
      disc(cx, cy, R, false);
      land(NA_POLY, cx, cy, "#ffb48a", "#a8502c");
      var eu = EU_NOW.map(function (p) { return back(p, t); });
      land(eu, cx, cy, "#a8dcff", "#2f5fa8");
      K.pill(ctx, "북아메리카", cx - 78, cy - 26, { a: "center", s: 11.5, c: NA_COL });
      var ec = eu.reduce(function (a, p) { return [a[0] + p[0] / eu.length, a[1] + p[1] / eu.length]; }, [0, 0]);
      K.pill(ctx, "유럽", cx + ec[0], cy + ec[1] + 4, { a: "center", s: 11.5, c: EU_COL });
      K.glow(ctx, cx, cy, 2.6, "rgba(255,255,255,.95)", 3.5);
      K.t(ctx, "북극", cx + 8, cy + 16, { s: 10.5, c: KC.ink });
      K.pill(ctx, t > 0.9 ? "대서양이 닫혀 두 대륙이 붙었습니다 (판게아)" : "두 대륙 사이가 대서양입니다", 16, H - 12, { s: 11.5, c: t > 0.9 ? KC.green : KC.mute });

      /* ── 오른쪽 : 극 부근 확대 — 겉보기 극이동 곡선 ── */
      var RX = LW + 8, px = 676, py = 210, S = 1.9, PR = 146;
      K.card(ctx, RX, 0, W - RX, H, "기준판 — 시대별 자북극이 있던 자리");
      disc(px, py, PR, true);
      function curve(pts, col, tag) {
        ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.shadowColor = col; ctx.shadowBlur = 9; ctx.lineJoin = "round";
        ctx.beginPath();
        pts.forEach(function (p, i) { var x = px + p[0] * S, y = py + p[1] * S; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
        ctx.stroke(); ctx.restore();
        pts.forEach(function (p, i) {
          var x = px + p[0] * S, y = py + p[1] * S;
          K.glow(ctx, x, y, 4, col, 3);
          if (tag) K.t(ctx, AGES[i] + (i === AGES.length - 1 ? " Ma (현재)" : " Ma"), x + 9, y + 4, { s: 10, c: KC.ink, w: "600" });
        });
      }
      curve(NPOLE, NA_COL, true);
      curve(EUPOLE_NOW.map(function (p) { return back(p, t); }), EU_COL, false);
      K.pill(ctx, "● 북아메리카에서 구한 곡선", RX + 16, 386, { s: 11.5, c: NA_COL });
      K.pill(ctx, "● 유럽에서 구한 곡선", RX + 16, 410, { s: 11.5, c: EU_COL });
      K.pill(ctx, "두 곡선의 어긋남 " + g.toFixed(1) + "°", W - 16, 398, { s: 15, a: "right", c: g <= 3 ? KC.green : KC.yellow });

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
    var va = 1.0, vp = 1.0, T = 0, got = window.sthState("a4") || { a: 0, p: 0 };

    function worst(pts, rate) {
      var m = 0;
      pts.forEach(function (q) { m = Math.max(m, Math.abs(rate * 10 * q[0] - q[1])); });
      return m;
    }
    /* 블록 모형: 해령이 앞뒤(y)로 뻗고, 좌우(x)로 해양 지각이 벌어진다. 윗면 = 해저 줄무늬, 앞면 = 해양 지각 단면 */
    var I = K.iso({ ox: 196, oy: 168, s: 0.6, L: 380, D: 170 }), BL = I.L, BD = I.D, RX0 = 190, SL = 118, CB = 34;
    function zSea(u) { return 62 + 24 * Math.exp(-Math.pow((u - RX0) / 44, 2)) - 4 * Math.exp(-Math.pow((u - RX0) / 6, 2)); }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 460, i;
      var RUNS = [3, 1, 2, 4, 1, 2, 3, 1, 1, 3, 2, 2], RS = 25, wdt = 12;
      function pol(n) { var m = ((n % RS) + RS) % RS, k = 0; while (m >= RUNS[k]) { m -= RUNS[k]; k++; } return k % 2; }
      var pv = 4 + va * 3, run = T * pv, born = Math.floor(run / wdt), frac = run - born * wdt;
      function stripe(u) { var d = Math.abs(u - RX0), k = Math.max(0, Math.ceil((d - frac) / wdt)); return pol(born - k); }
      var N0 = ["#f3eedf", "#e6dcc4"], R0 = ["#3a4a6e", "#2a3656"];
      K.studio(ctx, 0, 0, LW, H, { x: I.P(BL, BD, 0).x - 110, y: I.P(BL, BD, 0).y - 14, rx: 250, ry: 40 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      ["front", "right"].forEach(function (side) {
        I.face(ctx, side, function (Lw) {
          var mg = ctx.createLinearGradient(0, 0, 0, CB); mg.addColorStop(0, "#7a3418"); mg.addColorStop(1, "#c0602e");
          ctx.fillStyle = mg; ctx.fillRect(0, 0, Lw, CB);
          if (side === "front") {
            for (var u = 0; u < Lw; u += 2) { var s = stripe(u + 1); ctx.fillStyle = s ? R0[1] : N0[1]; ctx.fillRect(u, CB, 2.4, zSea(u + 1) - CB); }
            var pg = ctx.createRadialGradient(RX0, CB, 2, RX0, CB, 44); pg.addColorStop(0, "rgba(255,230,140,1)"); pg.addColorStop(.5, "rgba(255,120,40,.8)"); pg.addColorStop(1, "rgba(255,90,30,0)");
            ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(RX0, CB - 4, 40, 30, 0, 0, 6.2832); ctx.fill();
            ctx.strokeStyle = "rgba(255,150,60,.9)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(RX0, CB); ctx.lineTo(RX0, zSea(RX0) - 2); ctx.stroke();
          } else { ctx.fillStyle = stripe(BL) ? R0[1] : N0[1]; ctx.fillRect(0, CB, Lw, zSea(BL) - CB); }
          ctx.strokeStyle = "rgba(40,25,10,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, CB); ctx.lineTo(Lw, CB); ctx.stroke();
        });
      });
      I.top(ctx, zSea, function (n, u) { var s = stripe(u); return s ? R0[0] : N0[0]; }, 150);
      /* 해령에서 솟는 마그마 빛 */
      var ra = I.P(RX0, 0, zSea(RX0)), rb = I.P(RX0, BD, zSea(RX0));
      ctx.save(); ctx.strokeStyle = "rgba(255,140,50,.9)"; ctx.lineWidth = 3; ctx.shadowColor = "#ff7a2c"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(ra.x, ra.y); ctx.lineTo(rb.x, rb.y); ctx.stroke(); ctx.restore();
      I.water(ctx, SL, function (u, side) { return side === "front" ? zSea(u) : zSea(BL); }, { phase: T * 6, top: "rgba(90,170,230,.30)", deep: "rgba(20,70,140,.42)" });
      I.shade(ctx, "front", function () { return SL; });
      I.shade(ctx, "right", function () { return SL; });
      I.edges(ctx, SL, SL);
      [[150, 70, 70, 70], [230, 70, 310, 70]].forEach(function (q) { K.arrow(ctx, I.P(q[0], q[1], zSea(q[0]) + 3), I.P(q[2], q[3], zSea(q[2]) + 3), "#ffffff", 3, 10); });
      for (var mq = 0; mq < 6; mq++) { var pm = (T * 0.6 + mq / 6) % 1, mp = I.P(RX0, BD, lerp(CB, zSea(RX0), pm)); ctx.globalAlpha = .4 + .5 * (1 - pm); K.glow(ctx, mp.x, mp.y, 2, "rgba(255,220,140,.95)", 3); }
      ctx.globalAlpha = 1;
      ctx.restore();
      var box = [0, LW], nowNorm = pol(born) === 0;
      I.label(ctx, RX0, 20, zSea(RX0), "해령 — 마그마가 올라와 새 지각이 된다", 30, -46, "#ffd0a0", box);
      I.label(ctx, 60, BD, (CB + zSea(60)) / 2, "해양 지각 (줄무늬 = 굳을 때의 자기장)", -20, 44, "#e8ecff", box);
      I.label(ctx, 300, BD, CB / 2, "맨틀", 30, 30, "#ffd0b0", box);
      var mp2 = I.P(RX0, BD * .9, SL + 34);
      K.arrow(ctx, { x: mp2.x, y: nowNorm ? mp2.y + 10 : mp2.y - 10 }, { x: mp2.x, y: nowNorm ? mp2.y - 12 : mp2.y + 12 }, nowNorm ? "#f59f00" : "#7048e8", 4, 11);
      lpill(ctx, nowNorm ? "지금 정자극기" : "지금 역자극기", mp2.x - 12, mp2.y + 4, { a: "right", s: 11, c: nowNorm ? LT.yellow : LT.violet, box: box },  { s: 11, c: nowNorm ? LT.yellow : LT.violet, box: box });
      lpill(ctx, "■ 밝은 띠 정자극기", 16, H - 40, { s: 10.5, c: "#8a7a52", box: box });
      lpill(ctx, "■ 어두운 띠 역자극기", 16, H - 14, { s: 10.5, c: "#2a3656", box: box });
      K.bigText(ctx, "해령 좌우로 대칭", 18, 46, 24, "#ffffff");
      K.bigText(ctx, "멀어질수록 나이가 많다", 18, 76, 16, "#ffd35a");
      K.warn(ctx, LW - 12, H - 14, "⚠ 높낮이·두께 과장", "right");

      /* ── 오른쪽 : 흰 카드 — 나이-거리 그래프 ── */
      var RX = LW + 10, AMAX = 80, DMAX = 2000;
      K.card(ctx, RX, 0, W - RX, H, "해양 지각의 나이와 해령으로부터의 거리");
      var g = K.chart(ctx, { x: RX + 6, y: 42, w: W - RX - 14, h: H - 46, pl: 58, light: true, x0: 0, x1: AMAX, y0: 0, y1: DMAX, xt: 4, yt: 4, xl: "나이 (백만 년) →",
        yf: function (v0) { return num(v0); } });
      K.t(ctx, "거리 (km)", g.L + 6, g.T + 12, { s: 10.5, c: LT.mute });
      function line(rate, col) { var aEnd = Math.min(AMAX, DMAX / (rate * 10)); K.plot(ctx, g, [[0, 0], [aEnd, rate * 10 * aEnd]], col, { light: true }); }
      function pts(arr, col) {
        arr.forEach(function (q) {
          ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(g.X(q[0]), g.Y(q[1]), 7, 0, 6.2832); ctx.fill();
          ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
        });
      }
      line(va, LT.yellow); line(vp, LT.blue);
      pts(ATL, LT.yellow); pts(PAC, LT.blue);
      lpill(ctx, "● 대서양 관측점 · 계산선 " + va.toFixed(1) + " cm/년", g.R - 8, g.B - 40, { a: "right", s: 11, c: LT.yellow, box: [RX, W] });
      lpill(ctx, "● 동태평양 관측점 · 계산선 " + vp.toFixed(1) + " cm/년", g.R - 8, g.B - 14, { a: "right", s: 11, c: LT.blue, box: [RX, W] });
    }
    function info() {
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
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span><span data-view='mymap:15PN10J5cnnwi0bF_vb08MdVo26GHfA0|10,-35|3|판 구조 지도 · Bird(2003) PB2002 · 구글 내 지도'>대서양 중앙 해령은</span> 한쪽으로 약 <b>2.5 cm/년</b>, <span data-view='mymap:15PN10J5cnnwi0bF_vb08MdVo26GHfA0|-15,-110|3|판 구조 지도 · Bird(2003) PB2002 · 구글 내 지도'>동태평양 해령은</span> 약 <b>6 cm/년</b>. 손톱이 자라는 속도로 바다가 넓어지고 있었습니다. 1억 년이면 각각 2,500 km, 6,000 km입니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    $("a-va").addEventListener("input", function (e) {
      va = +e.target.value; $("a-va-val").textContent = va.toFixed(1);
      if (!got.a && worst(ATL, va) <= 100) { got.a = va; window.sthState("a4", got); check(); }
      draw(); info();
    });
    $("a-vp").addEventListener("input", function (e) {
      vp = +e.target.value; $("a-vp-val").textContent = vp.toFixed(1);
      if (!got.p && worst(PAC, vp) <= 100) { got.p = vp; window.sthState("a4", got); check(); }
      draw(); info();
    });
    draw(); info(); check();
    var mv = mover(canvas, function () { T = mv.t; draw(); }, "해저 확장");
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
          : "베게너와 같은 그림이었습니다. 대륙이 해저를 헤치고 가는 것이 아니라, 해저째 옮겨 간 것이었습니다."))
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
    var ang = 0, spd = 5, T = 0, got = window.sthState("b2") || { c: false, t: false, d: false };
    var RP = K.rng(52), SPK = [];
    for (var sp = 0; sp < 60; sp++) SPK.push([RP(), RP(), RP()]);

    function kind(a) { return a <= 75 ? "수렴형" : (a >= 105 ? "발산형" : "보존형"); }
    /* ── 아이소메트릭 블록 모형: x = 판 A(왼쪽 뒤) → 판 B(오른쪽 앞), 경계는 x = M 을 따라 y 방향으로 놓인다.
          앞면(y = D)이 경계에 수직인 단면이다. z 는 그림 단위(두께·높이는 과장). ── */
    var I = K.iso({ ox: 352, oy: 206, s: 0.74, L: 640, D: 250 });
    var BL = I.L, BD = I.D, M = BL / 2, SEA = 176;
    function gs(x, c, w) { var a = (x - c) / w; return Math.exp(-a * a); }
    function zt(u) { var d = u - M; return 115 - 0.55 * d - 0.0012 * d * d; }          /* 섭입하는 판의 윗면 */
    var VOL = [[M + 122, 40], [M + 128, 128], [M + 118, BD - 26]];                      /* 호상 열도 화산 */
    function surf(k, x, y) {                                                              /* 해저면·땅 높이 */
      if (k === "발산형") return 150 + 20 * gs(x, M, 75) - 9 * gs(x, M, 10) + 1.2 * Math.sin(y / 23 + x / 41);
      if (k === "수렴형") {
        if (x < M) return 150 - 35 * gs(x, M, 26) + 1.2 * Math.sin(y / 23 + x / 41);
        var h = x < M + 62 ? 115 + (196 - 115) * Math.pow((x - M) / 62, 0.8) : 196 + 3 * Math.sin(y / 30) * Math.cos(x / 37);
        VOL.forEach(function (q) { var r = Math.sqrt(Math.pow(x - q[0], 2) + Math.pow(y - q[1], 2)); if (r < 30) h = Math.max(h, 196 + 46 * (1 - r / 30)); });
        return h;
      }
      return 150 + 1.2 * Math.sin(y / 23 + x / 41);
    }
    function base(k, u) {                                                                 /* 암석권 바닥(앞면) */
      if (k === "발산형") return 100 + 46 * gs(u, M, 80);
      if (k === "수렴형") return u < M ? surf(k, u, BD) - 50 : Math.max(80, zt(u));
      return 100;
    }
    function band(ctx, Lw, fT, fB, fill, u0, u1) {
      u0 = u0 || 0; u1 = u1 == null ? Lw : u1;
      var u, st = 3; ctx.beginPath();
      for (u = u0; u <= u1 + .01; u += st) ctx.lineTo(Math.min(u, u1), fT(Math.min(u, u1)));
      for (u = u1; u >= u0 - .01; u -= st) ctx.lineTo(Math.max(u, u0), fB(Math.max(u, u0)));
      ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    }
    function vg(c0, c1, z0, z1) { var g = ctx.createLinearGradient(0, z0, 0, z1); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; }
    function grain(Lw, seed, n) {
      var R = K.rng(seed);
      for (var i = 0; i < n; i++) { ctx.fillStyle = R() > .5 ? "rgba(255,255,255,.10)" : "rgba(30,20,10,.18)"; ctx.fillRect(R() * Lw, R() * 200, 1.6, 1.6); }
    }
    /* 한 면의 단면(앞면: u = x, 오른쪽 면: u = y 이고 x = L 에서 자른 판 B 의 속) */
    function section(k, side, tt, v) {
      I.face(ctx, side, function (Lw) {
        var F = side === "front";
        function sf(u) { return F ? surf(k, u, BD) : surf(k, BL, u); }
        function bs(u) { return F ? base(k, u) : base(k, BL); }
        /* 연약권 */
        band(ctx, Lw, function (u) { return F ? Math.max(bs(u), k === "수렴형" ? zt(u) : 0) : bs(u); }, function () { return 0; }, vg("#c8622e", "#6a2410", 140, 0));
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, Lw, 200); ctx.clip(); grain(Lw, F ? 41 : 43, Lw); ctx.restore();
        /* 암석권(맨틀 부분) + 지각 */
        var cont = k === "수렴형";
        if (F && cont) {
          band(ctx, Lw, sf, function (u) { return sf(u) - 50; }, vg("#7b6d60", "#4b4038", 150, 70), 0, M);       /* 판 A 암석권 */
          band(ctx, Lw, sf, function (u) { return sf(u) - 8; }, vg("#4a5559", "#2e383c", 150, 100), 0, M);       /* 해양 지각 */
          var sEnd = M + 153;
          band(ctx, Lw, zt, function (u) { return Math.max(0, zt(u) - 50); }, vg("#7b6d60", "#3e342e", 120, 0), M, sEnd);   /* 섭입하는 판 */
          band(ctx, Lw, zt, function (u) { return Math.max(0, zt(u) - 8); }, "#323d41", M, sEnd);
          /* 섭입하는 판이 내려가는 무늬 */
          ctx.save(); band(ctx, Lw, zt, function (u) { return Math.max(0, zt(u) - 50); }, "rgba(0,0,0,0)", M, sEnd); ctx.clip();
          ctx.strokeStyle = "rgba(255,255,255,.22)"; ctx.lineWidth = 2;
          for (var s1 = 0; s1 < 9; s1++) { var uu = M + ((tt * v + s1 * 20) % 180); ctx.beginPath(); ctx.moveTo(uu, zt(uu) + 2); ctx.lineTo(uu - 26, zt(uu) - 52); ctx.stroke(); }
          ctx.restore();
          band(ctx, Lw, sf, function (u) { return Math.max(80, zt(u)); }, vg("#857360", "#4f4236", 200, 80), M, Lw);   /* 판 B 암석권 */
          band(ctx, Lw, sf, function (u) { return Math.max(Math.max(80, zt(u)), sf(u) - 34); }, vg("#b89a74", "#7a6248", 200, 150), M, Lw); /* 대륙 지각 */
        } else if (cont) {
          band(ctx, Lw, sf, function () { return 80; }, vg("#857360", "#4f4236", 200, 80));
          band(ctx, Lw, sf, function (u) { return sf(u) - 34; }, vg("#b89a74", "#7a6248", 200, 150));
        } else {
          band(ctx, Lw, sf, bs, vg("#7b6d60", "#4b4038", 160, 90));
          band(ctx, Lw, sf, function (u) { return sf(u) - 8; }, vg("#4a5559", "#2e383c", 160, 120));
        }
        ctx.save(); band(ctx, Lw, sf, bs, "rgba(0,0,0,0)"); ctx.clip(); grain(Lw, F ? 47 : 49, Lw * .8); ctx.restore();
        /* 암석권 바닥선 */
        ctx.strokeStyle = "rgba(255,230,200,.55)"; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.4; ctx.beginPath();
        if (F && cont) { for (var a1 = 0; a1 <= M; a1 += 4) ctx.lineTo(a1, sf(a1) - 50); ctx.stroke(); ctx.beginPath(); for (var a2 = M + 10; a2 <= Lw; a2 += 4) ctx.lineTo(a2, Math.max(80, zt(a2))); }
        else for (var a3 = 0; a3 <= Lw; a3 += 4) ctx.lineTo(a3, bs(a3));
        ctx.stroke(); ctx.setLineDash([]);
        if (F && k === "보존형") {                                                       /* 변환 단층 */
          ctx.save(); ctx.shadowColor = "#b69cff"; ctx.shadowBlur = 10; ctx.strokeStyle = "#cbb6ff"; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(M, 98); ctx.lineTo(M, sf(M) + 1); ctx.stroke(); ctx.restore();
        }
      });
    }
    function draw() {
      var k = kind(ang), tt = T, v = 6 + spd * 3;
      var col = k === "수렴형" ? KC.blue : (k === "발산형" ? KC.red : KC.violet);
      ctx.clearRect(0, 0, W, H);
      K.studio(ctx, 0, 0, W, H, { x: I.P(BL, BD, 0).x - 160, y: I.P(BL, BD, 0).y - 24, rx: 330, ry: 54 });
      /* 윗면: 해저·땅 + 칸마다 바닷물 */
      function zOf(x, y) { return surf(k, x, y); }
      function colOf(x, y, z, light) {
        var c;
        if (k === "수렴형" && x >= M) c = z > 214 ? "#6a5a4e" : (z > 199 ? "#5d8f43" : (z > SEA ? "#c9b07a" : "#7d8a80"));
        else if (k === "발산형") {
          var d = Math.abs(x - M); if (d < 12) c = "#b8562c";
          else c = Math.floor((d - tt * v * .6) / 26) % 2 === 0 ? "#6e8790" : "#4b6670";       /* 해령 양쪽으로 대칭인 띠 */
        } else if (k === "보존형") {
          var sh = x < M ? -tt * v * .6 : tt * v * .6;
          c = Math.floor((y + sh + 1000) / 28) % 2 === 0 ? "#6e8790" : "#56717a";
        } else c = Math.floor((x - tt * v * .6 + 1000) / 26) % 2 === 0 ? "#6e8790" : "#5d7880";
        return K.tint(c, light);
      }
      I.field(ctx, zOf, colOf, 64, 20, function (c, x0, y0, x1, y1, zMax, zMin) {
        if (SEA > zMin + 0.2) {
          var a = I.P(x0, y0, SEA), b = I.P(x1, y0, SEA), cc = I.P(x1, y1, SEA), d = I.P(x0, y1, SEA);
          var dep = SEA - zMin, al = Math.min(.66, .26 + dep / 120);
          c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.lineTo(cc.x, cc.y); c.lineTo(d.x, d.y); c.closePath();
          c.fillStyle = "rgba(" + Math.round(60 - dep * .3) + "," + Math.round(150 - dep * .6) + ",220," + al.toFixed(2) + ")"; c.fill();
        }
      });
      section(k, "front", tt, v); section(k, "right", tt, v);
      I.water(ctx, SEA, function (u, side) { return side === "front" ? surf(k, u, BD) : surf(k, BL, u); }, { surface: false });
      I.shade(ctx, "right", function (u) { return Math.max(surf(k, BL, u), SEA); });
      I.edges(ctx, Math.max(surf(k, BL, BD), SEA), Math.max(surf(k, BL, BD), SEA));
      /* 경계선(윗면) */
      if (k !== "수렴형") {
        var e0 = I.P(M, 0, surf(k, M, 0) + 1), e1 = I.P(M, BD, surf(k, M, BD) + 1);
        ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 12; ctx.strokeStyle = k === "발산형" ? "#ffb070" : "#cbb6ff"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(e0.x, e0.y); ctx.lineTo(e1.x, e1.y); ctx.stroke(); ctx.restore();
      }
      var q, i;
      if (k === "발산형") {
        for (i = 0; i < 12; i++) {                                                         /* 올라오는 마그마 */
          var pm = (tt * 0.5 + i / 12) % 1;
          q = I.P(M + Math.sin(i * 2.1 + tt * 2.5) * 10, BD, 12 + pm * 132);
          ctx.globalAlpha = .3 + .6 * pm; K.glow(ctx, q.x, q.y, 2 + pm * 2, "rgba(255,200,110,.95)", 3.5);
        }
        ctx.globalAlpha = 1;
        K.arrow(ctx, I.P(M - 40, BD, 168), I.P(M - 150, BD, 162), "#ffffff", 3, 11);
        K.arrow(ctx, I.P(M + 40, BD, 168), I.P(M + 150, BD, 162), "#ffffff", 3, 11);
      } else if (k === "수렴형") {
        VOL.forEach(function (p, j) {
          var top = I.P(p[0], p[1], 243);
          K.glow(ctx, top.x, top.y, 2.6, "rgba(255,150,60,.95)", 3.6);
          for (var s2 = 0; s2 < 3; s2++) { var u = (tt * .35 + s2 / 3 + j * .2) % 1; ctx.fillStyle = "rgba(120,120,130," + (.45 * (1 - u)).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(top.x + u * 10, top.y - 6 - u * 26, 3 + u * 6, 0, 6.283); ctx.fill(); }
        });
        var m0 = I.P(M + 100, BD, 48), m1 = I.P(M + 118, BD, 214);
        ctx.strokeStyle = "rgba(255,140,60,.75)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m0.x, m0.y); ctx.quadraticCurveTo(m0.x + 14, (m0.y + m1.y) / 2, m1.x, m1.y); ctx.stroke();
        flow(ctx, m0, m1, tt * .5, "rgba(255,190,90,.95)", 4, 2.4);
        for (i = 0; i < 4; i++) {                                                          /* 섭입대를 따라 깊어지는 지진 */
          var bz = Math.max(0, Math.sin(tt * 2.6 - i * 1.1)), uq = M + 12 + i * 32;
          q = I.P(uq, BD, zt(uq) - 6);
          ctx.globalAlpha = .3 + .7 * bz; K.glow(ctx, q.x, q.y, 2.5 + bz * 2.5, "rgba(255,230,120,.95)", 3.5); ctx.globalAlpha = 1;
        }
      } else {
        var cyc = tt % 3, qy = 40 + (Math.floor(tt / 3) * 67) % 170;
        if (tt > 0 && cyc < 0.6) {
          q = I.P(M, qy, 151);
          ctx.globalAlpha = 1 - cyc / 0.6; ctx.strokeStyle = KC.yellow; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(q.x, q.y, 6 + cyc * 60, (6 + cyc * 60) * .58, 0, 0, 6.283); ctx.stroke(); ctx.globalAlpha = 1;
        }
        K.arrow(ctx, I.P(M - 60, 150, 152), I.P(M - 60, 60, 152), "#9fe0ea", 3, 11);
        K.arrow(ctx, I.P(M + 60, 80, 152), I.P(M + 60, 170, 152), "#d6c6ff", 3, 11);
      }
      /* 판 B 의 상대 운동 화살표(윗면) */
      var ax = -Math.cos(ang * D2R), ay = Math.sin(ang * D2R), AL = 34 + spd * 7, bx = M + 200, by = 112;
      var zb = k === "수렴형" ? 199 : 152;
      K.arrow(ctx, I.P(bx - ax * AL / 2, by - ay * AL / 2, zb), I.P(bx + ax * AL / 2, by + ay * AL / 2, zb), "#ffd35a", 4, 14);
      /* 이름표 */
      var box = [0, W];
      I.label(ctx, 90, 40, surf(k, 90, 40), "판 A (기준)", -40, -22, "#e8ecff", box);
      I.label(ctx, bx + 40, by - 60, zb, "판 B · θ = " + ang + "°, " + spd.toFixed(1) + " cm/년", 30, -60, KC.yellow, box);
      I.label(ctx, 30, BD, 30, "연약권", -26, 16, "#ffb38a", box);
      I.label(ctx, 40, BD, k === "발산형" ? 125 : (k === "수렴형" ? 125 : 125), "암석권(판)", -30, -6, "#e2d6c8", box);
      if (k === "발산형") {
        I.label(ctx, M, BD, surf(k, M, BD), "해령", -40, -40, KC.orange, box);
        I.label(ctx, M + 10, BD, 70, "상승하는 마그마", 70, 34, KC.orange, box);
      } else if (k === "수렴형") {
        I.label(ctx, M - 4, BD, surf(k, M - 4, BD), "해구", -54, -46, KC.blue, box);
        I.label(ctx, M + 60, BD, zt(M + 60) - 25, "섭입하는 판", 58, 40, "#bfe6ee", box);
        I.label(ctx, VOL[2][0], VOL[2][1], 230, "🌋 호상 열도의 화산", 60, -30, KC.orange, box);
      } else {
        I.label(ctx, M, BD, 120, "변환 단층", 54, 40, KC.violet, box);
      }
      /* 큰 글자 */
      var HL = k === "수렴형" ? ["판이 맞부딪친다", "해구에서 판이 사라진다"] : (k === "발산형" ? ["바다가 갈라진다", "해령에서 새 판이 태어난다"] : ["판이 스쳐 지나간다", "생기지도, 사라지지도 않는다"]);
      K.bigText(ctx, HL[0], 20, 46, 28, "#ffffff");
      K.bigText(ctx, HL[1], 20, 78, 17, k === "수렴형" ? "#7fd3ff" : (k === "발산형" ? "#ffb35c" : "#cbb6ff"));
      K.warn(ctx, W - 14, 30, "⚠ 두께·높이·깊이는 보기 쉽게 과장", "right");
      var DESC = k === "수렴형" ? "밀도가 큰 판이 다른 판 아래로 가라앉습니다. 깊은 지진과 화산이 함께 일어나고, 지각이 사라집니다."
        : (k === "발산형" ? "두 판이 멀어진 틈으로 마그마가 올라와 굳으며 새 해양 지각이 만들어집니다."
          : "두 판이 어긋나며 스쳐 지나갑니다(변환 단층). 지각이 새로 생기지도, 사라지지도 않습니다.");
      kwrap(ctx, DESC, 18, H - 70, 300, 18, { s: 12.5, w: "700", c: "#1b2540" });
      K.pill(ctx, "경계에서 일어나는 일 — " + k, 18, H - 92, { s: 13, c: col });
    }
    function info() {
      var k = kind(ang), perp = spd * Math.cos(ang * D2R), para = spd * Math.sin(ang * D2R), wdt = Math.abs(perp) * 100;
      $("b-c1-info").innerHTML = "θ = " + ang + "°이므로 경계에 <b>수직인 성분</b>은 " + perp.toFixed(2) + " cm/년, <b>나란한 성분</b>은 "
        + para.toFixed(2) + " cm/년입니다. → <b>" + k + " 경계</b><br>"
        + (k === "보존형" ? "수직 성분이 아주 작아(두 판이 거의 나란히 스쳐 가) 1,000만 년이 지나도 지각이 거의 생기거나 사라지지 않습니다."
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
      draw(); info();
    }
    $("b-ang").addEventListener("input", function (e) { ang = +e.target.value; $("b-ang-val").textContent = ang + "°"; upd(); });
    $("b-spd").addEventListener("input", function (e) { spd = +e.target.value; $("b-spd-val").textContent = spd.toFixed(1); draw(); info(); });
    draw(); info(); check();
    var mv = mover(canvas, function () { T = mv.t; draw(); }, "판 운동");
  })();

  /* ---- 장면 3 : 판을 움직이는 힘 ---- */
  (function () {
    var canvas = $("b-c2"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var slab = 0, T = 0, got = window.sthState("b3") || { slow: false, fast: false };
    var REAL = [["태평양판", 9.0], ["나스카판", 7.4], ["인도-호주판", 6.2], ["아프리카판", 2.1], ["북아메리카판", 1.9], ["유라시아판", 0.9]];
    function speed(s) { return 1.0 + 0.09 * s; }

    /* 블록 모형: 앞면(y = D) = 판 단면. 왼쪽 해령 → 해양판 → 해구에서 섭입 → 오른쪽 대륙. 아래는 맨틀(연약권) */
    var I = K.iso({ ox: 156, oy: 178, s: 0.7, L: 430, D: 110 }), BL = I.L, BD = I.D, XR = 58, XT = 300, SL = 126;
    function ztop(u) {
      if (u < XT) return 116 - 22 * Math.sqrt(Math.max(0, u - XR) / (XT - XR)) + 8 * Math.exp(-Math.pow((u - XR) / 18, 2));
      if (u < XT + 14) return lerp(84, 120, (u - XT) / 14);
      return 128 + 22 * Math.exp(-Math.pow((u - 368) / 26, 2)) + 3 * Math.sin(u / 9);
    }
    function pthk(u) { return 6 + 16 * Math.sqrt(clamp((u - XR) / (XT - XR), 0, 1)); }
    function draw() {
      var u = speed(slab), LW = 528, i;
      ctx.clearRect(0, 0, W, H);
      K.studio(ctx, 0, 0, LW, H, { x: I.P(BL, BD, 0).x - 120, y: I.P(BL, BD, 0).y - 14, rx: 270, ry: 42 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      var sl = 24 + slab * 1.1, dip = 48 * D2R, fp = 4 + u * 5;
      ["front", "right"].forEach(function (side) {
        I.face(ctx, side, function (Lw) {
          ctx.beginPath(); ctx.rect(0, 0, Lw, 400); ctx.clip();
          var mg = ctx.createLinearGradient(0, 0, 0, 120); mg.addColorStop(0, "#7a2e14"); mg.addColorStop(1, "#c8642e");
          ctx.fillStyle = mg; ctx.fillRect(0, 0, Lw, 140);
          if (side === "right") {                       /* 대륙 단면 */
            ctx.fillStyle = "#a08060"; ctx.beginPath(); ctx.moveTo(0, 84); ctx.lineTo(Lw, 84); ctx.lineTo(Lw, ztop(BL)); ctx.lineTo(0, ztop(BL)); ctx.closePath(); ctx.fill();
            return;
          }
          /* 해령 아래 솟는 마그마 */
          var pg = ctx.createRadialGradient(XR, 70, 2, XR, 70, 60); pg.addColorStop(0, "rgba(255,225,140,1)"); pg.addColorStop(.5, "rgba(255,120,40,.7)"); pg.addColorStop(1, "rgba(255,90,30,0)");
          ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(XR, 74, 46, 50, 0, 0, 6.2832); ctx.fill();
          /* 대륙 지각 */
          var cg = ctx.createLinearGradient(0, 70, 0, 150); cg.addColorStop(0, "#7a5a3a"); cg.addColorStop(1, "#c8a46a");
          ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(XT + 10, 84); for (var x = XT + 10; x <= Lw; x += 4) ctx.lineTo(x, ztop(x)); ctx.lineTo(Lw, 70); ctx.lineTo(XT + 30, 70); ctx.closePath(); ctx.fill();
          /* 해양판(암석권) + 섭입하는 판 */
          var og = ctx.createLinearGradient(0, 80, 0, 120); og.addColorStop(0, "#3a4a52"); og.addColorStop(1, "#6f8a94");
          ctx.fillStyle = og; ctx.beginPath(); ctx.moveTo(XR, ztop(XR));
          for (x = XR; x <= XT; x += 4) ctx.lineTo(x, ztop(x));
          var ex = XT + Math.cos(dip) * sl, ez = ztop(XT) - Math.sin(dip) * sl, th = pthk(XT);
          ctx.lineTo(ex, ez); ctx.lineTo(ex - Math.sin(dip) * th, ez - Math.cos(dip) * th);
          ctx.lineTo(XT - th * .6, ztop(XT) - th);
          for (x = XT; x >= XR; x -= 4) ctx.lineTo(x, ztop(x) - pthk(x));
          ctx.closePath(); ctx.fill();
          ctx.save(); ctx.clip();
          ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = 2;
          for (var k = 0; k < 16; k++) { var fx = XR + 6 + ((T * fp + k * 24) % (XT - XR + sl)); if (fx <= XT) { ctx.beginPath(); ctx.moveTo(fx, ztop(fx) - 2); ctx.lineTo(fx, ztop(fx) - pthk(fx) + 2); ctx.stroke(); } else { var s2 = fx - XT, px = XT + Math.cos(dip) * s2, pz = ztop(XT) - Math.sin(dip) * s2; ctx.beginPath(); ctx.moveTo(px, pz); ctx.lineTo(px - Math.sin(dip) * th, pz - Math.cos(dip) * th); ctx.stroke(); } }
          ctx.restore();
        });
      });
      I.top(ctx, ztop, function (n, uu) { return uu < XT ? K.tint("#6f8a94", .95 + .06 * (n % 2)) : (uu < XT + 16 ? "#8e7b63" : K.tint(uu > 350 && uu < 390 ? "#8a7a62" : "#6a9e4c", .95 + .06 * (n % 2))); }, 120);
      I.water(ctx, SL, function (uu, side) { return side === "front" ? ztop(uu) : ztop(BL); }, {
        clipSurface: function (c2) { var a = I.P(0, 0, SL), b = I.P(XT + 16, 0, SL), cc = I.P(XT + 16, BD, SL), d = I.P(0, BD, SL); c2.beginPath(); c2.moveTo(a.x, a.y); c2.lineTo(b.x, b.y); c2.lineTo(cc.x, cc.y); c2.lineTo(d.x, d.y); c2.closePath(); c2.clip(); },
        phase: T * 4, top: "rgba(90,170,230,.32)", deep: "rgba(20,70,140,.45)" });
      I.shade(ctx, "front", function (uu) { return Math.max(ztop(uu), uu < XT + 10 ? SL : 0); });
      I.shade(ctx, "right", function () { return ztop(BL); });
      I.edges(ctx, ztop(BL), ztop(BL));
      [[340, 30], [380, 70], [420, 20]].forEach(function (t) { I.tree(ctx, t[0], t[1], ztop(t[0]), .9); });
      var vp = I.P(368, 60, ztop(368)); K.glow(ctx, vp.x, vp.y - 2, 3.5, "rgba(255,130,60,.95)", 3);
      ctx.restore();
      /* 힘 화살표(앞면 위) */
      var a1 = I.P(XR + 20, BD, ztop(XR + 20) - 10), a2 = I.P(XR + 80, BD, ztop(XR + 80) - 12);
      K.arrow(ctx, a1, a2, LT.red, 4, 12);
      if (slab > 0) {
        var aL = Math.min(sl, 90), s0 = I.P(XT + Math.cos(dip) * 10, BD, ztop(XT) - Math.sin(dip) * 10 - 10), s1 = I.P(XT + Math.cos(dip) * aL, BD, ztop(XT) - Math.sin(dip) * aL - 10);
        K.arrow(ctx, s0, s1, LT.violet, 4 + slab / 30, 13);
      }
      var box = [0, LW];
      I.label(ctx, XR, BD * .3, ztop(XR), "해령", -50, 8, "#ffd0a0", box);
      I.label(ctx, XT + 6, BD * .3, ztop(XT + 6), "해구", 30, -40, "#bfe6ff", box);
      K.pill(ctx, "해령 밀기", a2.x + 8, a2.y + 4, { s: 12, c: "#ffb0a0", box: box });
      if (slab > 0) K.pill(ctx, "판 끌기", I.P(XT + Math.cos(dip) * Math.min(sl, 90), BD, ztop(XT) - Math.sin(dip) * Math.min(sl, 90)).x + 10, I.P(XT + Math.cos(dip) * Math.min(sl, 90), BD, ztop(XT) - Math.sin(dip) * Math.min(sl, 90)).y + 20, { s: 12, c: "#d8ccff", box: box });
      I.label(ctx, 150, BD, 30, "맨틀(연약권)", -30, 40, "#ffd0b0", box);
      I.label(ctx, 410, BD, 100, "대륙판", 20, 30, "#f4e6c4", box);
      K.bigText(ctx, "판의 속도 " + u.toFixed(1) + " cm/년", 18, 46, 26, u >= 9 ? "#7ef0b8" : (u <= 2 ? "#cfe6ff" : "#ffd35a"));
      K.bigText(ctx, "섭입대 비율 " + slab + "%", 18, 78, 17, "#ffffff");
      K.warn(ctx, LW - 12, H - 12, "⚠ 두께·기울기는 과장", "right");

      /* ── 오른쪽 : 흰 카드 — 실제 판의 이동 속도 ── */
      var RX = LW + 10, x0 = RX + 112, bw = W - x0 - 46;
      K.card(ctx, RX, 0, W - RX, H, "실제 판의 이동 속도 (cm/년)");
      REAL.forEach(function (r, i2) {
        var y = 58 + i2 * 36;
        K.t(ctx, r[0], x0 - 8, y + 11, { s: 11.5, w: "700", a: "right", c: LT.mute });
        K.bar(ctx, x0, y + 2, bw, r[1] / 10, LT.blue);
        K.t(ctx, r[1].toFixed(1), x0 + bw + 8, y + 12, { s: 12, w: "900", c: LT.ink });
      });
      var yM = 58 + REAL.length * 36 + 22;
      K.line(ctx, { x: RX + 16, y: yM - 14 }, { x: W - 16, y: yM - 14 }, LT.line, 1, [3, 4]);
      K.t(ctx, "내 모형", x0 - 8, yM + 12, { s: 13, w: "900", a: "right", c: LT.orange });
      K.bar(ctx, x0, yM + 3, bw, u / 10, LT.orange);
      K.t(ctx, u.toFixed(1), x0 + bw + 8, yM + 13, { s: 13, w: "900", c: LT.orange });
      K.tip(ctx, u <= 2 ? "해구가 거의 없는 판 — 느리다" : (u >= 9 ? "가장자리 대부분이 해구 — 빠르다" : "해구가 늘수록 빨라진다"), RX + 14, H - 50, W - RX - 28, u >= 9 ? true : null);
    }
    function info() {
      var u = speed(slab);
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
      draw(); info();
    });
    draw(); info(); check();
    var mv = mover(canvas, function () { T = mv.t; draw(); }, "판 운동");
  })();

  /* ---- 장면 4 : 하와이–엠퍼러 해산열 ---- */
  (function () {
    var canvas = $("b-c3"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var vv = 5.0, dir = 270, T = 0, got = window.sthState("b4") || { v: 0, d: 0 }, cache = stash(canvas, W, H);
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
    function mound(x, y, r, hot) {
      var g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
      if (hot) { g.addColorStop(0, "#fff0b0"); g.addColorStop(.4, "#ff8a3c"); g.addColorStop(1, "#7a2a10"); }
      else { g.addColorStop(0, "#d8c8a8"); g.addColorStop(.45, "#7a6a50"); g.addColorStop(1, "#2a2418"); }
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    }

    /* 블록 모형: 태평양 바닥을 잘라 낸 블록. 북쪽 = 왼쪽 위(−x), 서쪽 = 오른쪽 위(−y). 하와이(열점)는 앞쪽 오른편 */
    var I = K.iso({ ox: 300, oy: 162, s: 0.6, L: 420, D: 330 }), BL = I.L, BD = I.D, XH = 380, YH = 292, SKM = 0.064, SL = 112;
    function kmA(d, a) { return [d * Math.sin(a * D2R), d * Math.cos(a * D2R)]; }           /* 거리·방위각 → 동(E)·북(N) km */
    function obsKm(d) { if (d <= 3500) return kmA(d, AZH); var b = kmA(3500, AZH), w = kmA(d - 3500, AZE); return [b[0] + w[0], b[1] + w[1]]; }
    function modKm(age, rate, dr) { var km = rate * 10; if (age <= BEND) return kmA(km * age, AZH); var b = kmA(km * BEND, AZH), w = kmA(km * (age - BEND), dr); return [b[0] + w[0], b[1] + w[1]]; }
    function wpos(en) { return [XH - en[1] * SKM, YH + en[0] * SKM]; }
    var MOUNTS = [];
    for (var sm = 0; sm <= 24; sm++) { var dd = sm * 250, wp = wpos(obsKm(dd)); MOUNTS.push([wp[0], wp[1], dd === 0 ? 92 : 66 * Math.exp(-dd / 1100) + 22, dd === 0 ? 16 : 11]); }
    function zOf(x, y) {
      var z = 44 + 3 * Math.sin(x / 23) * Math.cos(y / 31);
      for (var i = 0; i < MOUNTS.length; i++) { var q = MOUNTS[i], dx = x - q[0], dy = y - q[1]; z += q[2] * Math.exp(-(dx * dx + dy * dy) / (2 * q[3] * q[3])); }
      return z;
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 600, i;
      var img = cache("g", function (c) {
        var keep = ctx; ctx = c;
        K.studio(ctx, 0, 0, LW, H, { x: I.P(BL, BD, 0).x - 150, y: I.P(BL, BD, 0).y - 20, rx: 330, ry: 50 });
        ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
        ["front", "right"].forEach(function (side) {
          var zf = side === "front" ? function (u) { return zOf(u, BD); } : function (u) { return zOf(BL, u); };
          I.face(ctx, side, function (Lw) {
            ctx.save(); I.profile(ctx, side, zf, 0); ctx.clip();
            var mg = ctx.createLinearGradient(0, 0, 0, 30); mg.addColorStop(0, "#8a3418"); mg.addColorStop(1, "#c86a34");
            ctx.fillStyle = mg; ctx.fillRect(0, 0, Lw, 30);
            var lg = ctx.createLinearGradient(0, 30, 0, 50); lg.addColorStop(0, "#4a4f58"); lg.addColorStop(1, "#6a6f78");
            ctx.fillStyle = lg; ctx.fillRect(0, 30, Lw, 200);
            ctx.restore();
          });
        });
        I.field(ctx, zOf, function (x, y, z, lt) { return K.tint(z > SL + 1 ? (z > SL + 20 ? "#4f7a3a" : "#3a3434") : (z > 62 ? "#7a6a5a" : "#c8b896"), lt); }, 70, 55, function (c2, x0, y0, x1, y1, zMax, zMin) {
          if (SL > zMin + 0.3) {
            var a = I.P(x0, y0, SL), b = I.P(x1, y0, SL), cc = I.P(x1, y1, SL), d = I.P(x0, y1, SL), depth = SL - zMin;
            c2.beginPath(); c2.moveTo(a.x, a.y); c2.lineTo(b.x, b.y); c2.lineTo(cc.x, cc.y); c2.lineTo(d.x, d.y); c2.closePath();
            c2.fillStyle = "rgba(" + Math.round(90 - depth * .3) + "," + Math.round(180 - depth * .5) + ",235," + Math.min(.42, .12 + depth / 260).toFixed(2) + ")"; c2.fill();
          }
        });
        I.water(ctx, SL, function (u, side) { return side === "front" ? zOf(u, BD) : zOf(BL, u); }, { surface: false, top: "rgba(70,160,230,.4)", deep: "rgba(15,60,130,.6)" });
        I.shade(ctx, "front", function () { return SL; });
        I.shade(ctx, "right", function () { return SL; });
        I.edges(ctx, SL, SL);
        /* 방위 표시(윗면) */
        var c0 = I.P(70, BD - 40, SL + 2);
        K.arrow(ctx, c0, I.P(20, BD - 40, SL + 2), "#e03131", 3, 10); K.arrow(ctx, c0, I.P(70, BD - 90, SL + 2), "#5c7086", 2, 8);
        var nl = I.P(12, BD - 40, SL + 2), wl = I.P(70, BD - 98, SL + 2);
        K.t(ctx, "북", nl.x - 4, nl.y - 4, { s: 12, w: "900", a: "right", c: "#e03131" }); K.t(ctx, "서", wl.x + 4, wl.y - 2, { s: 12, w: "900", c: "#5c7086" });
        ctx.restore();
        ctx = keep;
      });
      ctx.drawImage(img, 0, 0, W, H);
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      /* 앞면: 맨틀 플룸(열점) */
      I.face(ctx, "front", function () {
        var pr = 1 + .12 * Math.sin(T * 3), pg = ctx.createLinearGradient(XH - 14, 0, XH + 14, 0);
        pg.addColorStop(0, "rgba(255,120,40,0)"); pg.addColorStop(.5, "rgba(255,200,90,.95)"); pg.addColorStop(1, "rgba(255,120,40,0)");
        ctx.fillStyle = pg; ctx.fillRect(XH - 14 * pr, 0, 28 * pr, 38);
        var hg = ctx.createRadialGradient(XH, 36, 1, XH, 36, 22 * pr); hg.addColorStop(0, "rgba(255,240,180,1)"); hg.addColorStop(1, "rgba(255,120,40,0)");
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(XH, 36, 22 * pr, 0, 6.2832); ctx.fill();
      });
      /* 내 모형의 길(주황 점선) */
      function wpt(en) { var p = wpos(en); return I.P(p[0], p[1], Math.max(zOf(clamp(p[0], 0, BL), clamp(p[1], 0, BD)), SL) + 1); }
      ctx.save(); ctx.strokeStyle = "#e8590c"; ctx.lineWidth = 3; ctx.setLineDash([7, 5]); ctx.beginPath();
      for (var a = 0; a <= ENDA; a += 1.5) { var p = wpt(modKm(a, vv, dir)); if (a) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }
      ctx.stroke(); ctx.restore();
      [28, 47, 81].forEach(function (ag) { var p = wpt(modKm(ag, vv, dir)); ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, 6.2832); ctx.fill(); ctx.fillStyle = "#e8590c"; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 6.2832); ctx.fill(); });
      /* 열점에서 태어난 화산이 판에 실려 옮겨 간다(1초에 1,000만 년) */
      for (var gk = 0; gk < 4; gk++) {
        var age = ((T * 10) + gk * ENDA / 4) % ENDA, gp = wpt(modKm(age, vv, dir)), hh = age < 3 ? 16 : Math.max(7, 16 - age * .12);
        var vg = ctx.createLinearGradient(gp.x - 8, 0, gp.x + 8, 0); vg.addColorStop(0, "#8a6a52"); vg.addColorStop(1, "#3a2a20");
        ctx.fillStyle = vg; ctx.beginPath(); ctx.moveTo(gp.x - 9, gp.y); ctx.lineTo(gp.x, gp.y - hh); ctx.lineTo(gp.x + 9, gp.y); ctx.closePath(); ctx.fill();
        if (age < 3) K.glow(ctx, gp.x, gp.y - hh, 3, "rgba(255,140,60,.95)", 3);
      }
      var hp = I.P(XH, YH, zOf(XH, YH)); K.glow(ctx, hp.x, hp.y - 2, 4 + Math.sin(T * 3), "rgba(255,150,60,.95)", 3.4);
      ctx.restore();
      var box = [0, LW];
      for (i = 1; i <= 24; i++) { var op = wpt(obsKm(i * 250)); ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.beginPath(); ctx.arc(op.x, op.y, 2.6, 0, 6.2832); ctx.fill(); }
      OBS.forEach(function (q, k) {
        var p = wpos(obsKm(q[1])), dx = [44, -44, 50][k], dy = [10, -10, -16][k];
        var pp = wpt(obsKm(q[1])); ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(pp.x, pp.y, 7, 0, 6.2832); ctx.fill(); ctx.strokeStyle = "#12203a"; ctx.lineWidth = 2; ctx.stroke();
        I.label(ctx, p[0], p[1], SL + 1, q[0] + "백만 년 · " + num(q[1]) + " km", dx, dy, "#f4f0e6", box);
      });
      I.label(ctx, XH, YH, zOf(XH, YH), "하와이섬 · 열점 위 (0 km)", 40, 40, "#ffd0a0", box);
      I.label(ctx, XH, BD, 20, "맨틀 플룸 (거의 고정)", 40, 30, "#ffd0a0", box);
      K.bigText(ctx, "속도 " + vv.toFixed(1) + " cm/년 · " + dir + "°", 18, 46, 24, "#ffd35a");
      K.bigText(ctx, "꺾인 곳은 판이 방향을 튼 자리", 18, 76, 16, "#ffffff");
      K.warn(ctx, LW - 12, 30, "⚠ 화산 높이·크기는 과장", "right");

      /* ── 오른쪽 : 흰 카드 ── */
      var RX = LW + 10, px0 = RX + 16, px1 = W - 16, e = worstV(vv);
      K.card(ctx, RX, 0, W - RX, H, "내 모형 ↔ 관측된 해산열");
      K.row(ctx, "판의 속도", vv.toFixed(1) + " cm/년", px0, px1, 60, LT.orange);
      K.row(ctx, "꺾인 뒤 방위각", dir + "°", px0, px1, 88, LT.orange);
      K.row(ctx, "세 점과의 최대 차이", num(e) + " km", px0, px1, 122, e <= 400 ? LT.green : LT.red);
      K.bar(ctx, px0, 131, px1 - px0, 1 - clamp(e / 3000, 0, 1), e <= 400 ? LT.green : LT.yellow);
      K.row(ctx, "방위각 차이 (목표 345°)", Math.abs(dir - 345) + "°", px0, px1, 170, Math.abs(dir - 345) <= 10 ? LT.green : LT.red);
      K.bar(ctx, px0, 179, px1 - px0, 1 - clamp(Math.abs(dir - 345) / 75, 0, 1), Math.abs(dir - 345) <= 10 ? LT.green : LT.yellow);
      K.t(ctx, "관측 (화산의 나이 · 거리)", px0, 222, { s: 12, w: "800", c: LT.mute });
      OBS.forEach(function (q, k) { K.row(ctx, "● " + q[0] + "백만 년", num(q[1]) + " km", px0, px1, 246 + k * 24, LT.ink); });
      twrap(ctx, "열점에서 오래된 화산 쪽으로 뻗은 방향이 곧 판이 움직인 방향이다. 화산은 열점에서 태어나 판에 실려 떠난다.", px0, 336, px1 - px0, 18, { s: 11.5, c: LT.mute });
      K.tip(ctx, e <= 400 && Math.abs(dir - 345) <= 10 ? "모형이 관측과 맞는다" : "주황 점선을 흰 점에 맞춰 보자", px0 - 4, H - 50, px1 - px0 + 8, e <= 400 && Math.abs(dir - 345) <= 10 ? true : null);
    }
    function info() {
      var e = worstV(vv);
      $("b-c3-info").innerHTML = "속도 <b>" + vv.toFixed(1) + " cm/년</b> → 세 관측점과의 최대 거리 차이 <b>" + num(e) + " km</b>" + (got.v ? " ✅" : "")
        + "<br>꺾인 뒤 해산열이 뻗은 방위각 <b>" + dir + "°</b>" + (got.d ? " ✅" : "")
        + "<br>열점에서 오래된 화산 쪽으로 뻗은 방향이 곧 <b>판이 움직인 방향</b>입니다.";
    }
    canvas._redraw = draw;

    function check() {
      if (got.v) done("m2-4a");
      if (got.d) done("m2-4b");
      if (got.v && got.d) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>속도는 약 <b>7.5 cm/년</b>, 엠퍼러 구간은 거의 <b>북쪽(방위각 345°)</b>으로 뻗어 있습니다. 속도는 그대로인데 방향만 바뀐 것 — 약 4,700만 년 전 <b>태평양판이 방향을 튼 기록</b>입니다. (7.5 cm/년은 엠퍼러 구간까지 세 점에 맞춘 평균입니다. 하와이 구간만 보면 약 8.6 cm/년으로 조금 빠르고, 실제 자료 카드에서 섬 다섯 개로 구한 값은 약 9 cm/년입니다.)");
        ep.clear(3);
      }
    }
    $("b-v").addEventListener("input", function (e) {
      vv = +e.target.value; $("b-v-val").textContent = vv.toFixed(1);
      if (!got.v && worstV(vv) <= 400) { got.v = vv; window.sthState("b4", got); check(); }
      draw(); info();
    });
    $("b-dir").addEventListener("input", function (e) {
      dir = +e.target.value;
      $("b-dir-val").textContent = dir + "°" + (dir <= 285 ? " 서" : (dir >= 350 ? " 북" : (dir >= 330 ? " 북북서" : " 북서")));
      if (!got.d && Math.abs(dir - 345) <= 10) { got.d = dir; window.sthState("b4", got); check(); }
      draw(); info();
    });
    draw(); info(); check();
    var mv = mover(canvas, function () { T = mv.t; draw(); }, "열점 화산");
  })();

  /* ---- 장면 5 : 두 가지 구조 운동 ---- */
  function reveal() {
    $("b-end-wrap").hidden = false;
    var p = window.sthState("p2") || "", g = window.sthState("b4") || {};
    $("b-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음")
      + (p.indexOf("㉡") === 0 ? " — 정확했습니다." : " — 열점과 플룸이 답이었습니다.")
      + "<br><b>내가 읽어 낸 판의 역사</b> 속도 " + (g.v ? g.v.toFixed(1) : "-") + " cm/년, 약 4,700만 년 전 방향이 북북서 → 서북서로 바뀜";
  }
  function finish() {
    var g = window.sthState("b4") || {};
    window.sthState("r2", "해결 · 태평양판 " + (g.v ? g.v.toFixed(1) : "-") + " cm/년, 4,700만 년 전 방향 전환");
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
    if (si < 63) return { m: "안산암질", vo: "성층 화산", rk: "안산암", st: "용암류와 화산 쇄설물이 번갈아 쌓이는 분출", ex: "일본 사쿠라지마, 필리핀 마욘" };
    return { m: "유문암질", vo: "종상 화산", rk: "유문암", st: "기체가 갇혔다가 한꺼번에 터지는 폭발적 분출", ex: "백두산 정상부, 울릉도" };
  }

  /* ---- 장면 2 : 마그마 실험실 ---- */
  (function () {
    var canvas = $("c-c1"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var si = 45, T = 1200, w = 0.5;
    var got = window.sthState("c2") || { b: false, a: false, r: false }, log = [];

    function draw() {
      var lv = logVisc(si, T, w), c = classify(si), f = clamp((si - 45) / 30, 0, 1);
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽 : 화산을 반으로 자른 블록 모형 (앞면 = 화산 한가운데 단면) ── */
      var LW = 480, i;
      var I = K.iso({ ox: 196, oy: 170, s: 0.62, L: 340, D: 200 }), BL = I.L, BD = I.D, VX = 175, G = 40;
      var ht = 34 + f * 132, rad = 160 - f * 104;
      function cone(x, y) {
        var r = Math.sqrt(Math.pow(x - VX, 2) + Math.pow(y - BD, 2)) / rad;
        if (r >= 1) return 0;
        if (f < .25) return ht * (1 - r);                                   /* 순상: 완만한 직선 경사 */
        if (f < .6) return ht * Math.pow(1 - r, 1.7);                       /* 성층: 위로 갈수록 가팔라짐 */
        return ht * Math.sqrt(Math.max(0, 1 - r * r));                      /* 종상: 둥근 돔 */
      }
      function zOf(x, y) { return G + cone(x, y) + 2 * Math.sin(x / 19) * Math.cos(y / 23); }
      K.studio(ctx, 0, 0, LW, H, { x: I.P(BL, BD, 0).x - 110, y: I.P(BL, BD, 0).y - 14, rx: 250, ry: 42 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      ["front", "right"].forEach(function (side) {
        var zf = side === "front" ? function (u) { return zOf(u, BD); } : function (u) { return zOf(BL, u); };
        I.face(ctx, side, function (Lw) {
          ctx.save(); I.profile(ctx, side, zf, 0); ctx.clip();
          var g = ctx.createLinearGradient(0, 0, 0, G); g.addColorStop(0, "#5a4636"); g.addColorStop(1, "#8a7058");
          ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, G);
          ctx.fillStyle = f < .25 ? "#4a4440" : (f < .6 ? "#6a5a4e" : "#9a8a80"); ctx.fillRect(0, G, Lw, 240);
          if (side === "front") {
            if (f >= .25 && f < .6) { for (var b = 1; b < 9; b++) { ctx.fillStyle = b % 2 ? "rgba(200,180,150,.35)" : "rgba(40,30,25,.3)"; ctx.beginPath(); for (var u = 0; u <= Lw; u += 4) ctx.lineTo(u, G + cone(u, BD) * b / 9 - 3); for (u = Lw; u >= 0; u -= 4) ctx.lineTo(u, G + cone(u, BD) * b / 9 + 3); ctx.closePath(); ctx.fill(); } }
            else if (f < .25) { ctx.strokeStyle = "rgba(20,15,10,.35)"; ctx.lineWidth = 1; for (var b2 = 1; b2 < 6; b2++) { ctx.beginPath(); for (var u2 = 0; u2 <= Lw; u2 += 4) ctx.lineTo(u2, G + cone(u2, BD) * b2 / 6); ctx.stroke(); } }
            var mg = ctx.createRadialGradient(VX, 18, 3, VX, 18, 54); mg.addColorStop(0, "rgba(255,235,150,1)"); mg.addColorStop(.5, "rgba(255,110,40,.85)"); mg.addColorStop(1, "rgba(255,80,30,0)");
            ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(VX, 18, 60, 16, 0, 0, 6.2832); ctx.fill();
            ctx.strokeStyle = "rgba(255,120,40,.95)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(VX, 26); ctx.lineTo(VX, G + ht - 2); ctx.stroke();
          }
          ctx.restore();
        });
        I.shade(ctx, side, zf);
      });
      I.field(ctx, zOf, function (x, y, z, lt) { var h = z - G; return K.tint(h < 3 ? "#7a9e5a" : (f < .25 ? "#4a4440" : (f < .6 ? (h > ht * .75 ? "#8a8078" : "#6e6258") : "#a8988c")), lt); }, 44, 26);
      I.edges(ctx, zOf(BL, BD), zOf(BL, BD));
      var top = I.P(VX, BD, G + ht);
      ctx.save(); ctx.shadowColor = "#ff7a2c"; ctx.shadowBlur = 10;
      if (f < .25) {                                    /* 묽은 용암이 멀리 흐른다 */
        ctx.strokeStyle = "rgba(255,130,40,.95)"; ctx.lineWidth = 4;
        [[-1, .3], [.4, -1], [1, .2]].forEach(function (d) { ctx.beginPath(); for (var t = 0; t <= 1.01; t += .1) { var x = VX + d[0] * rad * .95 * t, y = BD - Math.abs(d[1]) * rad * .9 * t - (d[1] < 0 ? 0 : 0), p = I.P(x, Math.min(BD, y), zOf(x, Math.min(BD, y)) + 1); if (t) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); } ctx.stroke(); });
      } else if (f < .6) {
        ctx.strokeStyle = "rgba(255,130,40,.9)"; ctx.lineWidth = 3.5; ctx.beginPath();
        for (var t2 = 0; t2 <= 1.01; t2 += .1) { var x2 = VX - rad * .55 * t2, y2 = BD - rad * .3 * t2, p2 = I.P(x2, y2, zOf(x2, y2) + 1); if (t2) ctx.lineTo(p2.x, p2.y); else ctx.moveTo(p2.x, p2.y); }
        ctx.stroke();
      } else { var dg = ctx.createRadialGradient(top.x, top.y, 2, top.x, top.y, 16); dg.addColorStop(0, "#fff0b0"); dg.addColorStop(1, "rgba(200,64,26,0)"); ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(top.x, top.y, 16, 0, 6.2832); ctx.fill(); }
      ctx.restore();
      if (f >= .25) {                                    /* 화산재 구름 */
        var nP = f < .6 ? 5 : 8;
        for (var j = 0; j < nP; j++) {
          var px = top.x + (j % 3 - 1) * 12 + j * 3, py = top.y - 20 - j * 15, pr = 12 + j * 3;
          var ag = ctx.createRadialGradient(px - pr * .3, py - pr * .3, 2, px, py, pr);
          ag.addColorStop(0, "rgba(235,232,235,.95)"); ag.addColorStop(1, "rgba(130,120,130,.55)");
          ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(px, py, pr, 0, 6.2832); ctx.fill();
        }
      }
      ctx.restore();
      var box = [0, LW];
      I.label(ctx, VX, BD, 18, "마그마 방", 50, 40, "#ffd9b0", box);
      I.label(ctx, VX + rad * .45, BD, zOf(VX + rad * .45, BD), c.vo, 60, -30, "#ffd0a0", box);
      K.bigText(ctx, c.vo, 18, 46, 28, f < .25 ? "#ffb35a" : (f < .6 ? "#ffd35a" : "#ffffff"));
      K.bigText(ctx, c.m + " 마그마 · SiO₂ " + si + "%", 18, 78, 17, "#ffffff");
      K.warn(ctx, LW - 12, H - 12, "⚠ 높이·두께는 과장", "right");

      /* ── 오른쪽 : 흰 카드 — 점성 눈금 + 표 ── */
      var RX = LW + 10, gx = RX + 16, gw = W - gx - 16;
      K.card(ctx, RX, 0, W - RX, H, "마그마의 점성 (끈적임)");
      K.t(ctx, "10^" + lv.toFixed(1) + " Pa·s", W - 16, 28, { s: 14, w: "900", a: "right", c: LT.orange });
      var grad = ctx.createLinearGradient(gx, 0, gx + gw, 0);
      grad.addColorStop(0, "#3fb8c8"); grad.addColorStop(.5, "#f5c84b"); grad.addColorStop(1, "#e8593c");
      ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(gx, 48, gw, 14, 7); ctx.fill();
      var mx = gx + clamp((lv + 0.5) / 7.5, 0, 1) * gw;
      ctx.fillStyle = LT.ink; ctx.beginPath(); ctx.moveTo(mx, 66); ctx.lineTo(mx - 7, 77); ctx.lineTo(mx + 7, 77); ctx.closePath(); ctx.fill(); ctx.fillRect(mx - 1.5, 42, 3, 24);
      K.t(ctx, "묽다", gx, 92, { s: 10.5, c: LT.mute }); K.t(ctx, "끈적하다", gx + gw, 92, { s: 10.5, c: LT.mute, a: "right" });
      var rows = [["마그마", c.m + " 마그마"], ["SiO₂ 함량", si + " %"], ["온도", num(T) + " ℃"], ["녹아 있는 물", w.toFixed(1) + " %"],
                  ["분출 양식", c.st], ["화산체", c.vo], ["굳으면", c.rk], ["실제 예", c.ex]];
      rows.forEach(function (r, i2) {
        var y = 120 + i2 * 28;
        ctx.fillStyle = i2 % 2 ? "rgba(20,40,90,.04)" : "rgba(20,40,90,.08)"; ctx.beginPath(); ctx.roundRect(gx, y - 17, gw, 26, 6); ctx.fill();
        K.t(ctx, r[0], gx + 10, y + 1, { s: 11, c: LT.mute });
        kwrap(ctx, r[1], gx + 104, y + 1, gw - 112, 13, { s: 11.5, w: "800", c: i2 === 5 ? LT.orange : LT.ink });
      });
      var warn = (si < 55 && T < 950) ? "⚠ 현무암질 마그마는 보통 1,000~1,200 ℃입니다." :
                 ((si > 66 && T > 1050) ? "⚠ 유문암질 마그마는 보통 700~900 ℃입니다." : "");
      if (warn) lpill(ctx, warn, gx, 372, { s: 11, c: LT.red });
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
    var gas = 0, got = window.sthState("c3") || { big: false, dome: false }, fired = null, mv = null, cache = stash(canvas, W, H);
    var RA = K.rng(77), ASH = [];
    for (var aq = 0; aq < 30; aq++) ASH.push([RA(), RA()]);

    function plume(g) { return 6.5 * g; }
    /* 블록 모형: 백두산을 반으로 자른 블록(앞면 = 화산 한가운데 단면). 분연주 높이는 왼쪽 자와 같은 눈금(1 km = 7 px) */
    var I = K.iso({ ox: 214, oy: 300, s: 0.55, L: 400, D: 240 }), BL = I.L, BD = I.D, VX = 160, G = 34, KPX = 7, HT = 2.744 * KPX / 0.55;
    function cone(x, y) { var r = Math.sqrt(Math.pow(x - VX, 2) + Math.pow(y - BD, 2)) / 150; return r >= 1 ? 0 : HT * Math.pow(1 - r, 1.4); }
    function zOf(x, y) { return G + cone(x, y) + 2 * Math.sin(x / 17) * Math.cos(y / 21); }
    function paint() {
      var Hk = plume(gas), tt = mv ? mv.t : 0, LW = 620, i;
      var cal = fired && fired.h >= 25;
      ctx.clearRect(0, 0, W, H);
      var img = cache(gas + (cal ? "c" : ""), function (c) {
        var keep = ctx; ctx = c;
        K.studio(ctx, 0, 0, LW, H, { x: I.P(BL, BD, 0).x - 130, y: I.P(BL, BD, 0).y - 14, rx: 300, ry: 44 });
        ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
        ["front", "right"].forEach(function (side) {
          var zf = side === "front" ? function (u) { return zOf(u, BD) - (cal && Math.abs(u - VX) < 18 ? 6 : 0); } : function (u) { return zOf(BL, u); };
          I.face(ctx, side, function (Lw) {
            ctx.save(); I.profile(ctx, side, zf, 0); ctx.clip();
            var g = ctx.createLinearGradient(0, 0, 0, G); g.addColorStop(0, "#4a3a2e"); g.addColorStop(1, "#7a6450");
            ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, G); ctx.fillStyle = "#6e6258"; ctx.fillRect(0, G, Lw, 200);
            ctx.strokeStyle = "rgba(20,15,10,.3)"; ctx.lineWidth = 1; for (var y = 6; y < G; y += 7) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(Lw, y + 1); ctx.stroke(); }
            if (side === "front") {
              var mg = ctx.createRadialGradient(VX, 16, 3, VX, 16, 60); mg.addColorStop(0, "rgba(255,235,150,1)"); mg.addColorStop(.5, "rgba(255,110,40,.85)"); mg.addColorStop(1, "rgba(255,80,30,0)");
              ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(VX, 16, 66, 14, 0, 0, 6.2832); ctx.fill();
              ctx.strokeStyle = "rgba(255,120,40,.95)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(VX, 22); ctx.lineTo(VX, G + HT - 3); ctx.stroke();
            }
            ctx.restore();
          });
          I.shade(ctx, side, zf);
        });
        var ashR = gas > 1 ? 40 + gas * 40 : 0;
        I.field(ctx, function (x, y) { return zOf(x, y) - (cal && hyp(x - VX, y - BD) < 22 ? 7 * (1 - hyp(x - VX, y - BD) / 22) : 0); }, function (x, y, z, lt) {
          var h = z - G, ash = ashR > 0 && x > VX && Math.abs(y - BD + 30) < ashR * .5 && x - VX < ashR * 2.2;
          if (cal && hyp(x - VX, y - BD) < 16) return K.tint("#3a8ad0", lt);
          if (ash) return K.tint("#b8b2ae", lt);
          return K.tint(h > HT * .55 ? "#9a8e86" : (h > 4 ? "#6a8a50" : "#5a8a46"), lt);
        }, 50, 30);
        I.edges(ctx, zOf(BL, BD), zOf(BL, BD));
        ctx.restore();
        ctx = keep;
      });
      ctx.drawImage(img, 0, 0, W, H);
      var crater = I.P(VX, BD, G + HT), base = I.P(VX, BD, G);
      function HY(km) { return base.y - km * KPX; }
      /* 높이 자 */
      var rx = 40;
      ctx.strokeStyle = LT.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(rx, HY(0)); ctx.lineTo(rx, HY(40)); ctx.stroke();
      for (var h = 0; h <= 40; h += 10) { var yy = HY(h); K.line(ctx, { x: rx, y: yy }, { x: rx + 8, y: yy }, LT.ink, 1.5); K.t(ctx, h + " km", rx - 4, yy + 4, { s: 10.5, w: "800", a: "right", c: LT.mute }); }
      K.line(ctx, { x: rx, y: HY(25) }, { x: LW - 20, y: HY(25) }, LT.yellow, 2, [6, 5]);
      lpill(ctx, "946년 분화 수준 (약 25 km)", LW - 22, HY(25) - 8, { a: "right", s: 11, c: LT.yellow, box: [0, LW] });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      /* 마그마 방 속 기포 */
      I.face(ctx, "front", function () {
        var nb = Math.min(11, Math.round(gas * 2) + 1);
        for (var b = 0; b < nb; b++) { ctx.fillStyle = "rgba(255,250,235,.85)"; ctx.beginPath(); ctx.arc(VX - 50 + b * 10, 12 + (b % 3) * 3 + Math.sin(tt * 2 + b) * 1, 1.4 + gas * .35, 0, 6.2832); ctx.fill(); }
      });
      if (gas <= 1.0) {
        var dg = ctx.createRadialGradient(crater.x, crater.y, 2, crater.x, crater.y, 18); dg.addColorStop(0, "#fff0b0"); dg.addColorStop(.6, "#ff7a2c"); dg.addColorStop(1, "rgba(138,42,16,0)");
        ctx.fillStyle = dg; ctx.beginPath(); ctx.ellipse(crater.x, crater.y, 18, 11, 0, Math.PI, 0); ctx.fill();
      } else {
        var top = HY(Hk);
        for (i = 0; i < 18; i++) {
          var t = i / 17, yy2 = lerp(crater.y, top, t), rr = 8 + t * (14 + gas * 6), px = crater.x + Math.sin(i * 1.7 + tt * .8) * t * 18;
          var pg = ctx.createRadialGradient(px - rr * .3, yy2 - rr * .35, 2, px, yy2, rr);
          pg.addColorStop(0, "rgba(240,236,240,.95)"); pg.addColorStop(1, "rgba(120,110,120,.4)");
          ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, yy2, rr, 0, 6.2832); ctx.fill();
        }
        K.glow(ctx, crater.x, crater.y - 3, 5, "rgba(255,170,80,.95)", 4);
        var nk = Math.min(36, Math.round(gas * 6));
        for (var k = 0; k < nk; k++) {
          var u = (tt * .12 + ASH[k % 30][0]) % 1, ax = crater.x + 40 + u * 400, ay = lerp(top + 20, base.y + 60, u * .7 + ASH[k % 30][1] * .3);
          ctx.fillStyle = "rgba(110,100,120,.75)"; ctx.beginPath(); ctx.arc(ax, ay, 2.2, 0, 6.2832); ctx.fill();
        }
      }
      ctx.restore();
      var box = [0, LW];
      I.label(ctx, VX, BD, 16, "마그마 방 · 물 " + gas.toFixed(1) + "%", 60, 40, "#ffd9b0", box);
      I.label(ctx, VX + 60, BD, zOf(VX + 60, BD), cal ? "꼭대기가 내려앉은 칼데라 → 천지" : "백두산 2,744 m", 70, -20, "#f4e6c4", box);
      if (gas >= 2) lpill(ctx, "화산재·부석이 바람을 타고 동쪽으로", LW - 22, base.y + 36, { a: "right", s: 11, c: LT.violet, box: box });
      K.bigText(ctx, gas <= 1 ? "조용한 용암 돔" : "분연주 " + Hk.toFixed(1) + " km", 210, 46, 28, gas <= 1 ? "#ffb35a" : (Hk >= 25 ? "#ff9a8a" : "#ffd35a"));
      K.bigText(ctx, "SiO₂ 70% 백두산 마그마 · 물 " + gas.toFixed(1) + "%", 210, 78, 16, "#ffffff");
      K.warn(ctx, LW - 12, H - 12, "⚠ 높이는 실제 눈금 · 가로는 축소, 화산재 알갱이는 과장", "right");

      /* ── 오른쪽 : 흰 판정 카드 ── */
      var RX = LW + 10, px0 = RX + 16, px1 = W - 16, style = gas <= 1.0 ? "용암 돔" : (gas < 4 ? "중간 규모 분출" : "폭발적 분출");
      K.card(ctx, RX, 0, W - RX, H, "분출 판정");
      K.t(ctx, style, px0, 66, { s: 22, w: "900", c: gas <= 1 ? LT.orange : (Hk >= 25 ? LT.red : LT.ink) });
      K.row(ctx, "녹아 있는 물(기체)", gas.toFixed(1) + " %", px0, px1, 104, LT.blue);
      K.bar(ctx, px0, 113, px1 - px0, gas / 6, LT.blue);
      K.row(ctx, "분연주 높이", (gas <= 1 ? "—" : Hk.toFixed(1) + " km"), px0, px1, 150, LT.red);
      K.bar(ctx, px0, 159, px1 - px0, gas <= 1 ? 0 : Hk / 40, Hk >= 25 ? LT.red : LT.yellow);
      K.row(ctx, "946년 분화", "약 25 km", px0, px1, 196, LT.mute);
      if (fired) { K.t(ctx, "분출 기록", px0, 236, { s: 12, w: "800", c: LT.mute }); K.t(ctx, "물 " + fired.g.toFixed(1) + "% → " + (fired.g <= 1 ? "용암 돔" : "분연주 " + fired.h.toFixed(1) + " km"), px0, 258, { s: 13, w: "900", c: LT.ink }); }
      twrap(ctx, "끈적한 마그마 속 기체는 빠져나가지 못하고 갇혀 있다가, 압력을 이기는 순간 마그마를 잘게 부수며 터진다.", px0, 296, px1 - px0, 18, { s: 11.5, c: LT.mute });
      K.tip(ctx, gas <= 1 ? "기체가 적으면 조용히 밀려 나온다" : (Hk >= 25 ? "946년 규모의 대폭발" : "기체가 많을수록 높이 솟는다"), px0 - 4, H - 50, px1 - px0 + 8, gas <= 1 ? true : (Hk >= 25 ? false : null));
    }
    function draw() {
      paint();
      var Hk = plume(gas);
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
    mv = mover(canvas, paint, "분연주");
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
    /* 편광 현미경에서 보이는 광물 빛깔 */
    var PAL = { b: ["#3f6fd0", "#e8c84a", "#5a5a66", "#c85ab8", "#4ab88a", "#2a2a33"], a: ["#9aa0b0", "#e0b050", "#4a8ad0", "#3a3a44", "#d9d4c8", "#b85a9a"], r: ["#e8e4dc", "#c9c2b4", "#f0d0a8", "#8a8a96", "#4a4a52", "#d8e0ea"] };
    var RX0 = K.rng(91), JIT = [];
    for (var jq = 0; jq < 6000; jq++) JIT.push(RX0());
    function grain(d) { return 0.05 * Math.pow(10, 0.22 * d); }
    function years(d) { return 2 * Math.pow(10, 0.6 * d); }
    function rockOf(d) { return d <= 1.5 ? 0 : (d >= 5 ? 1 : -1); }

    function draw() {
      var g = grain(dep), yr = years(dep), kind = rockOf(dep), nm = NAMES[rk];
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽 : 지각을 잘라 낸 블록 모형 — 앞면 = 깊이 0~10 km 단면 ── */
      var LW = 452, i;
      var I = K.iso({ ox: 214, oy: 206, s: 0.6, L: 320, D: 170 }), BL = I.L, BD = I.D, ZT = 210, KM = 19, VX = 150;
      function cone(x, y) { var r = Math.sqrt(Math.pow(x - VX, 2) + Math.pow(y - BD, 2)) / 70; return r >= 1 ? 0 : 34 * Math.pow(1 - r, 1.5); }
      function zOf(x, y) { return ZT + cone(x, y) + 2 * Math.sin(x / 15) * Math.cos(y / 19); }
      var mz = ZT - dep * KM, cool = clamp(dep / 10, 0, 1);
      K.studio(ctx, 0, 0, LW, H, { x: I.P(BL, BD, 0).x - 100, y: I.P(BL, BD, 0).y - 12, rx: 230, ry: 38 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      ["front", "right"].forEach(function (side) {
        var zf = side === "front" ? function (u) { return zOf(u, BD); } : function (u) { return zOf(BL, u); };
        I.face(ctx, side, function (Lw) {
          ctx.save(); I.profile(ctx, side, zf, 0); ctx.clip();
          var bands = ["#5e4a3a", "#6e5846", "#7a6450", "#6a5644", "#8a735c"];
          for (var b = 0; b < 5; b++) { ctx.fillStyle = bands[b]; ctx.fillRect(0, b * ZT / 5, Lw, ZT / 5 + 1); }
          ctx.fillStyle = "#6a5a4e"; ctx.fillRect(0, ZT, Lw, 60);
          var R0 = K.rng(side === "front" ? 7 : 8); for (var q = 0; q < Lw * 2; q++) { ctx.fillStyle = R0() > .5 ? "rgba(255,255,255,.1)" : "rgba(20,10,5,.2)"; ctx.fillRect(R0() * Lw, R0() * ZT, 1.5, 1.5); }
          if (side === "front") {
            ctx.strokeStyle = "rgba(255,120,40,.85)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(VX, 0); ctx.lineTo(VX, zOf(VX, BD) - 2); ctx.stroke();
            var mg = ctx.createRadialGradient(VX, mz, 3, VX, mz, 60);
            mg.addColorStop(0, "rgba(255,235,150,1)"); mg.addColorStop(.5, "rgba(255," + Math.round(120 - cool * 40) + ",40,.9)"); mg.addColorStop(1, "rgba(255,80,30,0)");
            ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(VX, mz, 22 + dep * 4.5, 10 + dep * 1.6, 0, 0, 6.2832); ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1.2;
            for (var d = 0; d <= 10; d += 2) { var zz = ZT - d * KM; ctx.beginPath(); ctx.moveTo(0, zz); ctx.lineTo(10, zz); ctx.stroke(); }
          }
          ctx.restore();
        });
        I.shade(ctx, side, zf);
      });
      I.field(ctx, zOf, function (x, y, z, lt) { return K.tint(z - ZT > 8 ? "#6e6258" : "#6a9e4c", lt); }, 32, 18);
      I.edges(ctx, zOf(BL, BD), zOf(BL, BD));
      [[40, 40], [90, 120], [250, 50], [280, 130], [220, 20]].forEach(function (t) { I.tree(ctx, t[0], t[1], zOf(t[0], t[1]), .85); });
      if (dep <= 1.5) { var tp = I.P(VX, BD, zOf(VX, BD)); K.glow(ctx, tp.x, tp.y - 2, 5, "rgba(255,140,60,.95)", 3.4); }
      ctx.restore();
      var box = [0, LW];
      for (var d2 = 0; d2 <= 10; d2 += 2) { var tq = I.P(0, BD, ZT - d2 * KM); K.t(ctx, d2 + " km", tq.x - 6, tq.y + 4, { s: 10.5, w: "800", a: "right", c: LT.mute }); }
      I.label(ctx, VX, BD, mz, "깊이 " + dep.toFixed(1) + " km에서 굳는 마그마", 70, 26, "#ffe2c0", box);
      I.label(ctx, VX, BD, zOf(VX, BD), "지표", 60, -40, "#c8f5b0", box);
      K.bigText(ctx, kind === 0 ? "화산암 · " + nm[0] : (kind === 1 ? "심성암 · " + nm[1] : "반심성암"), 18, 46, 26, kind === 0 ? "#9fdcff" : (kind === 1 ? "#ffb35a" : "#ffffff"));
      K.bigText(ctx, "다 식는 데 약 " + (yr >= 10000 ? num(Math.round(yr / 1000)) + "천 년" : num(Math.round(yr)) + " 년"), 18, 78, 16, "#ffd35a");
      K.warn(ctx, LW - 12, H - 12, "⚠ 화산 크기·마그마 덩어리는 과장", "right");

      /* ── 오른쪽 : 흰 카드 — 현미경 ── */
      var RX = LW + 10, mcx = RX + (W - RX) / 2, mcy = 196, mr = 112;
      K.card(ctx, RX, 0, W - RX, H, "🔬 얇은 조각을 현미경으로 보면");
      var ring = ctx.createRadialGradient(mcx, mcy, mr, mcx, mcy, mr + 14);
      ring.addColorStop(0, "#5a5f6c"); ring.addColorStop(.5, "#c8ccd6"); ring.addColorStop(1, "#3a3f4c");
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 12; ctx.fillStyle = ring; ctx.beginPath(); ctx.arc(mcx, mcy, mr + 14, 0, 6.2832); ctx.fill(); ctx.restore();
      ctx.fillStyle = "#0a0a12"; ctx.beginPath(); ctx.arc(mcx, mcy, mr, 0, 6.2832); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(mcx, mcy, mr, 0, 6.2832); ctx.clip();
      var step = clamp(3 + g * 9, 3.5, 48), cols = PAL[rk], n = 0;
      for (var gy = -mr; gy < mr; gy += step) {
        for (var gx2 = -mr; gx2 < mr; gx2 += step) {
          var j1 = JIT[n % 6000] - .5, j2 = JIT[(n + 7) % 6000] - .5, j3 = JIT[(n + 13) % 6000] - .5, j4 = JIT[(n + 29) % 6000] - .5;
          var bx = mcx + gx2, by = mcy + gy, s = step;
          ctx.fillStyle = cols[Math.floor(JIT[(n + 3) % 6000] * cols.length)];
          ctx.beginPath();
          ctx.moveTo(bx + j1 * s * .3, by + j2 * s * .3); ctx.lineTo(bx + s + j3 * s * .3, by + j1 * s * .2);
          ctx.lineTo(bx + s + j4 * s * .3, by + s + j2 * s * .3); ctx.lineTo(bx + j3 * s * .2, by + s + j4 * s * .3); ctx.closePath(); ctx.fill();
          if (s > 8) { ctx.strokeStyle = "rgba(0,0,0,.45)"; ctx.lineWidth = 1; ctx.stroke(); }
          n++;
        }
      }
      var gl = ctx.createRadialGradient(mcx - mr * .4, mcy - mr * .4, 4, mcx, mcy, mr);
      gl.addColorStop(0, "rgba(255,255,255,.16)"); gl.addColorStop(1, "rgba(0,0,0,.35)");
      ctx.fillStyle = gl; ctx.fillRect(mcx - mr, mcy - mr, 2 * mr, 2 * mr);
      ctx.restore();
      K.line(ctx, { x: mcx - mr, y: mcy }, { x: mcx + mr, y: mcy }, "rgba(255,255,255,.35)", 1);
      K.line(ctx, { x: mcx, y: mcy - mr }, { x: mcx, y: mcy + mr }, "rgba(255,255,255,.35)", 1);
      K.t(ctx, "결정 크기 약 " + (g < 0.1 ? g.toFixed(3) : g.toFixed(2)) + " mm", mcx, mcy + mr + 44, { a: "center", s: 15, w: "900", c: LT.ink });
      K.t(ctx, kind === 0 ? "세립질 — 결정이 너무 작아 눈으로 구별하기 어렵다" : (kind === 1 ? "조립질 — 결정이 굵어 하나하나 보인다" : "중간 — 반심성암"), mcx, mcy + mr + 68, { s: 11, a: "center", c: LT.mute });
      K.t(ctx, "빛깔은 편광 현미경에서 광물마다 다르게 보이는 색(모식)", mcx, H - 12, { s: 10, a: "center", c: LT.dim });
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
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽 : 주시 곡선 ── */
      var LW = 540;
      K.studio(ctx, 0, 0, LW, H, null);
      lpill(ctx, "주시 곡선 — 진앙 거리에 따른 P파·S파 도착 시각", 16, 30, { s: 12.5, c: LT.blue });
      var g = K.chart(ctx, { x: 4, y: 44, w: LW - 10, h: H - 48, pl: 56, light: true, x0: 0, x1: 10000, y0: 0, y1: 25, xt: 4, yt: 5, xl: "진앙 거리 (km) →",
        xf: function (v0) { return num(v0); }, yf: function (v0) { return v0 + "분"; } });
      function curve(arr) { var p = []; for (var k = 0; k <= 100; k++) { var d = k / 100 * 10000; p.push([d, itp(arr, d)]); } return p; }
      K.plot(ctx, g, curve(SM), LT.blue, { light: true });
      K.plot(ctx, g, curve(PM), LT.red, { light: true });
      lpill(ctx, "S파", g.X(9000), g.Y(itp(SM, 9000)) - 14, { s: 12, a: "center", c: LT.blue });
      lpill(ctx, "P파", g.X(9000), g.Y(itp(PM, 9000)) + 26, { s: 12, a: "center", c: LT.red });
      var tP = itp(PM, dist), tS = itp(SM, dist), dt = tS - tP, mx = g.X(dist);
      K.line(ctx, { x: mx, y: g.B }, { x: mx, y: g.Y(tS) }, LT.line, 1.4, [3, 3]);
      K.bigText(ctx, "PS시 " + dt.toFixed(2) + "분", 74, 90, 28, Math.abs(dt - 5.2) <= 0.1 ? "#7ef0b8" : "#ffd35a");
      K.bigText(ctx, "진앙 거리 " + num(dist) + " km", 74, 120, 16, "#ffffff");
      K.glow(ctx, mx, g.Y(tP), 4.2, LT.red, 3.5);
      K.glow(ctx, mx, g.Y(tS), 4.2, LT.blue, 3.5);
      ctx.save(); ctx.strokeStyle = LT.yellow; ctx.lineWidth = 3; ctx.shadowColor = LT.yellow; ctx.shadowBlur = 2;
      ctx.beginPath(); ctx.moveTo(mx + 12, g.Y(tP)); ctx.lineTo(mx + 12, g.Y(tS)); ctx.stroke(); ctx.restore();
      var right = mx > 400;
      lpill(ctx, "PS시 " + dt.toFixed(2) + "분", right ? mx - 10 : mx + 22, (g.Y(tP) + g.Y(tS)) / 2 + 5, { s: 11.5, a: right ? "right" : "left", c: LT.yellow, box: [0, LW] });

      /* ── 오른쪽 : 지진 기록지 ── */
      var RX = LW + 8, rx = RX + 18, rw = W - rx - 18;
      K.card(ctx, RX, 0, W - RX, H, "이 거리에서 얻게 될 지진 기록지");
      ctx.fillStyle = "#fffdf6"; ctx.save(); ctx.shadowColor = "rgba(20,30,60,.18)"; ctx.shadowBlur = 2; ctx.beginPath(); ctx.roundRect(rx - 6, 50, rw + 12, 196, 8); ctx.fill(); ctx.restore();
      ctx.strokeStyle = "rgba(20,40,90,.10)"; ctx.lineWidth = 1;
      for (var gl = 0; gl <= 10; gl++) { var gx = rx + gl * rw / 10; ctx.beginPath(); ctx.moveTo(gx, 56); ctx.lineTo(gx, 240); ctx.stroke(); }
      var pf = 0.10 + 0.55 * (tP / 23), sf = 0.10 + 0.55 * (tS / 23);
      var pxp = rx + pf * rw, pxs = rx + sf * rw, mid = 150;
      ctx.save(); ctx.strokeStyle = LT.green; ctx.lineWidth = 1.5; ctx.shadowColor = LT.green; ctx.shadowBlur = 0; ctx.beginPath();
      for (var i = 0; i <= rw; i++) {
        var xx = rx + i, amp;
        if (xx < pxp) amp = 1.2 * Math.sin(i * 0.9);
        else if (xx < pxs) amp = 9 * Math.sin(i * 1.15) * Math.exp(-(xx - pxp) / 220);
        else amp = 34 * Math.sin(i * 0.72) * Math.exp(-(xx - pxs) / 150) + 4 * Math.sin(i * 0.3);
        if (i === 0) ctx.moveTo(xx, mid + amp); else ctx.lineTo(xx, mid + amp);
      }
      ctx.stroke(); ctx.restore();
      /* 가까운 거리에서는 두 도착 시각이 붙으므로 이름표를 위아래로 어긋나게 둔다 */
      [[pxp, "P파 도착", LT.red], [pxs, "S파 도착", LT.blue]].forEach(function (q, qi) {
        K.line(ctx, { x: q[0], y: 56 }, { x: q[0], y: 240 }, q[2], 2);
        lpill(ctx, q[1], q[0] + 6, 74 + qi * 24, { s: 10.5, c: q[2], box: [RX, W] });
      });
      K.bracket(ctx, pxp, pxs, 262, LT.yellow, null, false);
      lpill(ctx, "초기 미동 계속 시간 (PS시) = " + dt.toFixed(2) + "분", rx, 296, { s: 11.5, c: LT.yellow, box: [RX, W] });
      K.t(ctx, "P파 도착 뒤 S파가 오기 전까지가 초기 미동,", rx, 326, { s: 11, c: LT.mute });
      K.t(ctx, "S파 도착 뒤의 큰 흔들림이 주요동입니다.", rx, 344, { s: 11, c: LT.mute });
      lpill(ctx, (okA ? "✔ " : "") + "찾아야 할 값 : PS시 5.20분", rx, 384, { s: 12.5, c: okA ? LT.green : LT.yellow, box: [RX, W] });

      var ok = Math.abs(dt - 5.2) <= 0.1;
      $("d-read").innerHTML =
        "<span class='k'>P파 도착</span><span class='v r'>" + tP.toFixed(2) + " 분</span>" +
        "<span class='k'>S파 도착</span><span class='v b'>" + tS.toFixed(2) + " 분</span>" +
        "<span class='k'>PS시</span><span class='v y'>" + dt.toFixed(2) + " 분</span>" +
        "<span class='sub'>진앙 거리 " + num(dist) + " km · 우리 기록 5.20분</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "기록과 같습니다" : (dt < 5.2 ? "기록보다 짧습니다 · 더 멀리" : "기록보다 깁니다 · 더 가까이")) + "</span>";
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
        "맞습니다. P파는 진행 방향으로 밀고 당기는 종파, S파는 진행 방향에 수직으로 흔드는 횡파이고, 같은 암석 속에서는 P파가 S파보다 빠릅니다. 그 시간 차가 PS시입니다.",
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
    var SC = 0.075, EPI = [300, 225];
    var ST = [
      { n: "㉮", d: 800, a: -20, ps: 1.20 },
      { n: "㉯", d: 1500, a: 205, ps: 2.10 },
      { n: "㉰", d: 2600, a: 55, ps: 3.45 }
    ];
    ST.forEach(function (s) {
      s.x = EPI[0] + s.d * SC * Math.cos(s.a * D2R);
      s.y = EPI[1] + s.d * SC * Math.sin(s.a * D2R);
    });
    var r = [2000, 2000, 2000], got = window.sthState("d3") || [0, 0, 0];
    var COLS = [LT.orange, LT.green, LT.violet];

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 580, bx = 45, by = 45, bw = 520, bh = 360, ZT = 40;
      /* 블록 모형: 지도(가로 520 × 세로 360)를 윗면에 깐 땅 블록. 원은 윗면 위에 그린다 */
      var I = K.iso({ ox: 300, oy: 92, s: 0.6, L: bw, D: bh }), C0 = 0.866 * 0.6, S0 = 0.6;
      function top(fn) { ctx.save(); ctx.transform(C0, .5 * S0, -C0, .5 * S0, 300 - C0 * (bx - by) * 1, 92 - ZT * S0 - .5 * S0 * (bx + by)); fn(); ctx.restore(); }
      function TP(mx, my) { return I.P(mx - bx, my - by, ZT); }
      K.studio(ctx, 0, 0, LW, H, { x: I.P(bw, bh, 0).x - 130, y: I.P(bw, bh, 0).y - 10, rx: 300, ry: 44 });
      ["front", "right"].forEach(function (side) {
        I.face(ctx, side, function (Lw) {
          var g = ctx.createLinearGradient(0, 0, 0, ZT); g.addColorStop(0, "#5a4636"); g.addColorStop(1, "#8a7058");
          ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, ZT);
          ctx.strokeStyle = "rgba(30,20,10,.3)"; ctx.lineWidth = 1; for (var y = 8; y < ZT; y += 9) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(Lw, y + 1); ctx.stroke(); }
        });
        I.shade(ctx, side, function () { return ZT; });
      });
      top(function () {
        var mg = ctx.createLinearGradient(bx, by, bx + bw, by + bh); mg.addColorStop(0, "#5aa0d8"); mg.addColorStop(1, "#2f74b8");
        ctx.fillStyle = mg; ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = "#7fae5a"; ctx.beginPath(); ctx.ellipse(250, 230, 150, 110, -.4, 0, 6.2832); ctx.fill();
        ctx.beginPath(); ctx.ellipse(470, 130, 90, 60, .3, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.28)"; ctx.lineWidth = 1;
        for (var gx = bx; gx <= bx + bw; gx += 37.5) { ctx.beginPath(); ctx.moveTo(gx, by); ctx.lineTo(gx, by + bh); ctx.stroke(); }
        for (var gy = by; gy <= by + bh; gy += 37.5) { ctx.beginPath(); ctx.moveTo(bx, gy); ctx.lineTo(bx + bw, gy); ctx.stroke(); }
        ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
        ST.forEach(function (s, i) {
          ctx.strokeStyle = COLS[i]; ctx.lineWidth = got[i] ? 5 : 3.4; ctx.globalAlpha = got[i] ? 1 : .8;
          ctx.beginPath(); ctx.arc(s.x, s.y, r[i] * SC, 0, Math.PI * 2); ctx.stroke();
        });
        ctx.restore(); ctx.globalAlpha = 1;
      });
      I.edges(ctx, ZT, ZT);
      var all = got[0] && got[1] && got[2];
      ST.forEach(function (s, i) {                      /* 관측소: 작은 탑 모형 */
        var p = TP(s.x, s.y);
        ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.beginPath(); ctx.ellipse(p.x + 3, p.y + 1, 8, 3, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = COLS[i]; ctx.beginPath(); ctx.moveTo(p.x - 6, p.y); ctx.lineTo(p.x, p.y - 22); ctx.lineTo(p.x + 6, p.y); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(p.x, p.y - 22, 3.4, 0, 6.2832); ctx.fill();
        lpill(ctx, s.n + " 관측소" + (got[i] ? " ✔" : ""), p.x + 10, p.y - 18, { s: 11.5, c: COLS[i], box: [0, LW] });
      });
      if (all) {
        var e = TP(EPI[0], EPI[1]);
        K.glow(ctx, e.x, e.y, 6, "rgba(255,230,140,.98)", 5);
        K.spikes(ctx, e.x, e.y, 16, .8);
        lpill(ctx, "★ 진앙", e.x - 14, e.y + 26, { s: 13, a: "right", c: LT.red });
      }
      K.bigText(ctx, all ? "세 원이 한 점에서 만났다" : "원 " + (got[0] + got[1] + got[2]) + " / 3 맞춤", 18, 46, 24, all ? "#7ef0b8" : "#ffd35a");
      K.bigText(ctx, "눈금 한 칸 = 500 km", 18, 76, 15, "#ffffff");

      /* ── 오른쪽 : 흰 카드 — PS시 → 거리 환산 그래프 ── */
      var RX = LW + 10;
      K.card(ctx, RX, 0, W - RX, H, "PS시 → 진앙 거리 환산");
      var g = K.chart(ctx, { x: RX + 4, y: 44, w: W - RX - 10, h: H - 48, pl: 54, light: true, x0: 0, x1: 6, y0: 0, y1: 5000, xt: 3, yt: 5, xl: "PS시 →",
        xf: function (v0) { return v0 + "분"; }, yf: function (v0) { return num(v0); } });
      K.t(ctx, "거리 (km)", g.L + 6, g.T + 12, { s: 10.5, c: LT.mute });
      var pts = [];
      for (var k = 0; k <= 100; k++) { var dd = k / 100 * 5000; pts.push([ps(dd), dd]); }
      K.plot(ctx, g, pts, LT.green, { light: true });
      ST.forEach(function (s, i) {
        K.line(ctx, { x: g.X(s.ps), y: g.B }, { x: g.X(s.ps), y: g.Y(s.d) }, COLS[i], 1.6, [4, 4]);
        K.line(ctx, { x: g.X(s.ps), y: g.Y(s.d) }, { x: g.L, y: g.Y(s.d) }, COLS[i], 1.6, [4, 4]);
        ctx.fillStyle = COLS[i]; ctx.beginPath(); ctx.arc(g.X(s.ps), g.B, 4, 0, 6.2832); ctx.fill();
        lpill(ctx, s.n + " " + s.ps.toFixed(2) + "분", g.R - 4, g.Y(s.d) + 5, { s: 10.5, a: "right", c: COLS[i], box: [RX, W] });
      });
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
    var ang = 0, got = window.sthState("d4") || { both: false, none: false, ponly: false }, cache = stash(canvas, W, H);
    function pOK(a) { return !(a >= 103 && a <= 142); }
    function sOK(a) { return a < 103; }
    function layers(cx, cy, R) {
      var rO = R * (6371 - 2890) / 6371, rI = R * (6371 - 5150) / 6371;
      var mg = ctx.createRadialGradient(cx, cy, rO, cx, cy, R); mg.addColorStop(0, "#d0703a"); mg.addColorStop(1, "#5a2a18");
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill();
      var og = ctx.createRadialGradient(cx, cy, rI, cx, cy, rO); og.addColorStop(0, "#ffd070"); og.addColorStop(1, "#e0702a");
      ctx.save(); ctx.shadowColor = "#ffa040"; ctx.shadowBlur = 16; ctx.fillStyle = og; ctx.beginPath(); ctx.arc(cx, cy, rO, 0, 6.2832); ctx.fill(); ctx.restore();
      var ig = ctx.createRadialGradient(cx - rI * .3, cy - rI * .3, 2, cx, cy, rI); ig.addColorStop(0, "#ffffff"); ig.addColorStop(.5, "#fff0c0"); ig.addColorStop(1, "#d8b060");
      ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(cx, cy, rI, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "#8a6a50"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R - 1.5, 0, 6.2832); ctx.stroke();
      return { rO: rO, rI: rI };
    }

    var EL = [{ r: 1, c: ["#7a5a3a", "#8a6a48"] }, { r: .985, c: ["#a8482a", "#d8844e"] }, { r: (6371 - 2890) / 6371, c: ["#ffb040", "#ffe08a"] }, { r: (6371 - 5150) / 6371, c: ["#fffaf0", "#e8d4a0"] }];
    function earthSurf(lo, la, lt) { var ld = landAt(lo, la); return ld === 2 ? K.tint("#f2f6fb", lt) : (ld ? mixc("#6a9e4c", "#a8915a", (wob(lo, la) + 1) / 2, lt) : mixc("#2f7fd8", "#15488f", (wob(lo, la) + 1) / 2, lt)); }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 560, cx = 262, cy = 242, R = 178, A0 = -18 * D2R, SP = Math.sin(.22), CP = Math.cos(.22);
      var img = cache("g", function (c) {
        var keep = ctx; ctx = c;
        K.studio(ctx, 0, 0, LW, H, null);
        globe(ctx, cx, cy, R, { phi: .22, a0: -18, a1: 98, surf: earthSurf, layers: EL });
        ctx = keep;
      });
      ctx.drawImage(img, 0, 0, W, H);
      function wallT(fn) { ctx.save(); ctx.transform(R * Math.cos(A0), R * Math.sin(A0) * SP, 0, -R * CP, cx, cy); fn(); ctx.restore(); }
      function wp(u, v) { return { x: cx + R * u * Math.cos(A0), y: cy - R * (v * CP - u * Math.sin(A0) * SP) }; }
      var rO = (6371 - 2890) / 6371;
      wallT(function () {
        var lw = 1 / R;
        /* 그림자대 띠(벽의 바깥 테두리) */
        function band(a0, a1, col, off) { ctx.strokeStyle = col; ctx.lineWidth = 8 * lw; ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(0, 0, 1 + off, (90 - a0) * D2R, (90 - a1) * D2R, true); ctx.stroke(); ctx.globalAlpha = 1; }
        band(103, 180, "#1c7ed6", .03); band(103, 142, "#e03131", .075);
        /* 맨틀만 지나는 지진파 */
        ctx.strokeStyle = "rgba(255,248,235,.95)"; ctx.lineWidth = 2 * lw;
        [20, 45, 70, 95].forEach(function (a) {
          var t = a * D2R, h = t / 2, cr = Math.cos(h) - .28 * Math.sin(h);
          ctx.beginPath(); ctx.moveTo(0, 1); ctx.quadraticCurveTo(cr * Math.sin(h), cr * Math.cos(h), Math.sin(t), Math.cos(t)); ctx.stroke();
        });
        /* 핵을 지나며 꺾인 P파 */
        ctx.strokeStyle = "#f59f00"; ctx.lineWidth = 2.4 * lw;
        [150, 168].forEach(function (a) {
          var t = a * D2R, a1 = .3 * t, a2 = .72 * t;
          ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(rO * Math.sin(a1), rO * Math.cos(a1)); ctx.lineTo(rO * Math.sin(a2), rO * Math.cos(a2)); ctx.lineTo(Math.sin(t), Math.cos(t)); ctx.stroke();
        });
        /* S파는 외핵에서 멈춘다 */
        ctx.strokeStyle = "rgba(28,126,214,.95)"; ctx.lineWidth = 2 * lw; ctx.setLineDash([6 * lw, 4 * lw]);
        var ts = 125 * D2R, as = .34 * ts; ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(rO * Math.sin(as), rO * Math.cos(as)); ctx.stroke(); ctx.setLineDash([]);
        var xp = rO * Math.sin(as), yp = rO * Math.cos(as); ctx.strokeStyle = "#1c7ed6"; ctx.lineWidth = 3 * lw;
        ctx.beginPath(); ctx.moveTo(xp - .03, yp - .03); ctx.lineTo(xp + .03, yp + .03); ctx.moveTo(xp + .03, yp - .03); ctx.lineTo(xp - .03, yp + .03); ctx.stroke();
      });
      var src = wp(0, 1), ob = ang <= 180 ? wp(Math.sin(ang * D2R), Math.cos(ang * D2R)) : null;
      K.glow(ctx, src.x, src.y, 5, "rgba(255,90,90,.98)", 4);
      lpill(ctx, "진원 0°", src.x, src.y - 16, { a: "center", s: 11.5, c: LT.red });
      if (ob) {
        K.line(ctx, wp(0, 0), ob, "rgba(255,255,255,.8)", 1.5, [4, 4]);
        ctx.fillStyle = "#12203a"; ctx.beginPath(); ctx.moveTo(ob.x - 7, ob.y + 4); ctx.lineTo(ob.x, ob.y - 12); ctx.lineTo(ob.x + 7, ob.y + 4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(ob.x, ob.y - 12, 3, 0, 6.2832); ctx.fill();
        lpill(ctx, "관측소 " + ang + "°", clamp(ob.x + 14, 0, LW - 90), ob.y + 5, { s: 12.5, c: LT.ink, box: [0, LW] });
      }
      var box = [0, LW];
      pin(ctx, wp(.62, .55), "맨틀 (고체)", 80, -40, "#ffe2c8", box);
      pin(ctx, wp(.3, -.38), "외핵 (액체)", -230, 30, "#fff0c0", box);
      pin(ctx, wp(.1, -.06), "내핵 (고체)", -200, -40, "#fff4d6", box);
      lpill(ctx, "■ P파 그림자대 103°~142°", 16, H - 40, { s: 11, c: LT.red, box: box });
      lpill(ctx, "■ S파 그림자대 103°~180°", 16, H - 14, { s: 11, c: LT.blue, box: box });
      var p = pOK(ang), s = sOK(ang);
      K.bigText(ctx, "각거리 " + ang + "°", 18, 46, 28, "#ffffff");
      K.bigText(ctx, (p ? "P파 ○" : "P파 ✕") + "  ·  " + (s ? "S파 ○" : "S파 ✕"), 18, 80, 18, p && s ? "#7ef0b8" : (!p && !s ? "#ff9a8a" : "#ffd35a"));
      K.warn(ctx, LW - 12, 30, "⚠ 지진파 경로는 모식", "right");

      /* ── 오른쪽 : 흰 판정 카드 ── */
      var RX = LW + 10, x0 = RX + 16, bw = W - x0 - 16;
      K.card(ctx, RX, 0, W - RX, H, "이 관측소에 도착하는 지진파");
      [[p, p ? "✅ P파 도달" : "🚫 P파 도달 못 함", p ? "종파 · 고체와 액체를 모두 지난다" : "핵에서 크게 굴절해 이 구간을 비켜 간다", 46],
       [s, s ? "✅ S파 도달" : "🚫 S파 도달 못 함", s ? "횡파 · 고체만 지난다" : "액체인 외핵을 지나지 못한다", 116]].forEach(function (b) {
        ctx.fillStyle = b[0] ? "#e7f7f0" : "#fdeee4"; ctx.beginPath(); ctx.roundRect(x0, b[3], bw, 60, 12); ctx.fill();
        K.t(ctx, b[1], x0 + 14, b[3] + 26, { s: 15, w: "900", c: b[0] ? "#0f766e" : "#b4400c" });
        K.t(ctx, b[2], x0 + 14, b[3] + 46, { s: 11, c: LT.mute });
      });
      kwrap(ctx, "S파 그림자대가 P파 그림자대보다 훨씬 넓습니다. 두 그림자대의 모양이 서로 다르다는 점이 결정적인 단서입니다.", x0, 214, bw, 20, { s: 12, w: "700", c: LT.ink });
      K.t(ctx, "주황 선 = 핵을 지나며 꺾인 P파", x0, 318, { s: 11.5, w: "800", c: LT.yellow });
      K.t(ctx, "파란 점선 ✕ = 외핵에서 멈춘 S파", x0, 340, { s: 11.5, w: "800", c: LT.blue });
      K.t(ctx, "흰 선 = 맨틀만 지나는 지진파", x0, 362, { s: 11.5, w: "800", c: LT.mute });
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
    var dep = 0, got = window.sthState("d5") || { m: false, g: false, l: false }, cache = stash(canvas, W, H);
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
      if (d < 35) return { n: "지각", s: "고체", c: KC.orange, t: "대륙 지각은 약 35 km, 해양 지각은 5~10 km로 훨씬 얇습니다." };
      if (d < 2890) return { n: "맨틀", s: "고체", c: "#ff9a6a", t: "지구 부피의 약 82%를 차지합니다. 고체이지만 아주 오랜 시간에 걸쳐 천천히 대류합니다." };
      if (d < 5150) return { n: "외핵", s: "액체", c: KC.yellow, t: "액체 철·니켈. S파가 지나지 못합니다. 이 액체의 대류가 지구 자기장을 만듭니다." };
      return { n: "내핵", s: "고체", c: "#fff4d6", t: "엄청난 압력 때문에 다시 고체가 됩니다. 1936년 레만이 찾아냈습니다." };
    }

    function draw() {
      var L = layer(dep), p = vP(dep), s = vS(dep);
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽 : 반쪽 자른 지구 모형 — 벽에 깊이 고리 ── */
      var LW = 388, cx = 188, cy = 196, R = 128, A0 = -18 * D2R, SP = Math.sin(.3), CP = Math.cos(.3);
      var img = cache("g", function (c) {
        var keep = ctx; ctx = c;
        K.studio(ctx, 0, 0, LW, H, null);
        globe(ctx, cx, cy, R, { phi: .3, a0: -18, a1: 98,
          surf: function (lo, la, lt) { var ld = landAt(lo, la); return ld === 2 ? K.tint("#f2f6fb", lt) : (ld ? mixc("#6a9e4c", "#a8915a", (wob(lo, la) + 1) / 2, lt) : mixc("#2f7fd8", "#15488f", (wob(lo, la) + 1) / 2, lt)); },
          layers: [{ r: 1, c: ["#7a5a3a", "#8a6a48"] }, { r: .985, c: ["#a8482a", "#d8844e"] }, { r: (6371 - 2890) / 6371, c: ["#ffb040", "#ffe08a"] }, { r: (6371 - 5150) / 6371, c: ["#fffaf0", "#e8d4a0"] }] });
        ctx = keep;
      });
      ctx.drawImage(img, 0, 0, W, H);
      var rr = Math.max(.004, (6371 - dep) / 6371);
      [[-18, 1], [98, 0]].forEach(function (q) {
        var a = q[0] * D2R;
        ctx.save(); ctx.transform(R * Math.cos(a), R * Math.sin(a) * SP, 0, -R * CP, cx, cy);
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3.4 / R; ctx.shadowColor = "#1c7ed6"; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(0, 0, rr, -Math.PI / 2, Math.PI / 2, false); ctx.stroke(); ctx.restore();
      });
      function wp(u, v) { return { x: cx + R * u * Math.cos(A0), y: cy - R * (v * CP - u * Math.sin(A0) * SP) }; }
      var box = [0, LW];
      pin(ctx, wp(.2, .8), "맨틀", 70, -40, "#ffe2c8", box);
      pin(ctx, wp(.4, -.15), "외핵", 90, 30, "#fff0c0", box);
      pin(ctx, wp(.08, -.06), "내핵", 120, 64, "#fff4d6", box);
      K.bigText(ctx, num(dep) + " km · " + L.n, 16, 44, 24, "#ffd35a");
      K.bigText(ctx, L.s + " — S파 " + (s > 0 ? "통과" : "통과 못 함"), 16, 74, 16, "#ffffff");
      kwrap(ctx, L.t, 16, H - 46, LW - 32, 18, { s: 11.5, w: "700", c: LT.ink });

      /* ── 오른쪽 : 흰 카드 — 속도-깊이 그래프 ── */
      var RX = LW + 10;
      K.card(ctx, RX, 0, W - RX, H, "깊이에 따른 지진파의 속도");
      var g = K.chart(ctx, { x: RX + 4, y: 44, w: 330, h: H - 48, pl: 56, light: true, x0: 0, x1: 16, y0: 6400, y1: 0, xt: 4, yt: 4, xl: "속도 (km/s) →",
        yf: function (v0) { return num(Math.round(v0)); } });
      K.t(ctx, "깊이 ↓ (km)", g.L + 6, g.T + 12, { s: 10.5, c: LT.mute });
      [[35, "모호면", got.m], [2890, "구텐베르크면", got.g], [5150, "레만면", got.l]].forEach(function (q) {
        var c = q[2] ? LT.green : LT.yellow, yy = g.Y(q[0]);
        K.line(ctx, { x: g.L, y: yy }, { x: W - 14, y: yy }, c, 1.8, [5, 4]);
        lpill(ctx, (q[2] ? "✔ " : "") + q[1] + " " + num(q[0]) + " km", W - 16, q[0] < 100 ? yy + 22 : yy - 8, { s: 11, a: "right", c: c, box: [RX, W] });
      });
      function vcurve(f, col) {
        [[0, 34], [35, 2889], [2890, 5149], [5150, 6371]].forEach(function (sg) {
          var pts = [];
          for (var k = 0; k <= 40; k++) { var d = lerp(sg[0], sg[1], k / 40), u = f(d); if (u <= 0) return; pts.push([u, d]); }
          K.plot(ctx, g, pts, col, { light: true });
        });
      }
      vcurve(vP, LT.red); vcurve(vS, LT.blue);
      lpill(ctx, "P파", g.X(9.6), g.Y(1500), { s: 11.5, a: "center", c: LT.red });
      lpill(ctx, "S파", g.X(3.6), g.Y(1500), { s: 11.5, a: "center", c: LT.blue });
      K.line(ctx, { x: g.L, y: g.Y(dep) }, { x: g.R, y: g.Y(dep) }, LT.ink, 1.2, [2, 3]);
      ctx.fillStyle = LT.red; ctx.beginPath(); ctx.arc(g.X(p), g.Y(dep), 5, 0, 6.2832); ctx.fill();
      if (s > 0) { ctx.fillStyle = LT.blue; ctx.beginPath(); ctx.arc(g.X(s), g.Y(dep), 5, 0, 6.2832); ctx.fill(); }
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
      { id: "w2", label: "지진파가 알려 준 것", hint: "P파와 S파가 각각 어디까지 전달되는지를 보고 무엇을 알 수 있는지 쓰세요." },
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
    { key: "r4", label: "④ 지구 속을 본 지진파" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
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
    { key: "r4", label: "④ 지구 속을 본 지진파" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "네 사건을 꿰는 한 문장" }
});

})();
