/* 지구시스템과학 Ⅰ-2 판 구조 운동과 지구 내부 구조 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 고지자기 복각 → 옛 위도 */
  {
    id: "c1", tag: "고지자기 · 복각", title: "암석 속 나침반이 가리킨 옛 위치", short: "고지자기",
    who: "🧭", name: "고지자기 연구실",
    say: "“지금 <b>북위 35°</b>에 있는 땅에서 <b>1억 년 전</b> 현무암을 채취했어요. 암석 속 자성 광물이 기록한 복각은 <b>−60°</b>(자기력선이 위를 향함)입니다. 이 땅은 1억 년 전 어디에 있었고, 1년에 평균 몇 cm씩 움직여 왔을까요?”",
    predict: {
      q: "암석에 기록된 복각이 음(−)의 값이라면, 그 암석이 만들어질 때 위치는?",
      options: ["㉠ 북반구", "㉡ 남반구", "㉢ 적도 바로 위"],
      answer: 1
    },
    task: "옛 위도와 평균 이동 속도를 정해 <b>복각 −60°</b>와 맞추세요(위도 ± 1°, 속도 ± 0.3 cm/년).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var lat = 0, v = 5, I0 = -60, NOW = 35;
      function incl(p) { return Math.atan(2 * Math.tan(p * Math.PI / 180)) * 180 / Math.PI; }
      function trueLat() { return Math.atan(Math.tan(I0 * Math.PI / 180) / 2) * 180 / Math.PI; }
      function speed(p) { return (NOW - p) * 111 * 1e5 / 1e8; }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "지구 단면과 자기력선 (tan 복각 = 2 × tan 위도)", 40, 26, { s: 13.5, w: "900" });
        var cx = 200, cy = 175, R = 110;
        ctx.strokeStyle = H.v("--line"); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
        H.line(ctx, [[cx - R - 10, cy], [cx + R + 10, cy]], H.v("--mist"), 1);
        H.text(ctx, "적도", cx + R + 14, cy + 4, { s: 10.5, c: H.v("--mist") });
        H.text(ctx, "N", cx, cy - R - 8, { s: 12, w: "900", a: "center" }); H.text(ctx, "S", cx, cy + R + 18, { s: 12, w: "900", a: "center" });
        function mark(p, col, label) {
          var a = p * Math.PI / 180, x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
          H.dot(ctx, x, y, 6, H.v(col));
          var I = incl(p) * Math.PI / 180, dx = Math.cos(a + Math.PI / 2 + I), dy = -Math.sin(a + Math.PI / 2 + I);
          H.arrow(ctx, x - dx * 22, y - dy * 22, x + dx * 22, y + dy * 22, H.v(col), 2.5, 8);
          H.text(ctx, label, x + 14, y + 4, { s: 11, w: "800", c: H.v(col + "-700") });
        }
        mark(NOW, "--mist", "지금 35°N");
        mark(lat, "--rose", "1억 년 전?");
        var I = incl(lat), s = speed(lat);
        H.rows(ctx, 440, 60, [
          ["내가 정한 옛 위도", (lat >= 0 ? "북위 " : "남위 ") + Math.abs(lat).toFixed(1) + "°"],
          ["그 위도의 복각", I.toFixed(1) + "° (측정값 −60°)", Math.abs(I - I0) <= 2 ? "--green-700" : "--rose-700"],
          ["지금까지 움직인 거리", Math.round((NOW - lat) * 111).toLocaleString() + " km"],
          ["내가 정한 평균 속도", v.toFixed(1) + " cm/년", Math.abs(v - speed(lat)) <= 0.3 ? "--green-700" : null, true]
        ], 58);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "1억 년 전의 위도", min: -60, max: 60, step: 1, value: 0, fmt: function (x) { return (x >= 0 ? "북위 " : "남위 ") + Math.abs(x) + "°"; }, onInput: function (x) { lat = x; draw(); } });
      api.slider({ label: "평균 이동 속도", min: 0, max: 12, step: 0.2, value: 5, fmt: function (x) { return x.toFixed(1) + " cm/년"; }, onInput: function (x) { v = x; draw(); } });
      api.info("위도 1° ≈ 111 km. 1억 년 동안 움직인 거리를 cm로 바꿔 1억으로 나누면 1년 평균 속도예요.");
      draw();
      return {
        judge: function () {
          var L = trueLat();
          if (Math.abs(lat - L) > 1) return { ok: false, msg: "옛 위도에서 계산한 복각이 −60°와 맞지 않습니다." };
          if (Math.abs(v - speed(L)) > 0.3) return { ok: false, msg: "옛 위도는 맞았습니다. 1억 년 동안 " + Math.round((NOW - L) * 111).toLocaleString() + " km를 움직인 속도를 다시 계산하세요." };
          return { ok: true, msg: "남위 약 " + Math.abs(L).toFixed(1) + "° → 약 " + Math.round((NOW - L) * 111).toLocaleString() + " km 북쪽으로, 1년에 약 " + speed(L).toFixed(1) + " cm씩 움직였습니다." };
        }
      };
    },
    hints: [
      "tan(−60°) = −1.73. 이것이 2 × tan(위도)이므로 tan(위도) = −0.87 → 위도는?",
      "남위 약 41°에서 북위 35° 까지는 약 76° × 111 km. 이를 cm로 바꿔 1억(10⁸)으로 나누세요."
    ],
    solution: "옛 위도 <b>남위 약 41°</b>, 평균 속도 <b>약 8.4 cm/년</b>.",
    why: "암석이 식을 때 자성 광물은 그곳의 지구 자기장 방향을 기록합니다. 복각은 적도에서 0°, 자극에서 ±90°로 위도에 따라 달라지므로(tan I = 2 tan φ), 옛 복각으로 <b>암석이 생긴 위도</b>를 알 수 있습니다.<br>" +
      "이 기록으로 대륙들의 겉보기 극이동 곡선을 그리자 곡선이 대륙마다 달랐고, 대륙을 붙이면 하나로 겹쳤습니다 — 움직인 것은 극이 아니라 대륙(판)이었다는 결정적 증거였지요."
  },

  /* ------------------------------------------------------------------ 2. 열점과 판의 이동 */
  {
    id: "c2", tag: "열점 · 판의 이동", title: "옐로스톤이 남긴 발자국", short: "열점 궤적",
    who: "🦬", name: "국립공원 지질팀",
    say: "“옐로스톤 아래에는 맨틀 깊은 곳에서 올라오는 <b>열점(플룸)</b>이 있어요. 옐로스톤에서 <b>남서쪽으로 700 km</b> 떨어진 곳에 <b>1600만 년</b> 된 옛 칼데라가 있고, 그 사이로 화산의 나이가 차례로 젊어집니다. 북아메리카판은 어느 방향으로, 얼마나 빨리 움직일까요?”",
    predict: {
      q: "열점은 맨틀 속에 거의 고정되어 있고 판이 그 위를 지나갑니다. 오래된 화산일수록 옐로스톤에서 남서쪽에 있다면, 판은 어느 쪽으로 움직였을까요?",
      options: ["㉠ 북동쪽", "㉡ 남서쪽", "㉢ 움직이지 않았다 — 열점이 움직였다"],
      answer: 1
    },
    task: "판의 이동 방향과 속도를 정해 <b>화산의 나이 분포</b>를 재현하세요(속도 ± 0.3 cm/년).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var dir = "NE", v = 2;
      var OBS = [[0, 0], [2, 88], [4, 175], [6.5, 285], [10, 438], [12.5, 547], [16, 700]];
      var TRUE_V = 700 / 16 / 10;
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "옐로스톤 → 남서쪽으로 늘어선 화산 (km)", 40, 26, { s: 13.5, w: "900" });
        var x0 = 780, sc = 0.95, y = 120;
        function X(km) { return x0 - km * sc; }
        H.line(ctx, [[X(0), y], [X(760), y]], H.v("--line"), 2);
        H.text(ctx, "옐로스톤 (열점)", X(0), y - 24, { s: 11.5, w: "900", a: "center", c: H.v("--rose-700") });
        H.text(ctx, "🔥", X(0), y + 8, { s: 20, a: "center" });
        H.text(ctx, "← 남서쪽", X(760), y - 14, { s: 11, c: H.v("--mist") });
        OBS.forEach(function (o, i) { if (i) { H.dot(ctx, X(o[1]), y, 7, H.v("--amber")); H.text(ctx, o[0] + "", X(o[1]), y + 26, { s: 11, w: "800", a: "center", c: H.v("--amber-700") }); } });
        H.text(ctx, "노란 점 = 실제 화산의 나이 (백만 년)", 40, y + 54, { s: 11, c: H.v("--mist") });
        var yy = 230;
        H.line(ctx, [[X(0), yy], [X(760), yy]], H.v("--line"), 2);
        H.text(ctx, "내 모형이 예측한 화산 위치", 40, yy - 20, { s: 12, w: "800" });
        [0, 4, 8, 12, 16].forEach(function (t) {
          var km = (dir === "SW" ? 1 : -1) * v * 10 * t;
          if (km >= 0 && km <= 760) { H.dot(ctx, X(km), yy, 7, H.v("--teal")); H.text(ctx, t + "", X(km), yy + 26, { s: 11, w: "800", a: "center", c: H.v("--teal-700") }); }
        });
        if (dir === "NE") H.text(ctx, "판이 북동쪽으로 가면 옛 화산은 북동쪽에 남아야 합니다 (그림 밖)", 40, yy + 54, { s: 11, c: H.v("--rose-700") });
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "판의 이동 방향", value: "NE", options: [{ v: "NE", t: "북동쪽" }, { v: "SW", t: "남서쪽" }], onPick: function (x) { dir = x; draw(); } });
      api.slider({ label: "판의 이동 속도", min: 0.5, max: 10, step: 0.1, value: 2, fmt: function (x) { return x.toFixed(1) + " cm/년"; }, onInput: function (x) { v = x; draw(); } });
      api.info("1 cm/년으로 100만 년 가면 10 km. 판이 움직인 쪽으로 화산이 실려 가며 열점에서 멀어집니다.");
      draw();
      return {
        judge: function () {
          if (dir !== "SW") return { ok: false, msg: "옛 화산이 남서쪽에 있으니 판이 화산을 남서쪽으로 실어 날랐다는 뜻입니다." };
          if (Math.abs(v - TRUE_V) <= 0.3) return { ok: true, msg: "남서쪽 " + v.toFixed(1) + " cm/년 — 700 km ÷ 1600만 년 ≈ 4.4 cm/년." };
          return { ok: false, msg: "방향은 맞았습니다. 속도 " + v.toFixed(1) + " cm/년으로는 화산 위치가 실제와 어긋나요." };
        }
      };
    },
    hints: [
      "열점은 제자리이고 판이 움직입니다. 오래된 화산이 있는 쪽으로 판이 화산을 ‘싣고’ 간 것입니다.",
      "700 km = 7 × 10⁷ cm. 1600만 년으로 나누면?"
    ],
    solution: "<b>남서쪽</b>, 약 <b>4.4 cm/년</b>(4.1~4.7).",
    why: "플룸이 올라오는 <b>열점</b>은 판 경계와 상관없이 맨틀 깊은 곳에서 거의 고정된 채 마그마를 공급합니다. 그 위를 판이 지나가면 화산이 줄지어 생기고, 나이 순서가 판의 <b>이동 방향과 속도</b>를 기록합니다.<br>" +
      "하와이-엠퍼러 해산열이 중간에 굽은 것은 약 4700만 년 전 태평양판의 이동 방향이 바뀌었기 때문입니다 — 판 위층의 운동(판 구조론)과 아래층의 기둥(플룸 구조론)이 함께 만든 기록이에요."
  },

  /* ------------------------------------------------------------------ 3. P파·S파와 지진 조기 경보 */
  {
    id: "c3", tag: "지진파 · P파와 S파", title: "지진 조기 경보의 사각지대", short: "조기 경보",
    who: "📱", name: "지진 조기 경보 센터",
    say: "“지진이 나면 빠른 <b>P파(6 km/s)</b>를 먼저 감지해 경보를 보내고, 흔들림이 큰 <b>S파(3.5 km/s)</b>가 오기 전에 알려야 해요. 경보가 S파보다 늦게 닿는 진앙 근처가 ‘사각지대’입니다. 사각지대 반지름을 <b>20 km 이하</b>로 줄이고 싶어요.”",
    predict: {
      q: "지진이 나면 진앙에서 멀리 떨어진 곳일수록 P파와 S파가 도착하는 시각의 차이(PS시)는?",
      options: ["㉠ 길어진다", "㉡ 짧아진다", "㉢ 거리와 상관없이 같다"],
      answer: 0
    },
    task: "관측소 간격과 경보 처리 시간을 정해 <b>사각지대 반지름 20 km 이하</b>를 만드세요. 관측소는 예산상 <b>10 km 간격보다 촘촘하게</b> 둘 수 없고, 처리 시간은 <b>2초보다 짧을 수</b> 없습니다.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var gap = 40, tp = 8, VP = 6, VS = 3.5;
      function tWarn() { return gap / 2 / VP + tp; }
      function blind() { return VS * tWarn(); }
      var gx0 = 70, gx1 = 560, gy0 = 50, gy1 = 280;
      function GX(d) { return gx0 + d / 100 * (gx1 - gx0); }
      function GY(t) { return gy1 - t / 30 * (gy1 - gy0); }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "진앙 거리 – 도착 시각 (주시 곡선)", 40, 26, { s: 13.5, w: "900" });
        H.axes(ctx, gx0, gy0, gx1, gy1);
        [0, 25, 50, 75, 100].forEach(function (d) { H.text(ctx, d + " km", GX(d), gy1 + 16, { s: 10, a: "center", c: H.v("--mist") }); });
        [0, 10, 20, 30].forEach(function (t) { H.text(ctx, t + " s", gx0 - 6, GY(t) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
        H.line(ctx, [[GX(0), GY(0)], [GX(100), GY(100 / VP)]], H.v("--brand"), 2.5);
        H.text(ctx, "P파", GX(100) - 4, GY(100 / VP) - 6, { s: 11, w: "800", a: "right", c: H.v("--brand-700") });
        H.line(ctx, [[GX(0), GY(0)], [GX(100), GY(100 / VS)]], H.v("--rose"), 2.5);
        H.text(ctx, "S파", GX(90), GY(90 / VS) - 8, { s: 11, w: "800", a: "right", c: H.v("--rose-700") });
        var tw = tWarn(), b = blind();
        H.line(ctx, [[gx0, GY(tw)], [gx1, GY(tw)]], H.v("--amber-700"), 2);
        H.text(ctx, "경보 발령 " + tw.toFixed(1) + " s", gx1 - 4, GY(tw) + 14, { s: 11, w: "800", a: "right", c: H.v("--amber-700") });
        H.box(ctx, gx0, gy0, GX(b) - gx0, gy1 - gy0, H.v("--rose"), 0.12);
        H.text(ctx, "사각지대", (gx0 + GX(b)) / 2, gy0 + 16, { s: 11, w: "900", a: "center", c: H.v("--rose-700") });
        H.rows(ctx, 610, 70, [
          ["가장 가까운 관측소까지 P파", (gap / 2 / VP).toFixed(1) + " s"],
          ["경보 처리 시간", tp.toFixed(1) + " s"],
          ["사각지대 반지름", b.toFixed(1) + " km", b <= 20 ? "--green-700" : "--rose-700", true]
        ], 60);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "관측소 간격", min: 10, max: 60, step: 2, value: 40, fmt: function (x) { return x + " km"; }, onInput: function (x) { gap = x; draw(); } });
      api.slider({ label: "경보 처리 시간 (분석·전송)", min: 2, max: 15, step: 0.5, value: 8, fmt: function (x) { return x.toFixed(1) + " s"; }, onInput: function (x) { tp = x; draw(); } });
      api.info("진앙이 관측소 사이 한가운데라면, P파는 간격의 절반을 달려 가장 가까운 관측소에 닿습니다. 사각지대 반지름 = S파 속도 × 경보 발령 시각.");
      draw();
      return {
        judge: function () {
          var b = blind();
          if (b <= 20) return { ok: true, msg: "간격 " + gap + " km · 처리 " + tp.toFixed(1) + " s → 사각지대 " + b.toFixed(1) + " km. 그 밖의 지역은 S파보다 먼저 경보를 받습니다." };
          return { ok: false, msg: "사각지대 반지름 " + b.toFixed(1) + " km — 20 km보다 넓습니다." };
        }
      };
    },
    hints: [
      "경보가 나가는 시각 = (가장 가까운 관측소까지 P파가 가는 시간) + (처리 시간). 이 시각까지 S파가 간 거리가 사각지대입니다.",
      "20 km ÷ 3.5 km/s ≈ 5.7 s 안에 경보를 내야 합니다. 처리 시간을 줄이는 쪽이 관측소를 늘리는 것보다 효과가 크지 않나요?"
    ],
    solution: "예: 관측소 간격 <b>10~20 km</b>, 처리 시간 <b>2~4 s</b>(합쳐서 경보 발령 5.7 s 이내).",
    why: "P파는 S파보다 빠르므로 먼저 도착한 P파로 지진을 알아채고, 파괴적인 S파가 오기 전에 경보를 보낼 수 있습니다. 진앙에서 멀수록 PS시가 길어져 대피할 시간도 늘어나지만, 진앙 가까이에서는 경보가 S파보다 늦습니다.<br>" +
      "주시 곡선에서 PS시로 진앙 거리를 구하고, 세 관측소의 원이 만나는 곳으로 진앙을 찾는 원리가 경보 시스템의 바탕입니다. ※ 파의 속도와 처리 시간은 수업용 어림값입니다."
  }
  ]
});
})();
