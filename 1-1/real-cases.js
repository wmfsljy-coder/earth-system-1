/* 지구시스템과학1 Ⅰ-1 지구의 탄생과 물질의 순환 — 실제 자료
   r1 보스토크 빙하 코어: 빙하기는 얼마마다 돌아왔나, 이산화 탄소는 어떻게 따라갔나
   r2 지구가 숨 쉰다: 마우나로아 이산화 탄소의 계절 변화(탄소 순환)
   r3 우리 동네 물의 순환 — 2025년 창원 강수량은 평년의 몇 %
   자료: data/vostok.js (NOAA NCEI 고기후 자료, Petit 외 1999 · Barnola 외), data/co2-mlo.js (NOAA GML) — 공공 영역, data/cw155.js */
(function () {
"use strict";
var VT = (window.REAL_VOSTOK || { temp: [] }).temp;       /* [얼음 나이(년 전), 기온 차 °C(현재 대비)] */
var VC = (window.REAL_VOSTOK || { co2: [] }).co2;         /* [기체 나이(년 전), ppm] */
var MM = (window.REAL_CO2 || { monthly: [] }).monthly;    /* [연도, 월, 월평균 ppm] */
var SEA = (function () {                                 /* 13개월 중심 이동 평균(추세)을 빼고 달마다 평균 */
  var v = MM.map(function (r) { return r[2]; }), sum = [], cnt = [], out = [], m;
  for (m = 1; m <= 12; m++) { sum[m] = 0; cnt[m] = 0; }
  for (var i = 6; i < v.length - 6; i++) {
    var s = 0.5 * (v[i - 6] + v[i + 6]); for (var j = -5; j <= 5; j++) s += v[i + j];
    sum[MM[i][1]] += v[i] - s / 12; cnt[MM[i][1]]++;
  }
  for (m = 1; m <= 12; m++) out[m] = cnt[m] ? sum[m] / cnt[m] : 0;
  return out;
})();
var YR = MM.length ? MM[0][0] + " ~ " + MM[MM.length - 1][0] : "";
var SRC1 = "<small>출처: NOAA 국립환경정보센터(NCEI) 고기후 자료 — 남극 보스토크 빙하 코어 기온 차(Petit 외, 1999, Nature 399)와 이산화 탄소(Barnola 외). 기온 차는 얼음 속 수소 동위 원소 비로 구한 남극 기온의 현재 대비 차이입니다. 사본은 data/vostok.js.</small>";
var SRC2 = "<small>출처: NOAA 지구감시연구소 GML, 마우나로아 관측소 월평균 이산화 탄소(" + YR + "). 13개월 이동 평균(추세)을 뺀 뒤 달마다 평균했습니다. 사본은 data/co2-mlo.js.</small>";
var ZR = ((window.REAL_CW155 || {}).rows || []), ZP = {}; ZR.forEach(function (r) { ZP[r[0]] = r[5]; });
var Z_NP = (window.REAL_CW155 || { normal: { P: 1534 } }).normal.P, Z_P25 = ZP[2025] || 1182, Z_PCT = Z_P25 / Z_NP * 100;
var Z_M = ((window.REAL_CW155 || {}).monthP || []), Z_N9 = Z_M.slice(0, 9).reduce(function (s, v) { return s + v; }, 0);
var Z_26 = (window.REAL_CW155 || {}).p2026 || null;
var SRC_Z = "<small>출처: 기상청 날씨누리 과거 관측 일별 자료, 창원(155) 일강수량을 해마다 더한 값. 평년(1991 ~ 2020) " + Z_NP.toLocaleString() + " mm. 사본은 data/cw155.js.</small>";

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 탄소가 대기·생물·바다를 오가는 모습을 실제 자료로 설명해 보세요.",
  cases: [
  {
    id: "r1", sec: "03", tag: "실제 자료 · 빙하 코어", title: "빙하기는 얼마마다 돌아왔나", short: "빙하기 주기",
    who: "🧊", name: "남극 보스토크 기지",
    say: "“남극 얼음을 3,600 m 넘게 뚫어 올린 얼음 기둥에는 42만 년 동안의 공기와 기온의 흔적이 층층이 남아 있어요. 아래는 그 <b>실제 측정값</b>입니다. 기온이 지금만큼 따뜻했던 봉우리(간빙기)를 찾아, <b>간빙기와 간빙기 사이가 평균 몇 천 년</b>인지 구해 주세요.”",
    predict: {
      q: "지난 40만 년 동안 지구의 기후는 어떻게 변했을까요?",
      options: ["㉠ 줄곧 지금과 비슷했다", "㉡ 추운 빙기와 따뜻한 간빙기가 일정한 간격으로 되풀이되었다", "㉢ 갈수록 꾸준히 따뜻해졌다"],
      answer: 1
    },
    task: "보기를 바꿔 가며 기온 봉우리를 찾고, <b>간빙기 사이의 평균 간격</b>을 슬라이더로 맞추세요(± 10 천 년).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(300), ctx = cv.ctx, W = cv.W, gap = 40, show = "t";
      var x0 = 60, x1 = 760, y0 = 24, y1 = 250;
      function X(a) { return x1 - a / 420000 * (x1 - x0); }        /* 왼쪽이 옛날, 오른쪽이 지금 */
      function YT(t) { return y1 - (t + 10) / 14 * (y1 - y0); }
      function YC(c) { return y1 - (c - 170) / 140 * (y1 - y0); }
      function draw() {
        H.paper(ctx, W, cv.H); H.axes(ctx, x0, y0, x1, y1);
        [0, 100, 200, 300, 400].forEach(function (k) { H.text(ctx, k ? k + "천 년 전" : "지금", X(k * 1000), y1 + 15, { s: 10, a: "center", c: H.v("--mist") }); });
        if (show !== "c") {
          [-8, -4, 0, 2].forEach(function (t) { H.text(ctx, (t > 0 ? "+" : "") + t + "°C", x0 - 6, YT(t) + 4, { s: 10, a: "right", c: H.v("--brand-700") }); });
          H.dash(ctx, x0, YT(0), x1, YT(0), H.v("--line"), 1);
          H.line(ctx, VT.map(function (r) { return [X(r[0]), YT(r[1])]; }), H.v("--brand"), 1.8);
        }
        if (show !== "t") {
          [200, 250, 300].forEach(function (c) { H.text(ctx, c + " ppm", x1 + 8, YC(c) + 4, { s: 10, c: H.v("--coral-700") }); });
          H.line(ctx, VC.map(function (r) { return [X(r[0]), YC(r[1])]; }), H.v("--coral-700"), 1.8);
        }
        /* 학생이 고른 간격으로 '지금'부터 눈금을 찍는다 */
        for (var k = 0; 8 + k * gap <= 420; k++) { var xx = X((8 + k * gap) * 1000); H.dash(ctx, xx, y0, xx, y1, H.v("--amber-700"), 1.2); }
        H.text(ctx, "노란 점선 = 지금 간빙기의 봉우리(약 8천 년 전)부터 " + gap + "천 년마다", x0 + 8, y0 + 4, { s: 11, w: "800", c: H.v("--amber-700") });
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "보기", value: "t", options: [{ v: "t", t: "기온 차" }, { v: "c", t: "이산화 탄소" }, { v: "b", t: "둘 다" }], onPick: function (x) { show = x; draw(); } });
      api.slider({ label: "간빙기 사이의 간격", min: 20, max: 200, step: 5, value: 40, fmt: function (x) { return x + " 천 년"; }, onInput: function (x) { gap = x; api.changed(); draw(); } });
      api.info("노란 점선이 기온 봉우리에 차례로 대략 겹치게 간격을 맞춰 보세요(봉우리 간격이 꼭 같지는 않습니다). " + SRC1
        + "<div data-map='{\"id\":\"vostok\",\"name\":\"남극 보스토크 기지\",\"lat\":-78.464,\"lng\":106.837,\"zoom\":13,\"ask\":\"기지 둘레에 무엇이 보이나요? 이 얼음 아래 3,600 m 깊이까지 뚫었습니다. 얼음이 이렇게 두껍게 쌓일 수 있었던 까닭을 짐작해 적어 보세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (gap >= 90 && gap <= 110) return { ok: true, msg: "약 12만 · 24만 · 32만 · 41만 년 전의 간빙기 — 약 10만 년마다 되풀이되었습니다." };
          return { ok: false, msg: gap + " 천 년 간격은 봉우리와 " + (gap < 90 ? "너무 촘촘해 맞지 않습니다." : "너무 성겨 봉우리를 건너뜁니다.") };
        }
      };
    },
    hints: ["‘지금’ 말고 기온이 0 °C 위로 솟은 봉우리를 세어 보세요. 42만 년 동안 네 번 있습니다.", "약 41만 년 전 봉우리 ÷ 4 ≈ ?"],
    solution: "약 <b>10만 년</b> (90~110 천 년).",
    why: "빙기와 간빙기가 약 10만 년마다 되풀이된 것은 지구 공전 궤도의 모양(이심률)이 약 10만 년 주기로 바뀌는 것과 맞물려 있습니다(밀란코비치 주기). 궤도 변화가 처음 방아쇠를 당기면, 바다가 이산화 탄소를 내놓거나 빨아들이며 기온 변화를 키웠습니다. ‘둘 다’를 보면 이산화 탄소(180~300 ppm)가 기온과 거의 함께 오르내립니다.<br>"
      + "지난 80만 년 동안 이산화 탄소는 300 ppm을 넘은 적이 없었는데, 지금은 420 ppm을 넘었습니다. 자연의 순환보다 훨씬 빠르고 큰 변화가 일어나고 있다는 뜻입니다."
  },
  {
    id: "r2", sec: "03", tag: "실제 자료 · 탄소 순환", title: "지구가 숨 쉬는 달력", short: "계절 변화",
    who: "🌿", name: "탄소 순환 연구실",
    say: "“마우나로아의 이산화 탄소 그래프를 확대하면 해마다 톱니처럼 오르내려요. 아래는 " + YR + "년 자료에서 해마다의 증가분을 빼고 <b>계절에 따른 오르내림만</b> 남긴 것입니다. 이산화 탄소가 <b>가장 많은 달</b>과 <b>가장 적은 달</b>을 찾아 주세요.”",
    predict: {
      q: "북반구에서 이산화 탄소가 가장 적어지는 때는 언제일까요?",
      options: ["㉠ 한겨울", "㉡ 식물이 한창 자란 여름이 끝날 무렵", "㉢ 계절과 관계없다"],
      answer: 1
    },
    task: "슬라이더 두 개로 <b>가장 많은 달</b>과 <b>가장 적은 달</b>을 고르세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(270), ctx = cv.ctx, W = cv.W, hi = 1, lo = 1;
      var x0 = 70, x1 = 640, y0 = 24, y1 = 230;
      function X(m) { return x0 + (m - 0.5) / 12 * (x1 - x0); }
      function Y(d) { return y1 - (d + 4) / 8 * (y1 - y0); }
      function draw() {
        H.paper(ctx, W, cv.H); H.axes(ctx, x0, y0, x1, y1);
        [-3, 0, 3].forEach(function (d) { H.text(ctx, (d > 0 ? "+" : "") + d + " ppm", x0 - 8, Y(d) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
        H.dash(ctx, x0, Y(0), x1, Y(0), H.v("--line"), 1);
        for (var m = 1; m <= 12; m++) {
          var on = m === hi ? "--coral-700" : (m === lo ? "--brand-700" : null);
          H.box(ctx, X(m) - 16, Math.min(Y(0), Y(SEA[m])), 32, Math.abs(Y(SEA[m]) - Y(0)), on ? H.v(on) : H.v("--line"), on ? 0.95 : 0.8);
          H.text(ctx, m + "월", X(m), y1 + 15, { s: 10.5, w: on ? "900" : "500", a: "center", c: on ? H.v(on) : H.v("--mist") });
        }
        H.rows(ctx, 680, 50, [["가장 많은 달 (내 답)", hi + "월 " + (SEA[hi] >= 0 ? "+" : "") + SEA[hi].toFixed(2) + " ppm", "--coral-700"], ["가장 적은 달 (내 답)", lo + "월 " + (SEA[lo] >= 0 ? "+" : "") + SEA[lo].toFixed(2) + " ppm", "--brand-700"]], 62);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "가장 많은 달", min: 1, max: 12, step: 1, value: 1, fmt: function (x) { return x + "월"; }, onInput: function (x) { hi = x; api.changed(); draw(); } });
      api.slider({ label: "가장 적은 달", min: 1, max: 12, step: 1, value: 1, fmt: function (x) { return x + "월"; }, onInput: function (x) { lo = x; api.changed(); draw(); } });
      api.info("막대는 그해 평균보다 몇 ppm 많고 적은지입니다. " + SRC2
        + "<div data-link='{\"id\":\"gml-season\",\"title\":\"마우나로아 이산화 탄소 최신 그래프\",\"src\":\"NOAA 지구감시연구소\",\"url\":\"https://gml.noaa.gov/ccgg/trends/\",\"ask\":\"최근 1년 그래프에서 톱니의 꼭대기가 몇 월쯤인지 확인해, 이 막대 그래프와 같은지 적어 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          var mx = 1, mn = 1;
          for (var m = 2; m <= 12; m++) { if (SEA[m] > SEA[mx]) mx = m; if (SEA[m] < SEA[mn]) mn = m; }
          var loOk = lo === mn || Math.abs(SEA[lo] - SEA[mn]) < 0.15;
          if (hi === mx && loOk) return { ok: true, msg: mx + "월에 가장 많고(+" + SEA[mx].toFixed(1) + ") " + lo + "월에 가장 적습니다(" + SEA[lo].toFixed(1) + "). 한 해에 약 " + (SEA[mx] - SEA[mn]).toFixed(0) + " ppm 오르내려요." };
          return { ok: false, msg: (hi === mx ? "많은 달은 맞았습니다. " : "가장 많은 달이 아닙니다. ") + (loOk ? "적은 달은 맞았습니다." : "가장 적은 달이 아닙니다.") };
        }
      };
    },
    hints: ["가장 높은 막대와 가장 낮은 막대를 찾으세요.", "봄이 끝날 무렵 가장 많고, 가을이 시작될 무렵 가장 적습니다."],
    solution: "가장 많은 달 <b>5월</b>, 가장 적은 달 <b>9월</b>(10월도 거의 같음).",
    why: "북반구에는 육지와 숲이 남반구보다 훨씬 많습니다. 봄부터 여름까지 식물이 광합성으로 이산화 탄소를 빨아들여 9~10월에 가장 적어지고, 가을·겨울에는 잎이 지고 생물의 호흡과 분해가 이어져 다시 늘어 5월에 가장 많아집니다. 대기와 생물권 사이를 탄소가 해마다 오가는 <b>탄소 순환</b>이 그래프의 톱니로 보이는 것입니다.<br>"
      + "톱니가 해마다 조금씩 높아지는 것은 이 자연의 순환 위에 화석 연료에서 나온 탄소가 더해지기 때문입니다."
  },
  {
    id: "r3", sec: "03", tag: "실제 자료 · 우리 동네 물의 순환", title: "2025년, 우리 동네 땅 1 m²에 내린 비", short: "한 해 강수",
    who: "📍", name: "창원기상대(기상청)",
    say: "“물의 순환에서 비는 바다와 하늘을 거쳐 땅으로 돌아오는 물입니다. 강수량 1 mm는 <b>땅 1 m²에 물 1 L</b>가 고인 것과 같아요. 아래는 진해와 가까운 <b>창원기상대</b>의 해마다 강수량입니다. 가장 최근에 한 해가 다 끝난 <b>2025년</b>의 강수량이 평년(1991 ~ 2020년 평균)의 몇 %였는지 구해 주세요.”",
    predict: {
      q: "강수량 1,000 mm는 운동장 1 m²에 물이 몇 L 내린 것일까요?",
      options: ["㉠ 1 L", "㉡ 100 L", "㉢ 1,000 L(1 t)"],
      answer: 2
    },
    task: "막대 위 값을 읽어 <b>2025년 강수량 ÷ 평년 × 100</b>을 슬라이더로 맞추세요(± 2 %).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, k = 100;
      var ys = ZR.map(function (r) { return r[0]; }), x0 = 50, x1 = 640, y0 = 24, y1 = 240, n = ys.length || 1, bw = (x1 - x0) / n;
      function Y(v) { return y1 - v / 3000 * (y1 - y0); }
      function draw() {
        H.paper(ctx, W, cv.H); H.axes(ctx, x0, y0, x1, y1);
        [0, 1000, 2000, 3000].forEach(function (v) { H.text(ctx, v, x0 - 8, Y(v) + 4, { s: 10, a: "right", c: H.v("--mist") }); if (v) H.dash(ctx, x0, Y(v), x1, Y(v), H.v("--line"), 0.5); });
        H.text(ctx, "mm", x0 + 6, y0 - 8, { s: 11, w: "700", c: H.v("--mist") });
        ZR.forEach(function (r, i) { var last = r[0] === 2025; H.box(ctx, x0 + i * bw + 1.5, Y(r[5]), bw - 3, y1 - Y(r[5]), last ? H.v("--coral-700") : H.v("--brand"), last ? 0.95 : 0.55); if (r[0] % 5 === 0) H.text(ctx, r[0], x0 + i * bw + bw / 2, y1 + 15, { s: 10, a: "center", c: H.v("--mist") }); });
        H.dash(ctx, x0, Y(Z_NP), x1, Y(Z_NP), H.v("--amber-700"), 1.6);
        H.text(ctx, "평년 " + Z_NP.toLocaleString() + " mm", x0 + 6, Y(Z_NP) - 6, { s: 11, w: "800", c: H.v("--amber-700") });
        H.rows(ctx, 680, 34, [["2025년", Math.round(Z_P25).toLocaleString() + " mm", "--coral-700"], ["1 m²에 내린 물", Math.round(Z_P25).toLocaleString() + " L"], ["가장 많았던 해", (function () { var m = ZR.reduce(function (p, r) { return r[5] > p[5] ? r : p; }, [0, 0, 0, 0, 0, 0]); return m[0] + "년 " + Math.round(m[5]).toLocaleString() + " mm"; })()], ["내 답", k + " %", null, true]], 52);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "2025년은 평년의", min: 40, max: 160, step: 1, value: 100, fmt: function (x) { return x + " %"; }, onInput: function (x) { k = x; api.changed(); draw(); } });
      api.info("2026년은 9월까지 " + Math.round(Z_26 || 0).toLocaleString() + " mm로 평년 같은 기간(" + Math.round(Z_N9).toLocaleString() + " mm)의 " + (Z_26 ? Math.round(Z_26 / Z_N9 * 100) : 0) + " %였습니다. " + SRC_Z
        + "<div data-link='{\"id\":\"kma-cw155\",\"title\":\"창원 과거 관측 일별 자료\",\"src\":\"기상청 날씨누리\",\"url\":\"https://www.weather.go.kr/w/weather/land/past-obs/obs-by-day.do?stn=155&obs=1\",\"ask\":\"지난달을 골라 비가 온 날 수와 그달 강수량(날마다의 일강수량을 모두 더한 값)을 구해 오세요. 그달 비는 땅 1 m²에 물 몇 L가 고인 것과 같나요?\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(k - Z_PCT) <= 2) return { ok: true, msg: Math.round(Z_P25).toLocaleString() + " ÷ " + Z_NP.toLocaleString() + " × 100 ≈ " + Z_PCT.toFixed(0) + " %. 평년보다 비가 꽤 적은 해였습니다." };
          return { ok: false, msg: k + " %는 " + (k < Z_PCT ? "적습니다" : "많습니다") + ". 2025년 값을 평년 값으로 나눠 100을 곱하세요." };
        }
      };
    },
    hints: ["2025년 " + Math.round(Z_P25).toLocaleString() + " mm, 평년 " + Z_NP.toLocaleString() + " mm", Math.round(Z_P25) + " ÷ " + Z_NP + " × 100 = ?"],
    solution: Math.round(Z_P25).toLocaleString() + " ÷ " + Z_NP.toLocaleString() + " × 100 ≈ <b>" + Z_PCT.toFixed(0) + " %</b>.",
    why: "2025년 창원의 땅 1 m²에는 물 약 " + Math.round(Z_P25).toLocaleString() + " L(약 1.2 t)가 내렸습니다. 운동장이 1만 m²라면 약 1만 2천 t입니다. 이 물은 일부는 다시 증발하고, 일부는 땅속으로 스며 지하수가 되며, 나머지는 하천을 따라 바다로 돌아가 물의 순환을 이어 갑니다.<br>"
      + "그런데 2025년은 평년의 " + Z_PCT.toFixed(0) + " %, 2026년도 9월까지 평년의 " + (Z_26 ? Math.round(Z_26 / Z_N9 * 100) : 0) + " %로 비가 적은 해가 이어졌습니다. 해마다 강수량은 크게 달라서(가장 많은 해와 적은 해가 세 배 넘게 차이) 댐·저수지처럼 물을 저장해 두는 시설이 필요합니다."
  }
  ]
});
})();
