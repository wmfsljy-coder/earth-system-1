/* 지구시스템과학1 Ⅰ-2 판 구조 운동과 지구 내부 구조 — 실제 자료
   r1 북위 38° 단면: 일본 아래로 기울어 들어가는 태평양판의 각도
   r2 하와이 열점: 섬의 나이와 거리로 태평양판의 속력 구하기
   자료: data/quakes-38n.js (USGS 지진 목록, 2014 ~ 2023, 북위 37 ~ 39°, 규모 4.5 이상)
         하와이 섬 나이 — Clague & Dalrymple (1987), USGS Professional Paper 1350 의 K-Ar 연대. 거리는 킬라우에아에서 잰 대권 거리. */
(function () {
"use strict";
var S = (window.REAL_QUAKES_38N || { rows: [] }).rows;     /* [경도, 깊이 km, 규모] */
var TRENCH = 144.0, KMPD = 87.5;                            /* 일본 해구 축 ≈ 동경 144°, 북위 38° 에서 경도 1° ≈ 87.5 km */
function xkm(lon) { return (TRENCH - lon) * KMPD; }         /* 해구에서 서쪽(대륙 쪽)으로 잰 거리 */
var DEEP = S.filter(function (r) { return r[1] >= 70; });
var DIP = (function () { var sxx = 0, sxy = 0; DEEP.forEach(function (r) { var x = xkm(r[0]); sxx += x * x; sxy += x * r[1]; }); return Math.atan(sxy / sxx) * 180 / Math.PI; })();   /* 해구(원점)를 지나는 직선 */
var KIL = [19.41, -155.28];
var ISL = [["오아후(와이아나에)", 21.47, -158.15, 3.7], ["카우아이", 22.07, -159.50, 5.1], ["니호아", 23.06, -161.92, 7.2], ["네커", 23.58, -164.70, 10.3], ["미드웨이", 28.21, -177.37, 27.7]];
function gc(a, b) { var R = 6371, r = Math.PI / 180, dl = (b[0] - a[0]) * r, dn = (b[1] - a[1]) * r, x = Math.pow(Math.sin(dl / 2), 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.pow(Math.sin(dn / 2), 2); return 2 * R * Math.asin(Math.sqrt(x)); }
ISL.forEach(function (s) { s.push(gc(KIL, [s[1], s[2]])); });
var VFIT = (function () { var sxx = 0, sxy = 0; ISL.forEach(function (s) { sxx += s[3] * s[3]; sxy += s[3] * s[4]; }); return sxy / sxx / 10; })();   /* km/백만 년 ÷ 10 = cm/년 */
var SRC1 = "<small>출처: 미국 지질조사국(USGS) Earthquake Catalog, 2014 ~ 2023, 북위 37 ~ 39°·동경 128 ~ 146°, 규모 4.5 이상 " + S.length + "건. 사본은 data/quakes-38n.js.</small>";
var SRC2 = "<small>출처: 섬의 나이 — Clague & Dalrymple (1987), The Hawaiian-Emperor volcanic chain, USGS Professional Paper 1350(칼륨-아르곤 연대). 거리는 각 섬의 좌표와 킬라우에아(북위 19.41°, 서경 155.28°) 사이의 대권 거리(지구 표면을 따라 잰 가장 짧은 거리)로 계산했습니다.</small>";

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료로 판이 움직이는 모습을 설명해 보세요.",
  cases: [
  {
    id: "r1", tag: "실제 자료 · 진원 단면", title: "일본 아래로 기울어 들어가는 판", short: "섭입 각도",
    who: "🗾", name: "지진학 연구실",
    say: "“북위 37 ~ 39° 띠에서 10년 동안 일어난 지진 " + S.length + "건을 <b>동서 방향 단면</b>에 찍었어요. 오른쪽 끝이 일본 해구, 왼쪽이 한반도 쪽입니다. 깊은 지진이 비스듬한 선을 따라 늘어서 있죠? 이 선을 따라 태평양판이 내려갑니다. <b>판이 내려가는 각도</b>를 맞혀 주세요.”",
    predict: {
      q: "해구에서 대륙 쪽으로 갈수록 진원의 깊이는 어떻게 될까요?",
      options: ["㉠ 점점 깊어진다", "㉡ 점점 얕아진다", "㉢ 어디나 비슷하다"],
      answer: 0
    },
    task: "해구에서 내려가는 직선의 기울기를 바꿔, <b>깊은 지진(70 km 아래)의 띠</b>에 맞추세요(± 4°).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(400), ctx = cv.ctx, W = cv.W, ang = 45;
      var x0 = 40, x1 = 860, y0 = 30, y1 = 390;
      var KM = (x1 - x0) / 1400;                               /* 가로·세로 같은 축척: 1 km = KM 화소 */
      function X(km) { return x1 - km * KM; }
      function Y(d) { return y0 + d * KM; }
      function draw() {
        H.paper(ctx, W, cv.H);
        ctx.fillStyle = H.v("--line"); ctx.fillRect(x0, y0 - 3, x1 - x0, 3);
        [0, 100, 200, 300, 400, 500, 600].forEach(function (d) { H.text(ctx, d + " km", x0 + 2, Y(d) + 12, { s: 10, c: H.v("--mist") }); H.dash(ctx, x0, Y(d), x1, Y(d), H.v("--line"), 0.6); });
        [[144, "일본 해구"], [140.5, "일본 열도"], [133, "동해"], [128.5, "한반도 동해안"]].forEach(function (p) { H.text(ctx, p[1], X(xkm(p[0])), y0 - 10, { s: 10.5, w: "800", a: "center", c: H.v("--mist") }); });
        S.forEach(function (r) { var x = xkm(r[0]); if (x < -60 || x > 1400) return; H.dot(ctx, X(x), Y(r[1]), 1 + (r[2] - 4.5) * 0.9, r[1] >= 70 ? H.v("--rose-700") : H.v("--brand")); });
        var t = Math.tan(ang * Math.PI / 180), xe = Math.min(1400, 600 / t);
        ctx.save(); ctx.strokeStyle = H.v("--amber-700"); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(xe), Y(xe * t)); ctx.stroke(); ctx.restore();
        H.text(ctx, "내 각도 " + ang + "°", X(0) - 10, Y(40), { s: 14, w: "900", a: "right", c: H.v("--amber-700") });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "판이 내려가는 각도", min: 5, max: 70, step: 1, value: 45, fmt: function (x) { return x + "°"; }, onInput: function (x) { ang = x; api.changed(); draw(); } });
      api.info("가로와 세로를 같은 축척으로 그려 각도가 그대로 보입니다. 빨간 점 = 70 km 보다 깊은 지진. " + SRC1
        + "<div data-map='{\"id\":\"japan-trench\",\"name\":\"일본 해구\",\"lat\":38.3,\"lng\":143.6,\"zoom\":6,\"ask\":\"일본 동쪽 바다에 남북으로 길게 뻗은 짙은 골짜기를 찾으세요. 해구와 일본 열도 사이의 거리를 축척 막대로 어림해 적어 보세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(ang - DIP) <= 4) return { ok: true, msg: "깊은 지진 " + DEEP.length + "건에 가장 잘 맞는 직선의 기울기는 약 " + DIP.toFixed(0) + "° 입니다." };
          return { ok: false, msg: ang + "° 는 깊은 지진의 띠보다 " + (ang > DIP ? "너무 가파릅니다." : "너무 완만합니다.") };
        }
      };
    },
    hints: ["빨간 점들이 늘어선 방향에 노란 선을 겹쳐 보세요.", "빨간 점은 해구에서 약 300 km 서쪽에 깊이 약 100 km, 약 850 km 서쪽에 깊이 약 400 km 쯤 있습니다. tan(각도) = 깊이 ÷ 거리 ≈ 0.4 ~ 0.47."],
    solution: "약 <b>" + DIP.toFixed(0) + "°</b> (" + Math.ceil(DIP - 4) + " ~ " + Math.floor(DIP + 4) + "°).",
    why: "해구에서 대륙 쪽으로 갈수록 진원이 깊어지는 것은 태평양판이 유라시아판(오호츠크판) 밑으로 비스듬히 내려가기 때문입니다. 판의 위쪽 경계를 따라 지진이 나서, 진원의 띠가 곧 가라앉는 판의 모양을 보여 줘요(와다티-베니오프대). 동해 한가운데 아래 400 km 넘는 깊이까지 이어진 지진은 판이 맨틀 깊숙이 내려갔다는 증거입니다.<br>"
      + "그래서 동해 아래 아주 깊은 곳에서도 가끔 지진이 기록됩니다. 진원이 깊어 땅 위에서는 거의 느끼지 못해요."
  },
  {
    id: "r2", tag: "실제 자료 · 열점과 섬의 나이", title: "하와이 섬들이 알려 주는 판의 속력", short: "판의 속력",
    who: "🌋", name: "화산 관측소",
    say: "“하와이의 화산은 맨틀 깊은 곳에서 솟는 <b>열점</b> 위에서 만들어지고, 판이 움직이면 열점에서 멀어져 식어 갑니다. 아래는 지금 화산 활동이 활발한 킬라우에아에서 각 섬까지의 거리와, 암석으로 잰 <b>섬의 나이</b>예요. 원점을 지나는 직선을 맞춰 <b>태평양판의 속력(cm/년)</b>을 구해 주세요.”",
    predict: {
      q: "열점에서 먼 섬일수록 나이는 어떨까요?",
      options: ["㉠ 더 젊다", "㉡ 더 늙었다", "㉢ 거리와 관계없다"],
      answer: 1
    },
    task: "직선의 기울기(판의 속력)를 바꿔 다섯 섬의 점에 가장 잘 맞추세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(290), ctx = cv.ctx, W = cv.W, v = 4;
      var x0 = 70, x1 = 620, y0 = 24, y1 = 250;
      function X(a) { return x0 + a / 30 * (x1 - x0); }
      function Y(d) { return y1 - d / 2600 * (y1 - y0); }
      function draw() {
        H.paper(ctx, W, cv.H); H.axes(ctx, x0, y0, x1, y1);
        [0, 500, 1000, 1500, 2000, 2500].forEach(function (d) { H.text(ctx, d, x0 - 8, Y(d) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
        [0, 10, 20, 30].forEach(function (a) { H.text(ctx, a + "백만 년", X(a), y1 + 15, { s: 10, a: "center", c: H.v("--mist") }); });
        H.text(ctx, "킬라우에아에서의 거리 (km)", x0 + 6, y0 - 8, { s: 11, w: "700", c: H.v("--mist") });
        var km = v * 10;                                          /* cm/년 → km/백만 년 */
        H.line(ctx, [[X(0), Y(0)], [X(Math.min(30, 2600 / km)), Y(Math.min(2600, km * 30))]], H.v("--amber-700"), 2.5);
        var e = 0;
        ISL.forEach(function (s) { H.dot(ctx, X(s[3]), Y(s[4]), 6, H.v("--brand")); var low = s[0].charAt(0) === "오"; H.text(ctx, s[0], X(s[3]) + (low ? 0 : 9), Y(s[4]) + (low ? 20 : 4), { s: 10.5, w: "700", a: low ? "center" : "left", c: H.v("--brand-700") }); e += Math.abs(s[4] - km * s[3]); });
        H.rows(ctx, 660, 40, [["내 판의 속력", v.toFixed(1) + " cm/년", null, true], ["점과 선의 평균 어긋남", (e / ISL.length).toFixed(0) + " km"], ["= 백만 년마다", (v * 10).toFixed(0) + " km"]], 60);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "판의 속력", min: 2, max: 16, step: 0.1, value: 4, fmt: function (x) { return x.toFixed(1) + " cm/년"; }, onInput: function (x) { v = x; api.changed(); draw(); } });
      api.info("1 cm/년 = 백만 년에 10 km. " + SRC2
        + "<div data-map='{\"id\":\"hawaii\",\"name\":\"하와이 제도\",\"lat\":21.3,\"lng\":-158.5,\"zoom\":6,\"ask\":\"남동쪽의 큰 섬(하와이)에서 북서쪽으로 갈수록 섬의 크기와 모양은 어떻게 바뀌나요?\"}'></div>"
        + "<div data-link='{\"id\":\"hvo\",\"title\":\"USGS 하와이 화산 관측소 — 킬라우에아\",\"src\":\"미국 지질조사국\",\"url\":\"https://www.usgs.gov/volcanoes/kilauea\",\"ask\":\"킬라우에아의 지금 경보 단계(Volcano Alert Level)를 찾아 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(v - VFIT) <= 1) return { ok: true, msg: "다섯 섬에 가장 잘 맞는 속력은 약 " + VFIT.toFixed(1) + " cm/년 — 손톱이 자라는 속도의 두세 배입니다." };
          return { ok: false, msg: v.toFixed(1) + " cm/년은 " + (v < VFIT ? "느립니다. 선이 점들보다 아래에 있어요." : "빠릅니다. 선이 점들보다 위에 있어요.") };
        }
      };
    },
    hints: ["카우아이: 약 530 km, 510만 년. 530 ÷ 5.1 = ? km/백만 년", "약 100 km/백만 년 → 10 cm/년 근처. 미드웨이까지 함께 맞추면 9 cm/년쯤."],
    solution: "약 <b>" + VFIT.toFixed(1) + " cm/년</b> (± 1).",
    why: "열점은 맨틀 깊은 곳에 거의 고정되어 있고, 그 위를 태평양판이 북서쪽으로 미끄러져 갑니다. 그래서 화산섬은 열점에서 멀어질수록 늙고, 식고, 깎이고, 가라앉아 작아집니다. 섬의 나이와 거리만으로 판이 한 해에 약 9 cm, 백만 년에 약 90 km 움직였다는 것을 알 수 있어요.<br>"
      + "점들이 직선에서 조금씩 벗어나는 것은 연대 측정의 오차와, 판의 속력이 시대마다 조금씩 달랐기 때문입니다. 미드웨이보다 더 북쪽의 엠퍼러 해산열은 방향이 꺾여 있어, 약 4,700만 년 전 판의 방향이 바뀌었거나 열점 자체도 움직였다고 여겨집니다."
  }
  ]
});
})();
