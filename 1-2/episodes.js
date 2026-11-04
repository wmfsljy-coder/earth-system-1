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
    var lat = 0, got = window.sthState("a2") || { a: false, b: false };

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 440, cx = 214, cy = 192, R = 102, I = incl(lat);
      K.stage(ctx, 0, 0, LW, H, "space", { seed: 31, title: "지구 자기장과 자침" });
      /* 쌍극자 자기력선: r = L·R·cos²(위도) — 바깥에서는 남쪽에서 나와 북쪽으로 들어간다 */
      [1.32, 1.68, 2.08].forEach(function (L, li) {
        var l0 = Math.acos(Math.sqrt(1 / L));
        [1, -1].forEach(function (side) {
          ctx.save(); ctx.strokeStyle = "rgba(127,211,255," + (.55 - li * .1) + ")"; ctx.lineWidth = 1.6; ctx.shadowColor = KC.blue; ctx.shadowBlur = 6;
          ctx.beginPath();
          for (var k = 0; k <= 60; k++) {
            var la = -l0 + 2 * l0 * k / 60, r = L * R * Math.cos(la) * Math.cos(la);
            var x = cx + side * r * Math.cos(la), y = cy - r * Math.sin(la);
            if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
          }
          ctx.stroke(); ctx.restore();
          var ex = cx + side * L * R;
          K.arrow(ctx, { x: ex, y: cy + 7 }, { x: ex, y: cy - 7 }, KC.blue, 2, 8);
        });
      });
      /* 지구 */
      var g = ctx.createRadialGradient(cx - R * .38, cy - R * .42, R * .1, cx, cy, R);
      g.addColorStop(0, "#bfe6ff"); g.addColorStop(.45, "#2f78c8"); g.addColorStop(1, "#0f2a66");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.clip();
      ctx.fillStyle = "rgba(90,170,100,.55)";
      ctx.beginPath(); ctx.ellipse(cx - 30, cy - 40, 34, 22, .5, 0, 6.2832); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 26, cy + 30, 26, 34, -.3, 0, 6.2832); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = "rgba(160,210,255,.7)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, R + 1, 0, 6.2832); ctx.stroke();
      K.line(ctx, { x: cx - R - 8, y: cy }, { x: cx + R + 8, y: cy }, "rgba(255,255,255,.55)", 1.2, [4, 4]);
      K.pill(ctx, "적도 0°", 16, cy + 4, { s: 10.5, c: KC.mute });
      K.pill(ctx, "N 자북극", cx, cy - R - 14, { a: "center", s: 11, c: KC.ink });
      K.pill(ctx, "S", cx, cy + R + 26, { a: "center", s: 11, c: KC.ink });

      /* 그 위도의 자침 */
      var th = lat * D2R, sx = cx + R * Math.cos(th), sy = cy - R * Math.sin(th);
      var tg = [-Math.sin(th), -Math.cos(th)], iw = [-Math.cos(th), Math.sin(th)], ir = I * D2R;
      var dx = Math.cos(ir) * tg[0] + Math.sin(ir) * iw[0], dy = Math.cos(ir) * tg[1] + Math.sin(ir) * iw[1];
      K.line(ctx, { x: sx - tg[0] * 52, y: sy - tg[1] * 52 }, { x: sx + tg[0] * 52, y: sy + tg[1] * 52 }, "rgba(255,255,255,.75)", 1.4, [3, 3]);
      var aH = Math.atan2(tg[1], tg[0]), aN = Math.atan2(dy, dx), dA = aN - aH;
      while (dA > Math.PI) dA -= 2 * Math.PI; while (dA < -Math.PI) dA += 2 * Math.PI;
      if (Math.abs(I) > .5) K.wedge(ctx, sx, sy, aH, aH + dA, 34, "rgba(255,211,107,.28)", KC.yellow);
      var nx = -dy, ny = dx, L1 = 30;
      ctx.fillStyle = KC.red; ctx.beginPath(); ctx.moveTo(sx + dx * L1, sy + dy * L1); ctx.lineTo(sx + nx * 5, sy + ny * 5); ctx.lineTo(sx - nx * 5, sy - ny * 5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#e8ecff"; ctx.beginPath(); ctx.moveTo(sx - dx * L1, sy - dy * L1); ctx.lineTo(sx + nx * 5, sy + ny * 5); ctx.lineTo(sx - nx * 5, sy - ny * 5); ctx.closePath(); ctx.fill();
      K.glow(ctx, sx, sy, 2.4, "rgba(255,255,255,.95)", 3);
      K.pill(ctx, "복각 " + I.toFixed(1) + "°", sx + 22, sy + (lat >= 0 ? 34 : -22), { s: 12.5, c: KC.yellow, box: [0, LW] });
      K.pill(ctx, "● 빨간 끝 = 자침의 N극", 16, H - 14, { s: 10.5, c: KC.red });

      /* ── 오른쪽 : 복각 - 위도 그래프 ── */
      var RX = LW + 8;
      K.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 2, title: "위도에 따른 복각 — tan(복각) = 2 × tan(위도)" });
      var gr = K.chart(ctx, { x: RX + 4, y: 44, w: W - RX - 10, h: H - 48, x0: -90, x1: 90, y0: -90, y1: 90, xt: 4, yt: 4, xl: "위도 →",
        xf: function (v0) { return Math.round(v0) + "°"; }, yf: function (v0) { return Math.round(v0) + "°"; } });
      K.line(ctx, { x: gr.L, y: gr.Y(0) }, { x: gr.R, y: gr.Y(0) }, KC.line, 1);
      K.line(ctx, { x: gr.X(0), y: gr.T }, { x: gr.X(0), y: gr.B }, KC.line, 1);
      var pts = [];
      for (var k2 = 0; k2 <= 180; k2++) pts.push([-90 + k2, incl(-90 + k2)]);
      K.plot(ctx, gr, pts, KC.green);
      [[73.9, "㉮ 73.9°", got.a], [36.1, "㉯ 36.1°", got.b]].forEach(function (t) {
        var yy = gr.Y(t[0]), c = t[2] ? KC.green : KC.yellow;
        K.line(ctx, { x: gr.L, y: yy }, { x: gr.R, y: yy }, c, 1.8, [5, 4]);
        K.pill(ctx, (t[2] ? "✔ " : "") + t[1], gr.L + 10, yy - 8, { s: 11, c: c });
      });
      K.line(ctx, { x: gr.X(lat), y: gr.Y(I) }, { x: gr.X(lat), y: gr.B }, KC.red, 1.2, [3, 3]);
      K.glow(ctx, gr.X(lat), gr.Y(I), 4.5, KC.red, 4);

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
      K.stage(ctx, 0, 0, LW, H, "night", { seed: 12, title: "북극에서 내려다본 지도 (모식도)" });
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
      K.stage(ctx, RX, 0, W - RX, H, "space", { seed: 44, title: "기준판 — 시대별 자북극이 있던 자리" });
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
    function draw() {
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽 : 해령의 고지자기 줄무늬 ── */
      var LW = 448;
      K.stage(ctx, 0, 0, LW, H, "ocean", { seed: 8, title: "해령을 가로지르는 고지자기 줄무늬 (위에서 본 모습)" });
      var rx = 224, top = 62, bot = 262, wdt = 12, half = 16 * wdt;
      /* 자기장 역전은 일정한 간격으로 오지 않는다 — 줄무늬 폭이 들쭉날쭉하다 */
      var RUNS = [3, 1, 2, 4, 1, 2, 3, 1, 1, 3, 2, 2], RS = 25;
      function pol(n) { var m = ((n % RS) + RS) % RS, k = 0; while (m >= RUNS[k]) { m -= RUNS[k]; k++; } return k % 2; }
      var pv = 4 + va * 3, run = T * pv, born = Math.floor(run / wdt), frac = run - born * wdt;
      var gN = ctx.createLinearGradient(0, top, 0, bot); gN.addColorStop(0, "#f2f5ff"); gN.addColorStop(1, "#b9c4e6");
      var gR = ctx.createLinearGradient(0, top, 0, bot); gR.addColorStop(0, "#26306a"); gR.addColorStop(1, "#141a40");
      ctx.save(); ctx.beginPath(); ctx.roundRect(rx - half, top, 2 * half, bot - top, 6); ctx.clip();
      for (var i = 0; i <= 17; i++) {
        var n = born - i, x = frac + i * wdt;                /* 해령에서 x 만큼 떨어진 줄무늬, n 은 그 줄무늬가 태어난 차례 */
        ctx.fillStyle = pol(n) === 0 ? gN : gR;
        ctx.fillRect(rx + x - wdt, top, wdt, bot - top); ctx.fillRect(rx - x, top, wdt, bot - top);
      }
      ctx.restore();
      ctx.strokeStyle = "rgba(160,200,255,.4)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(rx - half, top, 2 * half, bot - top, 6); ctx.stroke();
      var rg = ctx.createLinearGradient(rx - 8, 0, rx + 8, 0); rg.addColorStop(0, "rgba(255,90,40,0)"); rg.addColorStop(.5, "rgba(255,170,80,1)"); rg.addColorStop(1, "rgba(255,90,40,0)");
      ctx.save(); ctx.shadowColor = "#ff7a3c"; ctx.shadowBlur = 14; ctx.fillStyle = rg; ctx.fillRect(rx - 8, top - 8, 16, bot - top + 16); ctx.restore();
      for (var mq = 0; mq < 8; mq++) {
        var pm = (T * 0.6 + mq / 8) % 1;
        ctx.globalAlpha = 0.3 + 0.6 * (1 - pm);
        K.glow(ctx, rx + Math.sin(mq * 2.3 + T * 3) * 3, bot + 6 - pm * (bot - top + 6), 2.2, "rgba(255,220,140,.95)", 3);
      }
      ctx.globalAlpha = 1;
      K.arrow(ctx, { x: rx - 24, y: bot + 14 }, { x: rx - 90, y: bot + 14 }, KC.ink, 2.4, 9);
      K.arrow(ctx, { x: rx + 24, y: bot + 14 }, { x: rx + 90, y: bot + 14 }, KC.ink, 2.4, 9);
      /* 해령 위 나침반: 지금 만들어지는 줄무늬의 극 */
      var nowNorm = pol(born) === 0;
      K.arrow(ctx, { x: rx + 52, y: nowNorm ? 54 : 38 }, { x: rx + 52, y: nowNorm ? 36 : 56 }, nowNorm ? KC.yellow : KC.violet, 3, 8);
      K.pill(ctx, "해령", rx, 48, { a: "center", s: 12, c: KC.orange });
      K.pill(ctx, nowNorm ? "지금 정자극기" : "지금 역자극기", rx + 64, 52, { s: 10.5, c: nowNorm ? KC.yellow : KC.violet, box: [0, LW] });
      K.pill(ctx, "밝은 띠 = 정자극기 · 어두운 띠 = 역자극기 · 해령을 축으로 좌우 대칭", 16, bot + 50, { s: 10.5, c: KC.ink, box: [0, LW] });
      K.t(ctx, "← 나이 많음", 16, bot + 76, { s: 11, c: KC.mute });
      K.t(ctx, "나이 많음 →", LW - 16, bot + 76, { s: 11, c: KC.mute, a: "right" });
      K.t(ctx, "해령에서 멀어질수록 해양 지각의 나이가 많아집니다.", 16, bot + 100, { s: 11.5, c: KC.ink });

      /* ── 오른쪽 : 나이 - 거리 그래프 ── */
      var RX = LW + 8, AMAX = 80, DMAX = 2000;
      K.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 6, title: "해양 지각의 나이와 해령으로부터의 거리" });
      var g = K.chart(ctx, { x: RX + 4, y: 42, w: W - RX - 10, h: H - 46, pl: 58, x0: 0, x1: AMAX, y0: 0, y1: DMAX, xt: 4, yt: 4, xl: "나이 (백만 년) →",
        yf: function (v0) { return num(v0); } });
      K.t(ctx, "거리 (km)", g.L + 6, g.T + 12, { s: 10.5, c: KC.mute });
      function line(rate, col) {
        var aEnd = Math.min(AMAX, DMAX / (rate * 10));
        K.plot(ctx, g, [[0, 0], [aEnd, rate * 10 * aEnd]], col);
      }
      function pts(arr, col) {
        arr.forEach(function (q) {
          ctx.fillStyle = "#0b1030"; ctx.beginPath(); ctx.arc(g.X(q[0]), g.Y(q[1]), 7, 0, 6.2832); ctx.fill();
          ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke();
          K.glow(ctx, g.X(q[0]), g.Y(q[1]), 2.2, col, 2.6);
        });
      }
      line(va, KC.yellow); line(vp, KC.blue);
      pts(ATL, KC.yellow); pts(PAC, KC.blue);
      K.pill(ctx, "● 대서양 관측점 · 계산선 " + va.toFixed(1) + " cm/년", g.R - 8, g.B - 40, { a: "right", s: 11, c: KC.yellow, box: [RX, W] });
      K.pill(ctx, "● 동태평양 관측점 · 계산선 " + vp.toFixed(1) + " cm/년", g.R - 8, g.B - 14, { a: "right", s: 11, c: KC.blue, box: [RX, W] });
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

    function draw() {
      var u = speed(slab);
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽 : 단면도 ── */
      var LW = 528, sea = 92, top = 44;
      K.stage(ctx, 0, 0, LW, H, "night", { seed: 33 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      var wg = ctx.createLinearGradient(0, top, 0, sea + 30); wg.addColorStop(0, "#1a4f8a"); wg.addColorStop(1, "#0d2f5c");
      ctx.fillStyle = wg; ctx.fillRect(0, top, LW, sea + 30 - top);
      var mg = ctx.createLinearGradient(0, sea + 50, 0, H); mg.addColorStop(0, "#8a3a1c"); mg.addColorStop(1, "#2e0c04");
      ctx.fillStyle = mg; ctx.fillRect(0, sea + 50, LW, H - sea - 50);
      /* 해령 */
      var rg = ctx.createLinearGradient(86, sea + 4, 86, sea + 52); rg.addColorStop(0, "#ffb070"); rg.addColorStop(1, "#a83a18");
      ctx.save(); ctx.shadowColor = "#ff7a3c"; ctx.shadowBlur = 14; ctx.fillStyle = rg;
      ctx.beginPath(); ctx.moveTo(86, sea + 6); ctx.lineTo(50, sea + 52); ctx.lineTo(122, sea + 52); ctx.closePath(); ctx.fill(); ctx.restore();
      /* 판 */
      ctx.fillStyle = slabFill(ctx, 0, sea + 30, 0, sea + 52, "ocean"); ctx.fillRect(86, sea + 30, 300, 22);
      var fp = 4 + u * 5;
      ctx.save(); ctx.beginPath(); ctx.rect(86, sea + 30, 300, 22); ctx.clip();
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2;
      for (var k = 0; k < 14; k++) { var fx = 86 + ((T * fp + k * 24) % 312); ctx.beginPath(); ctx.moveTo(fx, sea + 33); ctx.lineTo(fx, sea + 49); ctx.stroke(); }
      ctx.restore();
      var sl = 24 + slab * 1.1;
      ctx.save(); ctx.translate(386, sea + 32); ctx.rotate(0.95);
      var sg = ctx.createLinearGradient(0, 0, sl, 0); sg.addColorStop(0, "#5f7f8a"); sg.addColorStop(1, "#23343c");
      ctx.fillStyle = sg; ctx.fillRect(0, 0, sl, 22);
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2;
      for (var k2 = 0; k2 < 8; k2++) { var sx = (T * fp + k2 * 24) % (sl + 24) - 4; if (sx < sl) { ctx.beginPath(); ctx.moveTo(sx, 3); ctx.lineTo(sx, 19); ctx.stroke(); } }
      ctx.restore();
      /* 반대편 판 */
      ctx.fillStyle = slabFill(ctx, 0, sea + 20, 0, sea + 52, "land");
      ctx.beginPath(); ctx.moveTo(404, sea + 26); ctx.lineTo(LW, sea + 18); ctx.lineTo(LW, sea + 56); ctx.lineTo(420, sea + 56); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.save(); ctx.strokeStyle = KC.red; ctx.lineWidth = 3; ctx.shadowColor = KC.red; ctx.shadowBlur = 8;
      ctx.setLineDash([9, 6]); ctx.lineDashOffset = -T * fp; ctx.beginPath(); ctx.moveTo(126, sea + 41); ctx.lineTo(186, sea + 41); ctx.stroke(); ctx.restore();
      K.arrow(ctx, { x: 180, y: sea + 41 }, { x: 200, y: sea + 41 }, KC.red, 3, 11);
      if (slab > 0) {
        var aL = Math.min(sl, 90);
        K.arrow(ctx, { x: 404, y: sea + 58 }, { x: 404 + aL * 0.58, y: sea + 58 + aL * 0.82 }, KC.violet, 3.5, 12);
        K.pill(ctx, "판 끌기", 410 + aL * .58, sea + 78 + aL * .82, { s: 11.5, c: KC.violet, box: [0, LW] });
      }
      K.pill(ctx, "해령 밀기와 판 끌기", 16, 28, { s: 13, c: KC.blue });
      K.pill(ctx, "해령", 86, sea - 2, { a: "center", s: 11, c: KC.orange });
      K.pill(ctx, "▼ 해구", 392, sea - 2, { a: "center", s: 11, c: KC.blue });
      K.pill(ctx, "해령 밀기", 128, sea + 78, { s: 11, c: KC.red });
      K.pill(ctx, "맨틀", 30, H - 50, { s: 11, c: "#ffcfae" });
      K.pill(ctx, "섭입한 판의 길이 = 섭입대 비율 " + slab + "%", 16, H - 16, { s: 11.5, c: KC.ink });

      /* ── 오른쪽 : 막대 그래프 ── */
      var RX = LW + 8, x0 = RX + 112, bw = W - x0 - 46;
      K.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 9, title: "실제 판의 이동 속도 (cm/년)" });
      REAL.forEach(function (r, i) {
        var y = 64 + i * 34;
        K.t(ctx, r[0], x0 - 8, y + 12, { s: 11, a: "right", c: KC.mute });
        gbar(ctx, x0, y, bw, 14, r[1] / 10, KC.blue);
        K.t(ctx, r[1].toFixed(1), x0 + bw + 8, y + 12, { s: 11, w: "800", c: KC.ink });
      });
      var yM = 64 + REAL.length * 34 + 18;
      K.line(ctx, { x: RX + 16, y: yM - 12 }, { x: W - 16, y: yM - 12 }, KC.line, 1, [3, 4]);
      K.t(ctx, "내 모형", x0 - 8, yM + 15, { s: 12, w: "900", a: "right", c: KC.orange });
      gbar(ctx, x0, yM, bw, 20, u / 10, KC.orange);
      K.t(ctx, u.toFixed(1), x0 + bw + 8, yM + 15, { s: 12, w: "900", c: KC.orange });
      K.t(ctx, "파랑 = 실제 측정값 · 주황 = 내 모형", RX + 16, H - 18, { s: 10.5, c: KC.dim });
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
    var vv = 5.0, dir = 270, T = 0, got = window.sthState("b4") || { v: 0, d: 0 };
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

    function draw() {
      ctx.clearRect(0, 0, W, H);
      K.stage(ctx, 0, 0, W, H, "ocean", { seed: 61, title: "하와이–엠퍼러 해산열 (위에서 본 그림)" });
      /* 방위 표시 */
      glass(ctx, 34, 52, 92, 92);
      ctx.strokeStyle = "rgba(200,220,255,.35)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(80, 100, 30, 0, 6.2832); ctx.stroke();
      K.arrow(ctx, { x: 80, y: 104 }, { x: 80, y: 74 }, KC.red, 2.4, 9);
      K.t(ctx, "북", 80, 68, { s: 10.5, a: "center", c: KC.ink });
      K.t(ctx, "서", 44, 104, { s: 10.5, a: "center", c: KC.mute });
      K.t(ctx, "동", 116, 104, { s: 10.5, a: "center", c: KC.mute });
      K.t(ctx, "남", 80, 140, { s: 10.5, a: "center", c: KC.mute });

      /* 관측된 해산열 */
      var p0 = obsPos(0), pb = obsPos(3500), pe = obsPos(6000);
      ctx.save(); ctx.strokeStyle = "rgba(220,200,160,.28)"; ctx.lineWidth = 14; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(pb[0], pb[1]); ctx.lineTo(pe[0], pe[1]); ctx.stroke(); ctx.restore();
      for (var sm = 1; sm < 24; sm++) { var q0 = obsPos(sm * 250); mound(q0[0], q0[1], 3 + (sm % 3), false); }
      var labs = [];
      OBS.forEach(function (q) {
        var p = obsPos(q[1]);
        mound(p[0], p[1], 8, false);
        var lx = clamp(p[0] + 14, 0, 700), ly = p[1] - 10;
        labs.push([lx, ly]);
        K.pill(ctx, q[0] + " Ma · " + num(q[1]) + " km", lx, ly, { s: 10.5, c: "#f0e2c4" });
      });

      /* 내 모형 */
      var m0 = modPos(0, vv, dir), mb = modPos(BEND, vv, dir), me = modPos(ENDA, vv, dir);
      ctx.save(); ctx.strokeStyle = KC.orange; ctx.lineWidth = 3; ctx.setLineDash([7, 5]); ctx.shadowColor = KC.orange; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(m0[0], m0[1]); ctx.lineTo(mb[0], mb[1]); ctx.lineTo(me[0], me[1]); ctx.stroke(); ctx.restore();
      [28, 47, 81].forEach(function (a) { var p = modPos(a, vv, dir); K.glow(ctx, p[0], p[1], 4, KC.orange, 3.2); });

      /* 열점에서 태어난 화산이 판에 실려 내 모형의 길을 따라 옮겨 간다(1초에 1,000만 년) */
      for (var gk = 0; gk < 4; gk++) {
        var age = ((T * 10) + gk * ENDA / 4) % ENDA, gp = modPos(age, vv, dir), gr = age < 3 ? 4 + age * 2 : Math.max(4, 10 - age * 0.06);
        mound(gp[0], gp[1], gr, age < 3);
        if (gk === 0) {
          var hit = labs.some(function (l) { return Math.abs(gp[0] + 10 - l[0]) < 110 && Math.abs(gp[1] + 4 - l[1]) < 18; });
          if (!hit && gp[1] > 40 && gp[0] < 820) K.t(ctx, Math.round(age) + "백만 년", gp[0] + 10, gp[1] + 4, { s: 10.5, c: KC.blue });
        }
      }
      /* 열점 */
      var pr = 22 + 5 * Math.sin(T * 3);
      var hg = ctx.createRadialGradient(HX, HY, 2, HX, HY, pr * 1.8); hg.addColorStop(0, "rgba(255,240,180,1)"); hg.addColorStop(.35, "rgba(255,140,50,.7)"); hg.addColorStop(1, "rgba(255,90,30,0)");
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(HX, HY, pr * 1.8, 0, 6.2832); ctx.fill();
      K.pill(ctx, "🔥 열점 (거의 고정) · 하와이섬", HX - 22, HY + 30, { s: 11.5, a: "right", c: KC.orange });

      K.pill(ctx, "● 관측된 해산열", 640, 60, { s: 11.5, c: "#f0e2c4" });
      K.pill(ctx, "┄ 내 모형", 640, 86, { s: 11.5, c: KC.orange });
      K.warn(ctx, W - 16, 28, "⚠ 화산 크기는 실제 비율이 아님", "right");
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
      /* ── 왼쪽 : 화산체 단면 ── */
      var LW = 480, baseY = 318, cx = 240, half = 210 - f * 128, ht = 54 + f * 190;
      K.stage(ctx, 0, 0, LW, H, "night", { seed: 71 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      var sk = ctx.createLinearGradient(0, 0, 0, baseY); sk.addColorStop(0, "#0a0f30"); sk.addColorStop(1, "#4a3a6a");
      ctx.fillStyle = sk; ctx.fillRect(0, 0, LW, baseY);
      var gd = ctx.createLinearGradient(0, baseY, 0, H); gd.addColorStop(0, "#4a3426"); gd.addColorStop(1, "#1e140e");
      ctx.fillStyle = gd; ctx.fillRect(0, baseY, LW, H - baseY);
      /* 마그마 방과 통로 */
      var mg = ctx.createRadialGradient(cx, baseY + 54, 4, cx, baseY + 54, 70);
      mg.addColorStop(0, "rgba(255,230,140,1)"); mg.addColorStop(.45, "rgba(255,110,40,.85)"); mg.addColorStop(1, "rgba(255,80,30,0)");
      ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(cx, baseY + 54, 74, 32, 0, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "rgba(255,130,50,.85)"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, baseY + 30); ctx.lineTo(cx, baseY - ht + 6); ctx.stroke();
      /* 화산체 */
      var vg = ctx.createLinearGradient(cx - half, 0, cx + half, 0);
      vg.addColorStop(0, "#2e2620"); vg.addColorStop(.45, "#6e5a4a"); vg.addColorStop(1, "#2a201a");
      ctx.fillStyle = vg; ctx.beginPath(); ctx.moveTo(cx - half, baseY); ctx.lineTo(cx, baseY - ht); ctx.lineTo(cx + half, baseY); ctx.closePath(); ctx.fill();
      if (f >= 0.25 && f < 0.6) {           /* 성층 화산: 층리 */
        ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 1.5;
        for (var ly = 1; ly < 6; ly++) { var yy = baseY - ht * ly / 6, hw = half * (1 - ly / 6); ctx.beginPath(); ctx.moveTo(cx - hw, yy + 6); ctx.lineTo(cx + hw, yy + 6); ctx.stroke(); }
      }
      ctx.save(); ctx.shadowColor = "#ff7a2c"; ctx.shadowBlur = 12;
      if (f < 0.25) {
        ctx.strokeStyle = "rgba(255,150,60,.9)"; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(cx, baseY - ht); ctx.lineTo(cx - half * .92, baseY - 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, baseY - ht); ctx.lineTo(cx + half * .92, baseY - 3); ctx.stroke();
      } else if (f < 0.6) {
        ctx.strokeStyle = "rgba(255,150,60,.85)"; ctx.lineWidth = 4.5;
        ctx.beginPath(); ctx.moveTo(cx, baseY - ht); ctx.lineTo(cx - half * .55, baseY - 5); ctx.stroke();
      } else {
        var dg = ctx.createRadialGradient(cx, baseY - ht, 2, cx, baseY - ht, 14); dg.addColorStop(0, "#fff0b0"); dg.addColorStop(1, "#c8401a");
        ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(cx, baseY - ht, 11, Math.PI, 0); ctx.fill();
      }
      ctx.restore();
      if (f >= 0.25) {                       /* 화산재 구름 */
        var nP = f < 0.6 ? 4 : 7;
        for (var j = 0; j < nP; j++) {
          var px = cx + (j % 3 - 1) * 12 + j * 2, py = baseY - ht - 22 - j * 18, pr = 15 + j * 3.4;
          var ag = ctx.createRadialGradient(px - pr * .3, py - pr * .3, 2, px, py, pr);
          ag.addColorStop(0, "rgba(210,205,210,.85)"); ag.addColorStop(1, "rgba(120,110,120,.15)");
          ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(px, py, pr, 0, 6.2832); ctx.fill();
        }
      }
      ctx.restore();
      K.pill(ctx, "만들어질 화산체", 16, 28, { s: 13, c: KC.blue });
      K.pill(ctx, c.vo, cx + half * .5 + 20, baseY - ht * .5, { s: 14, c: KC.orange, box: [0, LW] });
      K.pill(ctx, "마그마 방", cx, baseY + 92, { a: "center", s: 11, c: "#ffd9b0" });

      /* ── 오른쪽 : 점성 눈금 + 표 ── */
      var RX = LW + 8, gx = RX + 16, gw = W - gx - 16;
      K.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 3, title: "마그마의 점성 (끈적임)" });
      K.pill(ctx, "점성 ≈ 10^" + lv.toFixed(1) + " Pa·s", W - 16, 28, { s: 12.5, a: "right", c: KC.orange });
      var grad = ctx.createLinearGradient(gx, 0, gx + gw, 0);
      grad.addColorStop(0, "#3fd3c8"); grad.addColorStop(.5, "#ffd36b"); grad.addColorStop(1, "#ff6b4a");
      ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(gx, 52, gw, 16, 8); ctx.fill();
      var mx = gx + clamp((lv + 0.5) / 7.5, 0, 1) * gw;
      ctx.save(); ctx.shadowColor = "#fff"; ctx.shadowBlur = 10; ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.moveTo(mx, 72); ctx.lineTo(mx - 7, 82); ctx.lineTo(mx + 7, 82); ctx.closePath(); ctx.fill();
      ctx.fillRect(mx - 1.5, 46, 3, 26); ctx.restore();
      K.t(ctx, "묽다", gx, 96, { s: 10.5, c: KC.mute });
      K.t(ctx, "끈적하다", gx + gw, 96, { s: 10.5, c: KC.mute, a: "right" });

      var rows = [["마그마", c.m + " 마그마"], ["SiO₂ 함량", si + " %"], ["온도", num(T) + " ℃"], ["녹아 있는 물", w.toFixed(1) + " %"],
                  ["분출 양식", c.st], ["화산체", c.vo], ["굳으면", c.rk], ["실제 예", c.ex]];
      rows.forEach(function (r, i) {
        var y = 124 + i * 28;
        ctx.fillStyle = i % 2 ? "rgba(255,255,255,.05)" : "rgba(10,14,40,.5)"; ctx.beginPath(); ctx.roundRect(gx, y - 17, gw, 26, 6); ctx.fill();
        K.t(ctx, r[0], gx + 10, y + 1, { s: 11, c: KC.mute });
        kwrap(ctx, r[1], gx + 104, y + 1, gw - 112, 13, { s: 11.5, w: "800", c: i === 5 ? KC.orange : KC.ink });
      });
      var warn = (si < 55 && T < 950) ? "⚠ 현무암질 마그마는 보통 1,000~1,200 ℃입니다." :
                 ((si > 66 && T > 1050) ? "⚠ 유문암질 마그마는 보통 700~900 ℃입니다." : "");
      if (warn) K.pill(ctx, warn, gx, 372, { s: 11, c: KC.red, bg: "rgba(60,10,20,.7)" });

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
    var gas = 0, got = window.sthState("c3") || { big: false, dome: false }, fired = null, mv = null;
    var RA = K.rng(77), ASH = [];
    for (var aq = 0; aq < 30; aq++) ASH.push([RA(), RA()]);

    function plume(g) { return 6.5 * g; }
    function paint() {
      var Hk = plume(gas), sky = 316, tt = mv ? mv.t : 0;
      function HY(km) { return sky - km / 40 * (sky - 50); }
      ctx.clearRect(0, 0, W, H);
      K.stage(ctx, 0, 0, W, H, "night", { seed: 81 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, H, 14); ctx.clip();
      var sk = ctx.createLinearGradient(0, 0, 0, sky); sk.addColorStop(0, "#050822"); sk.addColorStop(.6, "#1b3270"); sk.addColorStop(1, "#4f86c6");
      ctx.fillStyle = sk; ctx.fillRect(0, 0, W, sky);
      var gd = ctx.createLinearGradient(0, sky, 0, H); gd.addColorStop(0, "#4a3426"); gd.addColorStop(1, "#1a100a");
      ctx.fillStyle = gd; ctx.fillRect(0, sky, W, H - sky);
      /* 높이 눈금 */
      for (var h = 0; h <= 40; h += 10) {
        var y = HY(h);
        K.line(ctx, { x: 70, y: y }, { x: W - 20, y: y }, "rgba(200,215,255,.14)", 1);
        K.t(ctx, h + " km", 64, y + 4, { s: 10.5, c: KC.mute, a: "right", w: "600" });
      }
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(70, 50); ctx.lineTo(70, sky); ctx.stroke();
      var y25 = HY(25);
      K.line(ctx, { x: 70, y: y25 }, { x: W - 20, y: y25 }, KC.yellow, 2, [6, 5]);
      /* 마그마 방과 기포 */
      var cx = 430, base = sky, sum = HY(2.7);
      var mg = ctx.createRadialGradient(cx, base + 46, 4, cx, base + 46, 96);
      mg.addColorStop(0, "rgba(255,230,140,1)"); mg.addColorStop(.5, "rgba(255,110,40,.8)"); mg.addColorStop(1, "rgba(255,80,30,0)");
      ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(cx, base + 46, 100, 32, 0, 0, 6.2832); ctx.fill();
      var nb = Math.min(11, Math.round(gas * 2) + 1);
      for (var b = 0; b < nb; b++) {
        ctx.fillStyle = "rgba(255,250,235,.8)"; ctx.beginPath(); ctx.arc(cx - 66 + b * 13, base + 40 + (b % 3) * 9 + Math.sin(tt * 2 + b) * 1.5, 2 + gas * 0.7, 0, 6.2832); ctx.fill();
      }
      /* 화산체 (실제 높이 약 2.7 km를 같은 눈금으로 그렸습니다) */
      var vg = ctx.createLinearGradient(cx - 160, 0, cx + 160, 0); vg.addColorStop(0, "#2e2620"); vg.addColorStop(.5, "#6e5a4a"); vg.addColorStop(1, "#2a201a");
      ctx.fillStyle = vg; ctx.beginPath(); ctx.moveTo(cx - 160, base); ctx.lineTo(cx - 30, sum); ctx.lineTo(cx + 30, sum); ctx.lineTo(cx + 160, base); ctx.closePath(); ctx.fill();
      if (gas <= 1.0) {
        var dg = ctx.createRadialGradient(cx, sum, 2, cx, sum, 30); dg.addColorStop(0, "#fff0b0"); dg.addColorStop(.6, "#ff7a2c"); dg.addColorStop(1, "#8a2a10");
        ctx.save(); ctx.shadowColor = "#ff7a2c"; ctx.shadowBlur = 14; ctx.fillStyle = dg;
        ctx.beginPath(); ctx.ellipse(cx, sum, 30, 18, 0, Math.PI, 0); ctx.fill(); ctx.restore();
      } else {
        var top = HY(Hk);
        for (var i = 0; i < 16; i++) {
          var t = i / 15, yy = lerp(sum, top, t), rr = 14 + t * (16 + gas * 8), px = cx + Math.sin(i * 1.7 + tt * .8) * t * 24;
          var pg = ctx.createRadialGradient(px - rr * .3, yy - rr * .35, 2, px, yy, rr);
          pg.addColorStop(0, "rgba(225,220,225,.9)"); pg.addColorStop(1, "rgba(110,100,110,.25)");
          ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, yy, rr, 0, 6.2832); ctx.fill();
        }
        K.glow(ctx, cx, sum - 4, 6, "rgba(255,170,80,.95)", 4);
        /* 화산재 낙하 — 바람을 타고 오른쪽으로 */
        var nk = Math.min(30, Math.round(gas * 5));
        for (var k = 0; k < nk; k++) {
          var u = (tt * .12 + ASH[k][0]) % 1, ax = cx + 60 + u * 380, ay = lerp(top + 20, base - 6, (u * .7 + ASH[k][1] * .3));
          ctx.fillStyle = "rgba(190,170,210,.7)"; ctx.beginPath(); ctx.arc(ax, ay, 2.2, 0, 6.2832); ctx.fill();
        }
      }
      ctx.restore();
      K.pill(ctx, "SiO₂ 70%인 백두산 마그마 — 물의 양에 따른 분출", 16, 28, { s: 13, c: KC.blue });
      K.pill(ctx, "946년 백두산 분화 수준 (약 25 km)", 84, y25 - 8, { s: 11, c: KC.yellow });
      K.pill(ctx, "백두산 2,744 m", cx - 170, base - 8, { s: 10.5, a: "right", c: KC.ink });
      if (gas <= 1.0) K.pill(ctx, "🥞 용암 돔 — 조용히 밀려 올라옵니다", cx, sum - 30, { s: 13, a: "center", c: KC.orange });
      else {
        K.pill(ctx, "분연주 " + Hk.toFixed(1) + " km", cx + 96 + gas * 8, clamp(HY(Hk) + 6, 70, sky - 20), { s: 13, c: KC.orange });
        if (gas >= 0.5) K.pill(ctx, "화산재·부석이 바람을 타고 날아갑니다", W - 16, base + 34, { s: 11, a: "right", c: KC.violet });
      }
      K.pill(ctx, "마그마 방 — 녹아 있는 물 " + gas.toFixed(1) + "%", cx, base + 94, { s: 11, a: "center", c: "#ffd9b0" });
      K.warn(ctx, 16, H - 14, "⚠ 높이는 실제 눈금, 화산재 알갱이 크기는 과장");
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
      /* ── 왼쪽 : 지각 단면 ── */
      var LW = 452, x0 = 56, x1 = 436, top = 64, bot = 318;
      K.stage(ctx, 0, 0, LW, H, "earth", { seed: 5, title: "마그마가 굳은 자리" });
      var bands = ["#5a4636", "#4c3a2c", "#43332a", "#3a2c24", "#332620"];
      bands.forEach(function (c, i) { ctx.fillStyle = c; ctx.fillRect(x0, top + i * (bot - top) / 5, x1 - x0, (bot - top) / 5 + 1); });
      ctx.fillStyle = "rgba(255,255,255,.05)"; for (var f = 0; f < 40; f++) ctx.fillRect(x0 + (f * 53) % (x1 - x0), top + (f * 31) % (bot - top), 18, 2);
      for (var d = 0; d <= 10; d += 2) {
        var y = top + d / 10 * (bot - top);
        K.line(ctx, { x: x0, y: y }, { x: x1, y: y }, "rgba(255,230,200,.12)", 1);
        K.t(ctx, d + " km", x0 - 6, y + 4, { s: 10, c: KC.mute, a: "right", w: "600" });
      }
      var sg = ctx.createLinearGradient(0, top - 10, 0, top); sg.addColorStop(0, "#6fbf5a"); sg.addColorStop(1, "#3a6a2a");
      ctx.fillStyle = sg; ctx.fillRect(x0, top - 10, x1 - x0, 10);
      var my = top + dep / 10 * (bot - top), cool = clamp(dep / 10, 0, 1);
      var mg = ctx.createRadialGradient(246, my, 4, 246, my, 80);
      mg.addColorStop(0, "rgba(255,235,150,1)"); mg.addColorStop(.5, "rgba(255," + Math.round(120 - cool * 40) + ",40,.85)"); mg.addColorStop(1, "rgba(255,80,30,0)");
      ctx.save(); ctx.beginPath(); ctx.rect(x0, top - 10, x1 - x0, bot - top + 10); ctx.clip();
      ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(246, my, 80, 28, 0, 0, 6.2832); ctx.fill(); ctx.restore();
      K.pill(ctx, "지표", x1, top - 18, { s: 11, a: "right", c: "#9be08a", box: [0, LW] });
      K.pill(ctx, "깊이 " + dep.toFixed(1) + " km", 246, clamp(my + 5, top + 8, bot), { a: "center", s: 12, c: "#fff0d0" });
      K.pill(ctx, dep <= 1.5 ? "지표 가까이 — 빨리 식는다" : (dep >= 5 ? "깊은 곳 — 아주 천천히 식는다" : "중간 깊이"), 16, bot + 40, { s: 11.5, c: dep <= 1.5 ? KC.blue : (dep >= 5 ? KC.orange : KC.ink) });
      K.t(ctx, "다 식는 데 걸리는 시간 약 " + (yr >= 10000 ? num(Math.round(yr / 1000)) + "천 년" : num(Math.round(yr)) + " 년"), 16, bot + 68, { s: 11.5, c: KC.ink });

      /* ── 오른쪽 : 현미경 ── */
      var RX = LW + 8, mcx = RX + (W - RX) / 2, mcy = 194, mr = 116;
      K.stage(ctx, RX, 0, W - RX, H, "night", { seed: 4, title: "🔬 얇은 조각을 현미경으로 보면" });
      var ring = ctx.createRadialGradient(mcx, mcy, mr, mcx, mcy, mr + 14);
      ring.addColorStop(0, "#9aa0b0"); ring.addColorStop(.5, "#e8ecf4"); ring.addColorStop(1, "#4a4f5c");
      ctx.fillStyle = ring; ctx.beginPath(); ctx.arc(mcx, mcy, mr + 14, 0, 6.2832); ctx.fill();
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
      K.pill(ctx, kind === 0 ? "화산암 : " + nm[0] : (kind === 1 ? "심성암 : " + nm[1] : "반심성암"), mcx, 58, { a: "center", s: 13.5, c: KC.orange, box: [RX, W] });
      K.pill(ctx, "결정 크기 약 " + (g < 0.1 ? g.toFixed(3) : g.toFixed(2)) + " mm", mcx, mcy + mr + 38, { a: "center", s: 12.5, c: KC.ink, box: [RX, W] });
      K.t(ctx, kind === 0 ? "세립질 — 결정이 너무 작아 눈으로 구별하기 어렵다" : (kind === 1 ? "조립질 — 결정이 굵어 하나하나 보인다" : "중간 — 반심성암"),
        mcx, mcy + mr + 64, { s: 11, a: "center", c: KC.mute });
      K.t(ctx, "빛깔은 편광 현미경에서 광물마다 다르게 보이는 색(모식)", mcx, H - 10, { s: 10, a: "center", c: KC.dim });

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
      K.stage(ctx, 0, 0, LW, H, "lab", { seed: 13, title: "주시 곡선 — 진앙 거리에 따른 P파·S파 도착 시각" });
      var g = K.chart(ctx, { x: 4, y: 44, w: LW - 10, h: H - 48, pl: 56, x0: 0, x1: 10000, y0: 0, y1: 25, xt: 4, yt: 5, xl: "진앙 거리 (km) →",
        xf: function (v0) { return num(v0); }, yf: function (v0) { return v0 + "분"; } });
      function curve(arr) { var p = []; for (var k = 0; k <= 100; k++) { var d = k / 100 * 10000; p.push([d, itp(arr, d)]); } return p; }
      K.plot(ctx, g, curve(SM), KC.blue);
      K.plot(ctx, g, curve(PM), KC.red);
      K.pill(ctx, "S파", g.X(9000), g.Y(itp(SM, 9000)) - 14, { s: 12, a: "center", c: KC.blue });
      K.pill(ctx, "P파", g.X(9000), g.Y(itp(PM, 9000)) + 26, { s: 12, a: "center", c: KC.red });
      var tP = itp(PM, dist), tS = itp(SM, dist), dt = tS - tP, mx = g.X(dist);
      K.line(ctx, { x: mx, y: g.B }, { x: mx, y: g.Y(tS) }, "rgba(255,255,255,.55)", 1.4, [3, 3]);
      K.glow(ctx, mx, g.Y(tP), 4.2, KC.red, 3.5);
      K.glow(ctx, mx, g.Y(tS), 4.2, KC.blue, 3.5);
      ctx.save(); ctx.strokeStyle = KC.yellow; ctx.lineWidth = 3; ctx.shadowColor = KC.yellow; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(mx + 12, g.Y(tP)); ctx.lineTo(mx + 12, g.Y(tS)); ctx.stroke(); ctx.restore();
      var right = mx > 400;
      K.pill(ctx, "PS시 " + dt.toFixed(2) + "분", right ? mx - 10 : mx + 22, (g.Y(tP) + g.Y(tS)) / 2 + 5, { s: 11.5, a: right ? "right" : "left", c: KC.yellow, box: [0, LW] });

      /* ── 오른쪽 : 지진 기록지 ── */
      var RX = LW + 8, rx = RX + 18, rw = W - rx - 18;
      K.stage(ctx, RX, 0, W - RX, H, "night", { seed: 6, title: "이 거리에서 얻게 될 지진 기록지" });
      glass(ctx, rx - 6, 50, rw + 12, 196);
      ctx.strokeStyle = "rgba(160,180,255,.1)"; ctx.lineWidth = 1;
      for (var gl = 0; gl <= 10; gl++) { var gx = rx + gl * rw / 10; ctx.beginPath(); ctx.moveTo(gx, 56); ctx.lineTo(gx, 240); ctx.stroke(); }
      var pf = 0.10 + 0.55 * (tP / 23), sf = 0.10 + 0.55 * (tS / 23);
      var pxp = rx + pf * rw, pxs = rx + sf * rw, mid = 150;
      ctx.save(); ctx.strokeStyle = KC.green; ctx.lineWidth = 1.5; ctx.shadowColor = KC.green; ctx.shadowBlur = 6; ctx.beginPath();
      for (var i = 0; i <= rw; i++) {
        var xx = rx + i, amp;
        if (xx < pxp) amp = 1.2 * Math.sin(i * 0.9);
        else if (xx < pxs) amp = 9 * Math.sin(i * 1.15) * Math.exp(-(xx - pxp) / 220);
        else amp = 34 * Math.sin(i * 0.72) * Math.exp(-(xx - pxs) / 150) + 4 * Math.sin(i * 0.3);
        if (i === 0) ctx.moveTo(xx, mid + amp); else ctx.lineTo(xx, mid + amp);
      }
      ctx.stroke(); ctx.restore();
      /* 가까운 거리에서는 두 도착 시각이 붙으므로 이름표를 위아래로 어긋나게 둔다 */
      [[pxp, "P파 도착", KC.red], [pxs, "S파 도착", KC.blue]].forEach(function (q, qi) {
        K.line(ctx, { x: q[0], y: 56 }, { x: q[0], y: 240 }, q[2], 2);
        K.pill(ctx, q[1], q[0] + 6, 74 + qi * 24, { s: 10.5, c: q[2], box: [RX, W] });
      });
      K.bracket(ctx, pxp, pxs, 262, KC.yellow, null, false);
      K.pill(ctx, "초기 미동 계속 시간 (PS시) = " + dt.toFixed(2) + "분", rx, 296, { s: 11.5, c: KC.yellow, box: [RX, W] });
      K.t(ctx, "P파 도착 뒤 S파가 오기 전까지가 초기 미동,", rx, 326, { s: 11, c: KC.mute });
      K.t(ctx, "S파 도착 뒤의 큰 흔들림이 주요동입니다.", rx, 344, { s: 11, c: KC.mute });
      K.pill(ctx, (okA ? "✔ " : "") + "찾아야 할 값 : PS시 5.20분", rx, 384, { s: 12.5, c: okA ? KC.green : KC.yellow, box: [RX, W] });

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
    var COLS = [KC.orange, KC.green, KC.violet];

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 580, bx = 45, by = 45, bw = 520, bh = 360;
      K.stage(ctx, 0, 0, LW, H, "night", { seed: 19, title: "관측소를 중심으로 진앙 거리만큼 원을 그려 봅시다" });
      var mg = ctx.createLinearGradient(bx, by, bx + bw, by + bh); mg.addColorStop(0, "#14304a"); mg.addColorStop(1, "#0c1c34");
      ctx.fillStyle = mg; ctx.fillRect(bx, by, bw, bh);
      ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
      ctx.fillStyle = "rgba(120,170,110,.18)";
      ctx.beginPath(); ctx.ellipse(250, 230, 150, 110, -.4, 0, 6.2832); ctx.fill();
      ctx.beginPath(); ctx.ellipse(470, 130, 90, 60, .3, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "rgba(160,190,255,.14)"; ctx.lineWidth = 1;
      for (var gx = bx; gx <= bx + bw; gx += 37.5) { ctx.beginPath(); ctx.moveTo(gx, by); ctx.lineTo(gx, by + bh); ctx.stroke(); }
      for (var gy = by; gy <= by + bh; gy += 37.5) { ctx.beginPath(); ctx.moveTo(bx, gy); ctx.lineTo(bx + bw, gy); ctx.stroke(); }
      ST.forEach(function (s, i) {
        ctx.save(); ctx.strokeStyle = COLS[i]; ctx.lineWidth = got[i] ? 3 : 2; ctx.globalAlpha = got[i] ? 1 : .7; ctx.shadowColor = COLS[i]; ctx.shadowBlur = got[i] ? 10 : 4;
        ctx.beginPath(); ctx.arc(s.x, s.y, r[i] * SC, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      });
      ctx.restore();
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5; ctx.strokeRect(bx, by, bw, bh);
      var all = got[0] && got[1] && got[2];
      if (all) {
        K.glow(ctx, EPI[0], EPI[1], 6, "rgba(255,230,140,.98)", 5);
        K.spikes(ctx, EPI[0], EPI[1], 16, .7);
        K.pill(ctx, "★ 진앙", EPI[0] - 14, EPI[1] + 26, { s: 13, a: "right", c: KC.yellow });
      }
      ST.forEach(function (s, i) {
        ctx.save(); ctx.shadowColor = COLS[i]; ctx.shadowBlur = 10; ctx.fillStyle = COLS[i]; ctx.beginPath();
        ctx.moveTo(s.x, s.y - 9); ctx.lineTo(s.x + 9, s.y + 7); ctx.lineTo(s.x - 9, s.y + 7); ctx.closePath(); ctx.fill(); ctx.restore();
        K.pill(ctx, s.n + " 관측소" + (got[i] ? " ✔" : ""), clamp(s.x + 14, 0, 470), s.y + 5, { s: 11.5, c: COLS[i], box: [0, LW] });
      });
      K.t(ctx, "눈금 한 칸 = 500 km", bx + 4, by + bh + 20, { s: 11, c: KC.mute });

      /* ── 오른쪽 : PS시 → 거리 환산 그래프 ── */
      var RX = LW + 8;
      K.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 2, title: "PS시 → 진앙 거리 환산" });
      var g = K.chart(ctx, { x: RX + 2, y: 44, w: W - RX - 6, h: H - 48, pl: 54, x0: 0, x1: 6, y0: 0, y1: 5000, xt: 3, yt: 5, xl: "PS시 →",
        xf: function (v0) { return v0 + "분"; }, yf: function (v0) { return num(v0); } });
      K.t(ctx, "거리 (km)", g.L + 6, g.T + 12, { s: 10.5, c: KC.mute });
      var pts = [];
      for (var k = 0; k <= 100; k++) { var dd = k / 100 * 5000; pts.push([ps(dd), dd]); }
      K.plot(ctx, g, pts, KC.green);
      ST.forEach(function (s, i) {
        K.line(ctx, { x: g.X(s.ps), y: g.B }, { x: g.X(s.ps), y: g.Y(s.d) }, COLS[i], 1.6, [4, 4]);
        K.line(ctx, { x: g.X(s.ps), y: g.Y(s.d) }, { x: g.L, y: g.Y(s.d) }, COLS[i], 1.6, [4, 4]);
        K.glow(ctx, g.X(s.ps), g.B, 3, COLS[i], 3);
        K.pill(ctx, s.n + " " + s.ps.toFixed(2) + "분", g.R - 4, g.Y(s.d) + 5, { s: 10.5, a: "right", c: COLS[i], box: [RX, W] });
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
    var ang = 0, got = window.sthState("d4") || { both: false, none: false, ponly: false };
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

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 596, cx = 298, cy = 252, R = 184;
      K.stage(ctx, 0, 0, LW, H, "space", { seed: 37, title: "지구 속을 지나는 지진파 (진원은 맨 위)" });
      layers(cx, cy, R);
      function pt(a, rr) { return [cx + rr * Math.sin(a * D2R), cy - rr * Math.cos(a * D2R)]; }
      /* 그림자대 표시 */
      function arcBand(a0, a1, col, off) {
        ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 9; ctx.globalAlpha = .75; ctx.shadowColor = col; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(cx, cy, R + off, -Math.PI / 2 + a0 * D2R, -Math.PI / 2 + a1 * D2R); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, R + off, -Math.PI / 2 - a1 * D2R, -Math.PI / 2 - a0 * D2R); ctx.stroke();
        ctx.restore();
      }
      arcBand(103, 180, KC.blue, 9);
      arcBand(103, 142, KC.red, 21);
      /* 지진파 경로 */
      ctx.save(); ctx.lineWidth = 1.6; ctx.globalAlpha = .85; ctx.strokeStyle = "#ffe0c8"; ctx.shadowColor = "#ffb080"; ctx.shadowBlur = 6;
      [20, 45, 70, 95].forEach(function (a) {
        var e = pt(a, R), depth = R * (1 - a / 190);
        ctx.beginPath(); ctx.moveTo(cx, cy - R);
        ctx.quadraticCurveTo(cx + Math.sin(a / 2 * D2R) * depth * 1.5, cy - Math.cos(a / 2 * D2R) * depth * 0.6, e[0], e[1]); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - R);
        ctx.quadraticCurveTo(cx - Math.sin(a / 2 * D2R) * depth * 1.5, cy - Math.cos(a / 2 * D2R) * depth * 0.6, 2 * cx - e[0], e[1]); ctx.stroke();
      });
      /* 핵을 지나 굴절된 P파 */
      ctx.strokeStyle = KC.yellow; ctx.shadowColor = KC.yellow; ctx.lineWidth = 2;
      [150, 168].forEach(function (a) {
        var e = pt(a, R);
        ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx + R * 0.44, cy + R * 0.12);
        ctx.lineTo(cx + (e[0] - cx) * 0.55, cy + (e[1] - cy) * 0.62); ctx.lineTo(e[0], e[1]); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx - R * 0.44, cy + R * 0.12);
        ctx.lineTo(cx - (e[0] - cx) * 0.55, cy + (e[1] - cy) * 0.62); ctx.lineTo(2 * cx - e[0], e[1]); ctx.stroke();
      });
      ctx.restore();
      K.pill(ctx, "맨틀 (고체)", cx, cy - R + 48, { a: "center", s: 11.5, c: "#ffe2c8" });
      K.pill(ctx, "외핵 (액체)", cx, cy + R * 0.42, { a: "center", s: 11.5, c: "#fff0c0" });
      K.pill(ctx, "내핵", cx, cy + 5, { a: "center", s: 11, c: "#fff4d6" });
      /* 진원과 관측소 */
      K.glow(ctx, cx, cy - R, 5, "rgba(255,120,120,.98)", 4.5);
      K.pill(ctx, "진원 0°", cx, cy - R - 18, { a: "center", s: 11.5, c: KC.red });
      var o = pt(ang, R);
      K.line(ctx, { x: cx, y: cy }, o, "rgba(255,255,255,.55)", 1.5, [4, 4]);
      K.glow(ctx, o[0], o[1], 6, "rgba(255,255,255,.98)", 3.5);
      K.pill(ctx, ang + "°", clamp(o[0] + 16, 0, 556), o[1] + 5, { s: 12.5, c: KC.ink, box: [0, LW] });

      /* ── 오른쪽 안내 ── */
      var RX = LW + 8, x0 = RX + 14, bw = W - x0 - 14;
      K.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 8, title: "이 관측소에 도착하는 지진파" });
      var p = pOK(ang), s = sOK(ang);
      [[p, p ? "✅ P파 도달" : "🚫 P파 도달 못 함", p ? "종파 · 고체와 액체를 모두 지난다" : "핵에서 크게 굴절해 이 구간을 비켜 간다", 52],
       [s, s ? "✅ S파 도달" : "🚫 S파 도달 못 함", s ? "횡파 · 고체만 지난다" : "액체인 외핵을 지나지 못한다", 122]].forEach(function (b) {
        var c = b[0] ? KC.green : KC.red;
        glass(ctx, x0, b[3], bw, 60, c);
        ctx.fillStyle = b[0] ? "rgba(63,211,163,.10)" : "rgba(255,107,129,.10)"; ctx.beginPath(); ctx.roundRect(x0, b[3], bw, 60, 12); ctx.fill();
        K.t(ctx, b[1], x0 + 14, b[3] + 26, { s: 14, w: "900", c: c });
        K.t(ctx, b[2], x0 + 14, b[3] + 46, { s: 11, c: KC.mute });
      });
      K.pill(ctx, "■ P파 그림자대 103°~142°", x0, 222, { s: 11.5, c: KC.red });
      K.pill(ctx, "■ S파 그림자대 103°~180°", x0, 252, { s: 11.5, c: KC.blue });
      kwrap(ctx, "S파 그림자대가 P파 그림자대보다 훨씬 넓습니다. 두 그림자대의 모양이 서로 다르다는 점이 결정적인 단서입니다.", x0, 292, bw, 20, { s: 11.5, c: KC.ink });
      K.t(ctx, "노란 선 = 핵을 지나며 꺾인 P파", x0, H - 20, { s: 10.5, c: KC.yellow });

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
      if (d < 35) return { n: "지각", s: "고체", c: KC.orange, t: "대륙 지각은 약 35 km, 해양 지각은 5~10 km로 훨씬 얇습니다." };
      if (d < 2890) return { n: "맨틀", s: "고체", c: "#ff9a6a", t: "지구 부피의 약 82%를 차지합니다. 고체이지만 아주 오랜 시간에 걸쳐 천천히 대류합니다." };
      if (d < 5150) return { n: "외핵", s: "액체", c: KC.yellow, t: "액체 철·니켈. S파가 지나지 못합니다. 이 액체의 대류가 지구 자기장을 만듭니다." };
      return { n: "내핵", s: "고체", c: "#fff4d6", t: "엄청난 압력 때문에 다시 고체가 됩니다. 1936년 레만이 찾아냈습니다." };
    }

    function draw() {
      var L = layer(dep), p = vP(dep), s = vS(dep);
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽 : 층 단면 ── */
      var LW = 388, cx = 194, cy = 176, R = 124;
      K.stage(ctx, 0, 0, LW, H, "space", { seed: 47, title: "지구 내부의 층" });
      var rO = R * (6371 - 2890) / 6371, rI = R * (6371 - 5150) / 6371;
      var mg = ctx.createRadialGradient(cx, cy, rO, cx, cy, R); mg.addColorStop(0, "#d0703a"); mg.addColorStop(1, "#5a2a18");
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill();
      var og = ctx.createRadialGradient(cx, cy, rI, cx, cy, rO); og.addColorStop(0, "#ffd070"); og.addColorStop(1, "#e0702a");
      ctx.save(); ctx.shadowColor = "#ffa040"; ctx.shadowBlur = 14; ctx.fillStyle = og; ctx.beginPath(); ctx.arc(cx, cy, rO, 0, 6.2832); ctx.fill(); ctx.restore();
      var ig = ctx.createRadialGradient(cx - rI * .3, cy - rI * .3, 2, cx, cy, rI); ig.addColorStop(0, "#ffffff"); ig.addColorStop(.5, "#fff0c0"); ig.addColorStop(1, "#d8b060");
      ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(cx, cy, rI, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "#8a6a50"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R - 1.5, 0, 6.2832); ctx.stroke();
      ctx.save(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.5; ctx.shadowColor = "#7fd3ff"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, R * (6371 - dep) / 6371), 0, 6.2832); ctx.stroke(); ctx.restore();
      K.pill(ctx, "맨틀", cx, cy - R + 30, { a: "center", s: 11, c: "#ffe2c8" });
      K.pill(ctx, "외핵", cx, cy + R * 0.46, { a: "center", s: 11, c: "#fff0c0" });
      K.pill(ctx, "내핵", cx, cy + 5, { a: "center", s: 11, c: "#fff4d6" });
      K.pill(ctx, "깊이 " + num(dep) + " km → " + L.n + " (" + L.s + ")", 16, cy + R + 40, { s: 13.5, c: L.c, box: [0, LW] });
      kwrap(ctx, L.t, 16, cy + R + 68, LW - 32, 19, { s: 11.5, c: KC.mute });

      /* ── 오른쪽 : 속도 - 깊이 그래프 ── */
      var RX = LW + 8;
      K.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 3, title: "깊이에 따른 지진파의 속도" });
      var g = K.chart(ctx, { x: RX + 2, y: 44, w: 330, h: H - 48, pl: 56, x0: 0, x1: 16, y0: 6400, y1: 0, xt: 4, yt: 4, xl: "속도 (km/s) →",
        yf: function (v0) { return num(Math.round(v0)); } });
      K.t(ctx, "깊이 ↓ (km)", g.L + 6, g.T + 12, { s: 10.5, c: KC.mute });
      [[35, "모호면", got.m], [2890, "구텐베르크면", got.g], [5150, "레만면", got.l]].forEach(function (q) {
        var c = q[2] ? KC.green : KC.yellow, yy = g.Y(q[0]);
        K.line(ctx, { x: g.L, y: yy }, { x: W - 14, y: yy }, c, 1.8, [5, 4]);
        K.pill(ctx, (q[2] ? "✔ " : "") + q[1] + " " + num(q[0]) + " km", W - 16, q[0] < 100 ? yy + 22 : yy - 8, { s: 11, a: "right", c: c, box: [RX, W] });
      });
      function vcurve(f, col) {
        [[0, 34], [35, 2889], [2890, 5149], [5150, 6371]].forEach(function (sg) {
          var pts = [];
          for (var k = 0; k <= 40; k++) { var d = lerp(sg[0], sg[1], k / 40), u = f(d); if (u <= 0) return; pts.push([u, d]); }
          K.plot(ctx, g, pts, col);
        });
      }
      vcurve(vP, KC.red); vcurve(vS, KC.blue);
      K.pill(ctx, "P파", g.X(9.6), g.Y(1500), { s: 11.5, a: "center", c: KC.red });
      K.pill(ctx, "S파", g.X(3.6), g.Y(1500), { s: 11.5, a: "center", c: KC.blue });
      K.line(ctx, { x: g.L, y: g.Y(dep) }, { x: g.R, y: g.Y(dep) }, "rgba(255,255,255,.6)", 1.2, [2, 3]);
      K.glow(ctx, g.X(p), g.Y(dep), 4.5, KC.red, 3.5);
      if (s > 0) K.glow(ctx, g.X(s), g.Y(dep), 4.5, KC.blue, 3.5);

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
