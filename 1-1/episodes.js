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

    function draw() {
      paper(ctx, W, H);
      var T = surfT(R);
      var cx = 250, cy = 195, rad = 118;

      /* 원시 지구 */
      var hot = clamp((T + 20) / 1600, 0, 1);
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fillStyle = T >= 1200 ? v("--rose") : (T >= 700 ? v("--coral") : v("--violet-700"));
      ctx.globalAlpha = lerp(0.55, 1, hot); ctx.fill(); ctx.globalAlpha = 1;
      /* 마그마 얼룩 */
      var seed = 1;
      function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
      for (var i = 0; i < 90; i++) {
        var ang = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * (rad - 12);
        ctx.globalAlpha = 0.18 + 0.5 * hot;
        ctx.fillStyle = T >= 1200 ? v("--amber") : v("--coral-700");
        ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, 3 + rnd() * 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();

      /* 떨어지는 미행성 */
      var n = Math.round(R / 4);
      ctx.fillStyle = v("--mist"); ctx.strokeStyle = v("--amber"); ctx.lineWidth = 2;
      for (var k = 0; k < n; k++) {
        var a2 = (k / Math.max(1, n)) * Math.PI * 2 + 0.4, d2 = rad + 24 + (k % 4) * 26;
        var px = cx + Math.cos(a2) * d2, py = cy + Math.sin(a2) * d2;
        if (px < 24 || px > 470 || py < 24 || py > H - 20) continue;
        ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx + Math.cos(a2) * (rad + 6), cy + Math.sin(a2) * (rad + 6)); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      text(ctx, "원시 지구", cx, cy + rad + 30, { s: 13, w: "800", a: "center" });
      text(ctx, "미행성 충돌 " + R + "배", cx, cy + rad + 50, { s: 11.5, c: v("--mist"), a: "center" });

      /* 오른쪽 : 열 수지와 온도계 */
      var x0 = 500;
      text(ctx, "지표를 달구는 열", x0, 44, { s: 13, w: "800" });
      var rows = [
        { n: "미행성 충돌 에너지", val: 6500 * R, c: "--coral" },
        { n: "방사성 원소 붕괴열", val: 60, c: "--violet" },
        { n: "태양 복사", val: 238, c: "--amber" }
      ];
      var tot = rows[0].val + rows[1].val + rows[2].val;
      rows.forEach(function (r, i) {
        var y = 66 + i * 40;
        text(ctx, r.n, x0, y + 12, { s: 11.5, c: v("--mist") });
        ctx.fillStyle = v("--card-2"); ctx.fillRect(x0, y + 18, 300, 12);
        ctx.fillStyle = v(r.c); ctx.fillRect(x0, y + 18, 300 * clamp(r.val / Math.max(tot, 1), 0, 1), 12);
        text(ctx, num(Math.round(r.val)) + " W/m²", x0 + 308, y + 29, { s: 11, w: "800", c: v(r.c) });
      });

      box(ctx, x0, 200, 330, 110, v("--card-2"));
      text(ctx, "지표 평균 온도", x0 + 165, 228, { s: 11.5, c: v("--mist"), a: "center" });
      text(ctx, Math.round(T) + " ℃", x0 + 165, 272, { s: 34, w: "900", a: "center",
        c: T >= 1200 ? v("--rose-700") : (T >= 700 ? v("--coral-700") : v("--brand-700")) });
      text(ctx, T >= 1200 ? "🔥 마그마 바다 — 지구 전체가 녹아 있다"
        : (T >= 700 ? "🌋 겉은 굳었다 녹았다 한다" : "🪨 지각이 굳기 시작한다"),
        x0 + 165, 296, { s: 12, w: "800", a: "center" });
      text(ctx, "현무암질 암석이 완전히 녹는 온도 ≈ 1200 ℃", x0, 336, { s: 11, c: v("--mist") });
      text(ctx, "충돌 에너지가 줄면 지구는 열을 우주로 내보내며 식는다", x0, 356, { s: 11, c: v("--mist") });

      var T0 = Math.round(T);
      $("a-c1-info").innerHTML = "미행성이 오늘날의 <b>" + R + "배</b>로 떨어질 때 지표 온도는 약 <b>" + T0 + " ℃</b>입니다. "
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
    $("a-imp").addEventListener("input", function (e) { R = +e.target.value; $("a-imp-val").textContent = R + "배"; draw(); });
    draw(); mission();
    if (ep.cleared(1)) window.sthMission("m1-2", true);
  })();

  /* ---- 장면 3 : 층상 분화 ---- */
  function prog(t) { return t <= 2 ? 0 : Math.min(1, 1 - Math.exp(-(t - 2) / 25)); }

  (function () {
    var canvas = $("a-c2"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var t = 0, got = window.sthState("a3") || { a: false, b: false }, okQ = !!window.sthState("a3q");

    function draw() {
      paper(ctx, W, H);
      var p = prog(t), cx = 220, cy = 175, rad = 135;

      /* 지구 단면 */
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fillStyle = v("--coral"); ctx.globalAlpha = lerp(0.75, 1, 1 - p); ctx.fill(); ctx.globalAlpha = 1;
      if (p > 0) {
        ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fillStyle = v("--teal"); ctx.fill();
        var coreR = rad * 0.546 * Math.sqrt(p);
        ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2); ctx.fillStyle = v("--coral-700"); ctx.fill();
        text(ctx, "핵", cx, cy + 6, { s: coreR > 26 ? 15 : 11, w: "900", a: "center", c: v("--on-accent") });
        if (coreR > 40) text(ctx, "철·니켈", cx, cy + 24, { s: 11, a: "center", c: v("--on-accent") });
        text(ctx, "맨틀 (규산염)", cx, cy - rad + 26, { s: 12, w: "800", a: "center", c: v("--on-accent") });
      }
      /* 가라앉는 철 방울 */
      var drops = Math.round(14 * (1 - p));
      ctx.fillStyle = v("--coral-700");
      for (var i = 0; i < drops; i++) {
        var ang = i / 14 * Math.PI * 2 + 0.3, rr = lerp(rad * 0.62, rad * 0.94, (i % 5) / 4);
        ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, 6, 0, Math.PI * 2); ctx.fill();
      }
      if (p > 0.88) {
        ctx.strokeStyle = v("--violet"); ctx.lineWidth = 5; ctx.globalAlpha = .9;
        ctx.beginPath(); ctx.arc(cx, cy, rad - 3, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        text(ctx, "← 지각", cx + rad + 8, cy - rad + 46, { s: 11, w: "800", c: v("--violet-700") });
      }
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
      text(ctx, p <= 0 ? "균질하게 섞인 마그마 바다" : (p < 1 ? "층상 분화 진행 중" : "핵·맨틀·지각 분리 완료"),
        cx, cy + rad + 34, { s: 13, w: "800", a: "center" });

      /* 오른쪽 : 진행도 막대 + 시간 축 */
      var x0 = 440, x1 = 870;
      text(ctx, "층상 분화 진행도", x0, 46, { s: 13, w: "800" });
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(x0, 58, x1 - x0, 26, 13); ctx.fill();
      ctx.fillStyle = v("--teal"); ctx.beginPath(); ctx.roundRect(x0, 58, Math.max(2, (x1 - x0) * p), 26, 13); ctx.fill();
      text(ctx, (p * 100).toFixed(1) + " %", (x0 + x1) / 2, 77, { s: 14, w: "900", a: "center", c: v("--ink") });

      var ay = 210;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, ay); ctx.lineTo(x1, ay); ctx.stroke();
      ctx.beginPath();
      for (var k = 0; k <= 100; k++) {
        var tt = k / 100 * 200, xx = x0 + tt / 200 * (x1 - x0), yy = ay - prog(tt) * 90;
        if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.strokeStyle = v("--teal"); ctx.lineWidth = 3; ctx.stroke();
      var mx = x0 + t / 200 * (x1 - x0);
      ctx.strokeStyle = v("--brand"); ctx.setLineDash([5, 5]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(mx, ay - 100); ctx.lineTo(mx, ay + 6); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = v("--brand"); ctx.beginPath(); ctx.arc(mx, ay - prog(t) * 90, 6, 0, Math.PI * 2); ctx.fill();
      [0, 50, 100, 150, 200].forEach(function (g) {
        text(ctx, g + "", x0 + g / 200 * (x1 - x0), ay + 20, { s: 10.5, c: v("--mist"), a: "center" });
      });
      text(ctx, "지구 형성 후 흐른 시간 (백만 년)", (x0 + x1) / 2, ay + 38, { s: 11, c: v("--mist"), a: "center" });
      text(ctx, "밀도가 큰 철·니켈은 가라앉아 핵이 되고,", x0, ay + 70, { s: 11.5, c: v("--mist") });
      text(ctx, "밀도가 작은 규산염은 떠올라 맨틀과 지각이 된다.", x0, ay + 90, { s: 11.5, c: v("--mist") });
      text(ctx, "이렇게 층이 나뉘며 지구시스템의 지권이 갖춰진다.", x0, ay + 110, { s: 11.5, c: v("--mist") });

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
    function mapX(dd) { return 430 + (dd - 0.30) / 1.70 * 420; }
    function mapY(mm) { return 330 - (Math.log(mm / 0.02) / Math.log(100)) * 250; }

    function draw() {
      paper(ctx, W, H);
      var w = world(d, m), K = KIND[w.kind];

      /* 왼쪽 : 행성 그림 */
      var cx = 205, cy = 165, rad = 105;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fillStyle = v(w.kind === "ocean" ? "--brand" : (w.kind === "vapor" ? "--rose" : (w.kind === "ice" ? "--brand-100" : "--mist")));
      ctx.fill();
      if (w.kind === "ocean") {
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.clip();
        ctx.fillStyle = v("--green");
        ctx.beginPath(); ctx.ellipse(cx - 34, cy - 24, 44, 30, 0.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 40, cy + 34, 34, 24, -0.3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (w.kind === "vapor") {
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.clip();
        ctx.fillStyle = v("--amber-100"); ctx.globalAlpha = .75;
        for (var s = 0; s < 6; s++) { ctx.beginPath(); ctx.ellipse(cx - 60 + s * 26, cy - 70 + s * 28, 70, 11, 0, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      } else if (w.kind === "ice") {
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.clip();
        ctx.strokeStyle = v("--brand"); ctx.lineWidth = 2; ctx.globalAlpha = .6;
        for (var q = -3; q <= 3; q++) { ctx.beginPath(); ctx.moveTo(cx - rad, cy + q * 26); ctx.lineTo(cx + rad, cy + q * 26 + 12); ctx.stroke(); }
        ctx.restore();
      } else {
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.clip();
        ctx.fillStyle = v("--line");
        for (var c2 = 0; c2 < 9; c2++) {
          var aa = c2 * 1.1, rr2 = ((c2 * 37) % 80);
          ctx.beginPath(); ctx.arc(cx + Math.cos(aa) * rr2, cy + Math.sin(aa) * rr2, 9 + (c2 % 3) * 5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
      /* 대기 테두리 */
      if (w.keep >= 0.10) {
        ctx.strokeStyle = v(w.kind === "vapor" ? "--rose-700" : "--brand-700");
        ctx.lineWidth = clamp(2 + 16 * (w.co2 / 95), 2, 18); ctx.globalAlpha = .45;
        ctx.beginPath(); ctx.arc(cx, cy, rad + ctx.lineWidth / 2 + 2, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();

      text(ctx, K.name, cx, cy + rad + 34, { s: 15, w: "900", a: "center", c: v(K.col) });
      text(ctx, "지표 평균 온도 " + Math.round(w.T) + " ℃", cx, cy + rad + 58, { s: 13, w: "800", a: "center" });
      text(ctx, "대기를 붙잡는 힘 " + Math.round(w.keep * 100) + "% · 대기 CO₂ "
        + (w.co2 >= 1 ? Math.round(w.co2) + "기압" : "0.04기압"), cx, cy + rad + 78, { s: 11.5, c: v("--mist"), a: "center" });
      text(ctx, "받는 햇빛 " + Math.round(w.sAbs) + " W/m² (지구 238)", cx, cy + rad + 96, { s: 11.5, c: v("--mist"), a: "center" });

      /* 오른쪽 : 갈림길 지도 */
      text(ctx, "갈림길 지도", 430, 40, { s: 13, w: "800" });
      text(ctx, "가로 = 태양으로부터의 거리, 세로 = 행성의 질량", 430, 58, { s: 10.5, c: v("--mist") });
      for (var gx = 0; gx < 42; gx++) {
        for (var gy = 0; gy < 25; gy++) {
          var dd = 0.30 + (gx + 0.5) / 42 * 1.70;
          var mm = 0.02 * Math.pow(100, 1 - (gy + 0.5) / 25);
          ctx.fillStyle = v(KIND[world(dd, mm).kind].col);
          ctx.globalAlpha = .5;
          ctx.fillRect(430 + gx * 10, 80 + gy * 10, 10, 10);
        }
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.strokeRect(430, 80, 420, 250);
      REAL.forEach(function (p) {
        var px = mapX(p.d), py = mapY(p.m);
        ctx.fillStyle = v("--ink"); ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
        text(ctx, p.n, clamp(px + 7, 430, 832), py + 4, { s: 11, w: "800", c: v("--ink") });
      });
      var curX = clamp(mapX(d), 430, 850), curY = clamp(mapY(m), 80, 330);
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(curX, curY, 9, 0, Math.PI * 2); ctx.stroke();
      [[0.3, "0.3"], [1.0, "1.0 AU"], [2.0, "2.0"]].forEach(function (g) {
        text(ctx, g[1], clamp(mapX(g[0]), 436, 844), 346, { s: 10.5, c: v("--mist"), a: "center" });
      });
      text(ctx, "질량 2", 424, 86, { s: 10.5, c: v("--mist"), a: "right" });
      text(ctx, "0.02", 424, 332, { s: 10.5, c: v("--mist"), a: "right" });
      var lg = ["ocean", "vapor", "ice", "bare"];
      lg.forEach(function (k, i) {
        ctx.fillStyle = v(KIND[k].col); ctx.globalAlpha = .6;
        ctx.fillRect(430 + i * 108, 366, 12, 12); ctx.globalAlpha = 1;
        text(ctx, KIND[k].name.slice(3), 446 + i * 108, 376, { s: 10.5, c: v("--mist") });
      });

      var msg;
      if (w.kind === "ocean") msg = "화산에서 빠져나온 수증기가 <b>응결해 비가 되고 원시 바다</b>가 되었습니다. 바닷물은 대기의 이산화 탄소를 녹여 석회암으로 묻어 버리므로 대기압도 낮게 유지됩니다. 지구가 걸은 길입니다.";
      else if (w.kind === "vapor") msg = "햇빛을 너무 많이 받아 수증기가 <b>끝내 응결하지 못했습니다</b>. 수증기와 이산화 탄소가 그대로 대기에 남아 온실 효과를 키우고, 그래서 더 뜨거워집니다(폭주 온실). 금성이 걸은 길입니다.";
      else if (w.kind === "ice") msg = "물은 있지만 햇빛이 모자라거나 대기가 얇아 <b>모두 얼어붙었습니다</b>. 화성이 걸은 길입니다.";
      else msg = "중력이 약해 화산이 내놓은 기체를 <b>붙잡지 못했습니다</b>. 대기도 바다도 없이 맨바위가 드러난 행성입니다. 수성이 걸은 길입니다.";
      $("a-c3-info").innerHTML = "<b>" + K.name + "</b> · " + d.toFixed(2) + " AU · 질량 " + m.toFixed(2) + "배 → 지표 평균 " + Math.round(w.T) + " ℃<br>" + msg;

      if (!got[K.key]) { got[K.key] = 1; window.sthState("a4", got); mission(); }
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
      + (p.indexOf("㉡") === 0 ? "처음부터 정확히 짚었습니다. 이제 모형으로 증명까지 했네요."
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
        { id: "ma", label: "화성", sub: "1.52 AU · 질량 0.11배" }
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

    function draw() {
      paper(ctx, W, H);
      var r = oxy(P, V), net = r.net, tS = r.tStar;
      var atmEnd = atmAt(net, tS, NT);

      /* 위쪽 : 권역 상자와 흐름 */
      var by = 30, bh = 74;
      var boxes = [
        { x: 24,  t: "생물권", s: "남세균의 광합성", val: "산소 생산 " + P, c: "--green" },
        { x: 246, t: "수권",   s: "바닷속 철 이온 Fe²⁺", val: "잔량 " + Math.round(ironAt(net, NT)), c: "--brand" },
        { x: 468, t: "지권",   s: "해저의 호상철광층", val: "퇴적 " + Math.round(FE - ironAt(net, NT)), c: "--coral" },
        { x: 690, t: "기권",   s: "대기에 쌓인 산소", val: "축적 " + atmEnd.toFixed(0), c: "--violet" }
      ];
      boxes.forEach(function (b, i) {
        box(ctx, b.x, by, 186, bh, v(b.c), .22);
        ctx.strokeStyle = v(b.c); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(b.x, by, 186, bh, 12); ctx.stroke();
        text(ctx, b.t, b.x + 12, by + 22, { s: 12.5, w: "900", c: v(b.c + "-700") || v("--ink") });
        text(ctx, b.s, b.x + 12, by + 42, { s: 11, c: v("--mist") });
        text(ctx, b.val, b.x + 12, by + 62, { s: 12, w: "800" });
        if (i < 3) {
          ctx.strokeStyle = v("--mist"); ctx.fillStyle = v("--mist"); ctx.lineWidth = 2.5;
          window.drawArrow(ctx, b.x + 192, by + bh / 2, b.x + 216, by + bh / 2, 9);
        }
      });
      text(ctx, "화산 기체(H₂·H₂S)도 산소를 " + V + "만큼 먹어 치운다", 24, by + bh + 22, { s: 11.5, c: v("--rose-700"), w: "800" });

      /* 아래쪽 : 시간 그래프 */
      var x0 = 70, x1 = 820, y0 = 160, y1 = H - 46;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      for (var g = 0; g <= NT; g += 50) {
        var gx = x0 + g / NT * (x1 - x0);
        text(ctx, g + "", gx, y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      }
      text(ctx, "남세균이 나타난 뒤 흐른 시간 (칸)", (x0 + x1) / 2, y1 + 36, { s: 11, c: v("--mist"), a: "center" });

      var aMax = Math.max(120, atmEnd);
      /* 철 잔량 */
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 3; ctx.beginPath();
      for (var i = 0; i <= 200; i++) {
        var t = i / 200 * NT, xx = x0 + i / 200 * (x1 - x0);
        var yy = y1 - ironAt(net, t) / FE * (y1 - y0);
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      /* 대기 산소 */
      ctx.strokeStyle = v("--violet"); ctx.lineWidth = 3; ctx.beginPath();
      for (var j = 0; j <= 200; j++) {
        var t2 = j / 200 * NT, x2 = x0 + j / 200 * (x1 - x0);
        var y2 = y1 - clamp(atmAt(net, tS, t2) / aMax, 0, 1) * (y1 - y0);
        if (j === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
      }
      ctx.stroke();
      if (r.start) {
        var sx = x0 + tS / NT * (x1 - x0);
        ctx.strokeStyle = v("--amber"); ctx.setLineDash([5, 5]); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx, y0); ctx.lineTo(sx, y1); ctx.stroke(); ctx.setLineDash([]);
        text(ctx, "철이 바닥남 (" + tS.toFixed(0) + "칸)", clamp(sx + 6, x0, 660), y0 + 14, { s: 11, w: "800", c: v("--amber-700") });
      }
      text(ctx, "🔵 바닷속 철 이온 잔량", x0 + 6, y0 - 12, { s: 12, w: "800", c: v("--brand") });
      text(ctx, "🟣 대기에 쌓인 산소", x0 + 200, y0 - 12, { s: 12, w: "800", c: v("--violet") });
      text(ctx, "철 " + FE, x0 - 8, y0 + 6, { s: 10.5, c: v("--mist"), a: "right" });
      text(ctx, "0", x0 - 8, y1 + 4, { s: 10.5, c: v("--mist"), a: "right" });

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

    function px(a) { return 70 + (46 - a) / 46 * (850 - 70); }
    function py(val, y0, y1) { return y1 - (Math.log(Math.max(val, 0.0001)) / Math.LN10 - LO) / (HI - LO) * (y1 - y0); }

    function draw() {
      paper(ctx, W, H);
      var y0 = 46, y1 = H - 56;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(70, y0); ctx.lineTo(70, y1); ctx.lineTo(850, y1); ctx.stroke();
      [0.0001, 0.001, 0.01, 0.1, 1, 10].forEach(function (g) {
        var gy = py(g, y0, y1);
        ctx.globalAlpha = .35; ctx.beginPath(); ctx.moveTo(70, gy); ctx.lineTo(850, gy); ctx.stroke(); ctx.globalAlpha = 1;
        text(ctx, g + "%", 64, gy + 4, { s: 10, c: v("--mist"), a: "right" });
      });
      [46, 40, 30, 24, 20, 10, 5, 0].forEach(function (g) {
        text(ctx, g + "", px(g), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      });
      text(ctx, "억 년 전", (70 + 850) / 2, y1 + 38, { s: 11, c: v("--mist"), a: "center" });
      text(ctx, "대기 중 산소 농도 (%, 로그 눈금)", 74, y0 - 16, { s: 12.5, w: "800" });

      [[24, "대산소화 사건"], [4.4, "육상 진출"]].forEach(function (mk) {
        var mxx = px(mk[0]);
        ctx.strokeStyle = v("--amber"); ctx.setLineDash([5, 5]); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(mxx, y0); ctx.lineTo(mxx, y1); ctx.stroke(); ctx.setLineDash([]);
        text(ctx, mk[1], clamp(mxx + 5, 70, 760), y0 + 12, { s: 10.5, w: "800", c: v("--amber-700") });
      });

      ctx.strokeStyle = v("--teal"); ctx.lineWidth = 3; ctx.beginPath();
      for (var i = 0; i <= 460; i++) {
        var a = 46 - i / 460 * 46;
        var xx = px(a), yy = py(o2At(a), y0, y1);
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();

      var val = o2At(age), cxp = px(age), cyp = py(val, y0, y1);
      ctx.strokeStyle = v("--brand"); ctx.setLineDash([4, 4]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cxp, y0); ctx.lineTo(cxp, y1); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(cxp, cyp, 7, 0, Math.PI * 2); ctx.fill();
      text(ctx, (val < 0.01 ? val.toFixed(4) : val.toFixed(1)) + "%", clamp(cxp + 10, 70, 800), cyp - 10, { s: 13, w: "900", c: v("--coral-700") });

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
    var rel = 100 * Math.pow(Math.max(pal, 0), 0.55);          // 오늘날을 100 으로 본 오존층 두께
    return { rel: rel, tr: Math.exp(-5.81 * rel / 100) };
  }

  (function () {
    var canvas = $("b-c3"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var pct = 2, got = window.sthState("b4") || { a: false, b: false };

    function draw() {
      paper(ctx, W, H);
      var o = ozone(pct), tr = o.tr;
      var sky0 = 40, ozY = 150, ground = 320;

      /* 하늘 */
      ctx.fillStyle = v("--brand"); ctx.globalAlpha = .12; ctx.fillRect(40, sky0, 500, ground - sky0); ctx.globalAlpha = 1;
      /* 오존층 */
      var th = clamp(o.rel / 100 * 40, 2, 48);
      ctx.fillStyle = v("--violet"); ctx.globalAlpha = clamp(0.2 + o.rel / 130, 0.2, 0.95);
      ctx.fillRect(40, ozY - th / 2, 500, th); ctx.globalAlpha = 1;
      text(ctx, "오존층 (O₃)", 52, ozY - th / 2 - 8, { s: 12, w: "800", c: v("--violet-700") });
      text(ctx, "두께 " + o.rel.toFixed(0) + " (오늘날 = 100)", 380, ozY - th / 2 - 8, { s: 11.5, w: "800", c: v("--violet-700") });

      /* 자외선 화살표 */
      var arrows = 6;
      for (var i = 0; i < arrows; i++) {
        var ax = 90 + i * 76;
        ctx.strokeStyle = v("--rose"); ctx.fillStyle = v("--rose"); ctx.lineWidth = 4;
        window.drawArrow(ctx, ax, sky0 + 8, ax, ozY - th / 2 - 4, 10);
        var pass = (i + 0.5) / arrows <= tr;
        if (pass) {
          ctx.strokeStyle = v("--rose"); ctx.fillStyle = v("--rose"); ctx.lineWidth = 4;
          window.drawArrow(ctx, ax, ozY + th / 2 + 4, ax, ground - 8, 10);
        } else {
          ctx.globalAlpha = .28; ctx.strokeStyle = v("--rose"); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(ax - 8, ozY + th / 2 + 10); ctx.lineTo(ax + 8, ozY + th / 2 + 26);
          ctx.moveTo(ax + 8, ozY + th / 2 + 10); ctx.lineTo(ax - 8, ozY + th / 2 + 26); ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
      text(ctx, "☀️ 태양 자외선", 52, sky0 + 18, { s: 12, w: "800", c: v("--rose-700") });

      /* 지표 */
      ctx.fillStyle = v(tr < 0.01 ? "--green" : "--coral-100"); ctx.fillRect(40, ground, 500, 46);
      text(ctx, tr < 0.01 ? "🌿 육지에 생물이 살 수 있다" : "🏜️ 육지는 자외선에 그대로 노출된다",
        52, ground + 28, { s: 13, w: "800", c: tr < 0.01 ? v("--green-700") : v("--coral-700") });
      ctx.fillStyle = v("--brand"); ctx.globalAlpha = .5; ctx.fillRect(330, ground, 210, 46); ctx.globalAlpha = 1;
      text(ctx, "바닷속은 물이 자외선을 막아 준다", 336, ground + 62, { s: 10.5, c: v("--mist") });

      /* 오른쪽 계기판 */
      var x0 = 572;
      box(ctx, x0, 60, 300, 120, v("--card-2"));
      text(ctx, "지표에 닿는 자외선", x0 + 150, 88, { s: 11.5, c: v("--mist"), a: "center" });
      text(ctx, (tr * 100).toFixed(1) + " %", x0 + 150, 134, { s: 34, w: "900", a: "center",
        c: tr < 0.01 ? v("--green-700") : (tr > 0.3 ? v("--rose-700") : v("--amber-700")) });
      text(ctx, "산소 농도 " + pct.toFixed(1) + "% 일 때", x0 + 150, 162, { s: 11.5, a: "center", c: v("--mist") });

      text(ctx, "O₂ + 자외선 → O + O", x0, 218, { s: 12.5, w: "800", c: v("--violet-700") });
      text(ctx, "O + O₂ → O₃ (오존)", x0, 242, { s: 12.5, w: "800", c: v("--violet-700") });
      text(ctx, "산소가 많아질수록 오존이 많이 만들어지고,", x0, 272, { s: 11.5, c: v("--mist") });
      text(ctx, "오존층이 두꺼워질수록 자외선이 더 많이 막힌다.", x0, 292, { s: 11.5, c: v("--mist") });
      text(ctx, "자외선 투과율이 1% 아래로 내려가야", x0, 326, { s: 11.5, c: v("--mist") });
      text(ctx, "육상 생물이 살아남을 수 있다.", x0, 346, { s: 11.5, c: v("--mist") });

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
    var T = 0, got = window.sthState("c2") || { a: false, b: false, c: false };

    function draw() {
      paper(ctx, W, H);
      var w = water(T), sc = w.sc, ice = w.ice;

      /* 저장고 */
      var res = [
        { x: 40,  y: 40,  w: 200, h: 76, n: "기권 · 수증기", val: num(12.9 * sc, 1) + " 천 km³", c: "--brand" },
        { x: 40,  y: 150, w: 200, h: 76, n: "지권 · 빙하", val: num(224000 * ice, 0) + " 천 km³", c: "--violet" },
        { x: 40,  y: 260, w: 200, h: 76, n: "지권 · 지하수·하천", val: num(23576 * clamp(1 - ice, 0.02, 1), 0) + " 천 km³", c: "--teal" },
        { x: 470, y: 150, w: 210, h: 90, n: "수권 · 해양", val: num(1338000 - 224000 * ice + 24064, 0) + " 천 km³", c: "--brand-700" }
      ];
      res.forEach(function (r) {
        box(ctx, r.x, r.y, r.w, r.h, v(r.c), .22);
        ctx.strokeStyle = v(r.c); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 12); ctx.stroke();
        text(ctx, r.n, r.x + 12, r.y + 24, { s: 12.5, w: "900" });
        text(ctx, r.val, r.x + 12, r.y + 48, { s: 12, w: "800", c: v("--mist") });
      });
      text(ctx, "지구 전체 물의 양은 늘 같다 — 자리만 바뀐다", 40, 360, { s: 11.5, c: v("--mist") });

      /* 흐름 화살표 */
      var flows = [
        { x1: 560, y1: 150, x2: 300, y2: 78,  n: "해양 증발", val: 413000 * sc, c: "--brand" },
        { x1: 240, y1: 92,  x2: 470, y2: 160, n: "해양 강수", val: 373000 * sc, c: "--teal" },
        { x1: 150, y1: 116, x2: 150, y2: 150, n: "육지 강수", val: 113000 * sc, c: "--teal" },
        { x1: 250, y1: 290, x2: 470, y2: 220, n: "하천·지하수 유출", val: 40000 * sc, c: "--coral" }
      ];
      flows.forEach(function (f, i) {
        ctx.strokeStyle = v(f.c); ctx.fillStyle = v(f.c);
        ctx.lineWidth = clamp(2 + 8 * (f.val / 500000), 2, 11);
        window.drawArrow(ctx, f.x1, f.y1, f.x2, f.y2, 12);
      });
      text(ctx, "🔼 해양 증발 " + num(413000 * sc) + " km³/년", 300, 44, { s: 11.5, w: "800", c: v("--brand") });
      text(ctx, "🔽 해양 강수 " + num(373000 * sc) + " km³/년", 300, 64, { s: 11.5, w: "800", c: v("--teal") });
      text(ctx, "🔽 육지 강수 " + num(113000 * sc) + " km³/년", 300, 128, { s: 11.5, w: "800", c: v("--teal") });
      text(ctx, "➡️ 유출 " + num(40000 * sc) + " km³/년", 258, 310, { s: 11.5, w: "800", c: v("--coral") });

      /* 오른쪽 계기판 */
      var x0 = 700;
      box(ctx, x0, 40, 170, 96, v("--card-2"));
      text(ctx, "얼음이 덮은 넓이", x0 + 85, 66, { s: 11, c: v("--mist"), a: "center" });
      text(ctx, Math.round(ice * 100) + " %", x0 + 85, 106, { s: 30, w: "900", a: "center", c: v("--violet-700") });
      box(ctx, x0, 150, 170, 96, v("--card-2"));
      text(ctx, "물의 순환 세기", x0 + 85, 176, { s: 11, c: v("--mist"), a: "center" });
      text(ctx, Math.round(sc * 100) + " %", x0 + 85, 216, { s: 30, w: "900", a: "center", c: v("--brand-700") });
      text(ctx, "(지금을 100으로 본 값)", x0 + 85, 236, { s: 10, c: v("--mist"), a: "center" });
      text(ctx, "따뜻할수록 증발이 늘어", x0, 280, { s: 11, c: v("--mist") });
      text(ctx, "물의 순환이 빨라지고,", x0, 298, { s: 11, c: v("--mist") });
      text(ctx, "추울수록 물이 빙하에", x0, 316, { s: 11, c: v("--mist") });
      text(ctx, "붙잡혀 순환이 느려진다.", x0, 334, { s: 11, c: v("--mist") });

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
    var V = 1, k = 1, got = window.sthState("c3") || { a: false, b: false }, okQ = !!window.sthState("c3q");

    function draw() {
      paper(ctx, W, H);
      var r = carbon(V, k), P = r.P, T = r.T;

      /* 저장고 */
      var res = [
        { x: 330, y: 34,  w: 230, h: 74, n: "기권 · 대기 CO₂", val: Math.round(P) + " ppm", c: "--brand" },
        { x: 40,  y: 176, w: 220, h: 80, n: "생물권 · 숲과 토양", val: "약 2,300 Gt C", c: "--green" },
        { x: 630, y: 176, w: 230, h: 80, n: "수권 · 해양", val: "약 38,000 Gt C", c: "--teal" },
        { x: 330, y: 300, w: 230, h: 84, n: "지권 · 석회암·화석 연료", val: "약 6,000만 Gt C", c: "--coral" }
      ];
      res.forEach(function (b) {
        box(ctx, b.x, b.y, b.w, b.h, v(b.c), .22);
        ctx.strokeStyle = v(b.c); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 12); ctx.stroke();
        text(ctx, b.n, b.x + 12, b.y + 24, { s: 12.5, w: "900" });
        text(ctx, b.val, b.x + 12, b.y + 50, { s: 14, w: "800", c: v(b.c + "-700") || v("--ink") });
      });

      /* 화산 : 지권 → 기권 */
      ctx.strokeStyle = v("--rose"); ctx.fillStyle = v("--rose");
      ctx.lineWidth = clamp(2 + 3.0 * V, 2, 16);
      window.drawArrow(ctx, 300, 300, 300, 112, 14);
      text(ctx, "🌋 화산 탈가스", 52, 292, { s: 12, w: "800", c: v("--rose-700") });
      text(ctx, "지금의 " + V.toFixed(2) + "배", 52, 312, { s: 11.5, c: v("--mist") });

      /* 풍화 : 기권 → (생물권/수권) → 지권 */
      var wRate = Math.pow(2, 0.7213 * r.x) * k;       // = V (정상 상태)
      ctx.strokeStyle = v("--teal"); ctx.fillStyle = v("--teal");
      ctx.lineWidth = clamp(2 + 3.0 * wRate, 2, 16);
      window.drawArrow(ctx, 590, 112, 590, 300, 14);
      text(ctx, "🌧️ 규산염 풍화", 620, 292, { s: 12, w: "800", c: v("--teal-700") });
      text(ctx, "→ 석회암으로 묻힘", 620, 312, { s: 11.5, c: v("--mist") });
      text(ctx, "풍화 세기 " + wRate.toFixed(2) + "배", 620, 332, { s: 11.5, c: v("--mist") });

      /* 빠른 순환 (광합성·호흡) */
      ctx.strokeStyle = v("--green"); ctx.fillStyle = v("--green"); ctx.lineWidth = 3;
      window.drawArrow(ctx, 260, 196, 330, 96, 10);
      window.drawArrow(ctx, 320, 86, 250, 186, 10);
      text(ctx, "광합성·호흡 (빠른 순환)", 40, 168, { s: 11, w: "800", c: v("--green-700") });
      ctx.strokeStyle = v("--teal"); ctx.fillStyle = v("--teal"); ctx.lineWidth = 3;
      window.drawArrow(ctx, 630, 190, 566, 96, 10);
      window.drawArrow(ctx, 576, 88, 640, 180, 10);
      text(ctx, "바다-대기 교환 (빠른 순환)", 630, 168, { s: 11, w: "800", c: v("--teal-700") });

      /* 계기판 */
      box(ctx, 40, 34, 230, 116, v("--card-2"));
      text(ctx, "균형이 잡힌 뒤의 상태", 155, 58, { s: 11, c: v("--mist"), a: "center" });
      text(ctx, Math.round(P) + " ppm", 155, 92, { s: 24, w: "900", a: "center", c: v("--brand-700") });
      text(ctx, (T >= 0 ? "+" : "") + T.toFixed(1) + " ℃", 155, 128, { s: 26, w: "900", a: "center",
        c: T <= 0 ? v("--brand-700") : (T >= 28 ? v("--rose-700") : v("--green-700")) });
      text(ctx, "풍화 조건 " + k.toFixed(1) + "배", 630, 396, { s: 11, c: v("--mist") });
      text(ctx, "화산이 내보낸 만큼을 풍화가 치워 낼 때 균형이 잡힌다", 40, 396, { s: 11.5, c: v("--mist") });

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
    $("c-volc").addEventListener("input", function (e) { V = +e.target.value; $("c-volc-val").textContent = V.toFixed(2); draw(); });
    $("c-land").addEventListener("input", function (e) { k = +e.target.value; $("c-land-val").textContent = k.toFixed(1); draw(); });
    window.sthPick({
      mount: "c-q1",
      q: "화산 활동이 갑자기 2배로 늘어도 대기 이산화 탄소가 2배보다 훨씬 더 늘지는 않습니다. 왜 그럴까요?",
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
      paper(ctx, W, H);
      var x0 = 70, x1 = 640, y0 = 56, y1 = H - 60, n = sim.t.length - 1;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      [0, 10, 20, 30, 40, 50, 60].forEach(function (g) {
        var gx = x0 + g / 60 * (x1 - x0);
        text(ctx, g + "", gx, y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      });
      text(ctx, "얼어붙은 뒤 흐른 시간 (백만 년)", (x0 + x1) / 2, y1 + 38, { s: 11, c: v("--mist"), a: "center" });

      /* 탈출 문턱선 */
      var thrY = y1 - clamp((-15 + 60) / 60, 0, 1) * (y1 - y0);
      ctx.strokeStyle = v("--amber"); ctx.setLineDash([6, 5]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, thrY); ctx.lineTo(x1, thrY); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "얼음이 녹기 시작하는 문턱 (−15 ℃)", x0 + 6, thrY - 8, { s: 10.5, w: "800", c: v("--amber-700") });

      /* CO₂ */
      var pMax = Math.max(150000, sim.P[n]);
      ctx.strokeStyle = v("--coral"); ctx.lineWidth = 3; ctx.beginPath();
      for (var i = 0; i <= upto; i++) {
        var xx = x0 + i / n * (x1 - x0);
        var yy = y1 - clamp(sim.P[i] / pMax, 0, 1) * (y1 - y0);
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      /* 기온 */
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 3; ctx.beginPath();
      for (var j = 0; j <= upto; j++) {
        var x2 = x0 + j / n * (x1 - x0);
        var y2 = y1 - clamp((sim.T[j] + 60) / 60, 0, 1) * (y1 - y0);
        if (j === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
      }
      ctx.stroke();
      text(ctx, "🟠 대기 CO₂ (0 ~ " + num(Math.round(pMax)) + " ppm)", x0 + 4, y0 - 28, { s: 12, w: "800", c: v("--coral") });
      text(ctx, "🔵 얼음 위 기온 (−60 ~ 0 ℃)", x0 + 260, y0 - 28, { s: 12, w: "800", c: v("--brand") });

      /* 오른쪽 : 현재 상태 */
      var xr = 674, cur = Math.min(upto, n);
      var escaped = sim.esc !== null && sim.t[cur] >= sim.esc;
      box(ctx, xr, 56, 196, 108, v("--card-2"));
      text(ctx, sim.t[cur].toFixed(0) + " 백만 년 뒤", xr + 98, 82, { s: 11.5, c: v("--mist"), a: "center" });
      text(ctx, num(Math.round(sim.P[cur])) + " ppm", xr + 98, 114, { s: 19, w: "900", a: "center", c: v("--coral-700") });
      text(ctx, sim.T[cur].toFixed(1) + " ℃", xr + 98, 146, { s: 19, w: "900", a: "center", c: v("--brand-700") });

      ctx.beginPath(); ctx.arc(xr + 98, 250, 62, 0, Math.PI * 2);
      ctx.fillStyle = v(escaped ? "--coral" : "--brand-100"); ctx.fill();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.stroke();
      text(ctx, escaped ? "🔥" : "🧊", xr + 98, 262, { s: 40, a: "center" });
      text(ctx, escaped ? "얼음이 녹는다" : "아직 눈덩이 지구", xr + 98, 336, { s: 13, w: "900", a: "center",
        c: escaped ? v("--coral-700") : v("--brand-700") });
      text(ctx, escaped ? "쌓인 CO₂가 초온실을 만든다" : "풍화가 멎어 CO₂만 쌓인다", xr + 98, 358, { s: 11, c: v("--mist"), a: "center" });
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
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>얼음이 <b>풍화라는 브레이크</b>를 멈춰 세운 사이, 화산이 내보낸 이산화 탄소가 수천만 년 동안 쌓여 결국 지구를 녹였습니다. 실제 연구에서도 탈출에 필요한 CO₂는 약 0.1기압(10만 ppm 안팎)으로 추정합니다.");
        ep.clear(3);
      }
    }

    var still = escapeRun(1);
    canvas._redraw = function () { chart(still, 0); };
    chart(still, 0);

    $("c-esc").addEventListener("input", function (e) { V = +e.target.value; $("c-esc-val").textContent = V.toFixed(1); });
    $("c-run").addEventListener("click", function () {
      var sim = escapeRun(V), n = sim.t.length - 1, i = 0, btn = $("c-run");
      btn.disabled = true;
      canvas._redraw = function () { chart(sim, Math.min(i, n)); };
      (function step() {
        i = Math.min(n, i + Math.ceil(n / 90));
        chart(sim, i);
        if (i < n) { window.setTimeout(step, 22); return; }
        btn.disabled = false; btn.textContent = "▶ 다른 세기로 흘려보내기";
        log.push({ v: V.toFixed(1), esc: sim.esc });
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
    { key: "r3", label: "③ 눈덩이 지구를 녹인 것" }
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
    { key: "r3", label: "③ 눈덩이 지구를 녹인 것" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
