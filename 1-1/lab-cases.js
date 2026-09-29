/* 지구시스템과학 Ⅰ-1 지구의 탄생과 진화 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 어두운 젊은 태양 */
  {
    id: "c1", tag: "원시 대기 · 원시 바다", title: "어두운 태양 아래의 바다", short: "어두운 젊은 태양",
    who: "☀️", name: "초기 지구 모형 연구실",
    say: "“40억 년 전 태양은 지금보다 약 <b>30% 어두웠어요</b>. 그런데 그 시절 암석에는 물이 흐른 흔적이 남아 있어 바다가 얼지 않았던 것이 분명합니다. 원시 대기가 무엇으로 이 추위를 이겼는지, 모형으로 확인해 주세요.”",
    predict: {
      q: "어두운 태양 아래에서도 원시 바다가 얼지 않을 수 있었던 가장 알맞은 까닭은?",
      options: ["㉠ 원시 대기에 이산화 탄소 같은 온실 기체가 지금보다 훨씬 많았기 때문이다", "㉡ 원시 대기에 산소가 많았기 때문이다", "㉢ 지구가 지금보다 태양에서 멀었기 때문이다"],
      answer: 0
    },
    task: "원시 대기의 온실 기체를 조절해 <b>평균 기온 0 ~ 5 ℃</b>로 바다가 얼지 않는 <b>가장 적은</b> 온실 효과를 찾으세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var lk = 0, ch4 = "no", S = 0.7;
      function teq() { return 255 * Math.pow(S, 0.25) - 273; }
      function temp() { return teq() + 33 + 2.5 * Math.log(Math.pow(10, lk)) + (ch4 === "yes" ? 8 : 0); }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "40억 년 전 지구의 에너지 장부", 40, 26, { s: 14, w: "900" });
        var T = temp(), frozen = T < 0;
        ctx.fillStyle = frozen ? "#dbeefa" : H.v("--brand"); ctx.globalAlpha = frozen ? 1 : 0.45;
        ctx.beginPath(); ctx.arc(180, 175, 110, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        H.text(ctx, frozen ? "❄️ 바다가 얼었다" : (T > 5 ? "🌡️ 따뜻한 바다" : "🌊 얼지 않은 바다"), 180, 180, { s: 15, w: "900", a: "center" });
        var gx = 380, y = 70;
        H.rows(ctx, gx, y, [
          ["태양 밝기", Math.round(S * 100) + "% (지금 = 100%)"],
          ["온실 효과가 없을 때의 온도", teq().toFixed(1) + " ℃"],
          ["이산화 탄소 (지금의 몇 배)", Math.round(Math.pow(10, lk)).toLocaleString() + " 배"],
          ["메테인 (초기 미생물)", ch4 === "yes" ? "있음 (+8 ℃)" : "없음"],
          ["평균 기온", T.toFixed(1) + " ℃", T >= 0 && T <= 5 ? "--green-700" : "--rose-700", true]
        ], 46);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "원시 대기의 이산화 탄소 (지금의 몇 배, 눈금 한 칸 = 10배)", min: 0, max: 3, step: 0.05, value: 0,
        fmt: function (x) { return Math.round(Math.pow(10, x)).toLocaleString() + " 배"; }, onInput: function (x) { lk = x; draw(); } });
      api.seg({ label: "메테인", value: "no", options: [{ v: "no", t: "없음" }, { v: "yes", t: "메테인을 내는 미생물이 있음" }], onPick: function (x) { ch4 = x; draw(); } });
      api.info("지금 대기(이산화 탄소 1배, 메테인 거의 없음)의 온실 효과는 약 33 ℃ 입니다. 이산화 탄소를 늘리면 온실 효과가 조금씩 커져요.");
      draw();
      return {
        judge: function () {
          var T = temp();
          if (T < 0) return { ok: false, msg: "평균 " + T.toFixed(1) + " ℃ — 바다가 얼어붙습니다." };
          if (T > 5) return { ok: false, msg: "평균 " + T.toFixed(1) + " ℃ — 얼지는 않지만 필요보다 온실 효과가 큽니다. 가장 적은 양을 찾으세요." };
          return { ok: true, msg: "이산화 탄소 " + Math.round(Math.pow(10, lk)) + "배" + (ch4 === "yes" ? " + 메테인" : "") + " → 평균 " + T.toFixed(1) + " ℃ — 어두운 태양 아래서도 바다가 액체로 남습니다." };
        }
      };
    },
    hints: [
      "태양이 70% 밝기면 온실 효과가 없을 때 약 −40 ℃ 입니다. 지금의 온실 효과(33 ℃)만으로는 모자라요.",
      "이산화 탄소를 지금의 수십 배로 늘려 보세요. 메테인이 있으면 조금 덜 필요합니다."
    ],
    solution: "메테인이 없으면 이산화 탄소 <b>약 15 ~ 110배</b>, 메테인이 있으면 <b>약 1 ~ 4배</b>(평균 0 ~ 5 ℃).",
    why: "원시 대기는 화산 가스에서 나온 <b>수증기와 이산화 탄소</b>가 대부분이었습니다. 이 두꺼운 온실 기체가 어두운 태양의 부족분을 메워 원시 바다가 얼지 않았다고 봅니다(어두운 젊은 태양의 역설).<br>" +
      "그 뒤 이산화 탄소는 바다에 녹고 석회암으로 굳어 대기에서 빠져나갔고, 그 자리를 광합성이 만든 산소가 채웠습니다. 기권·수권·지권이 서로 물질을 주고받으며 함께 만들어진 것이지요. ※ 온도 식은 수업용 모형입니다."
  },

  /* ------------------------------------------------------------------ 2. 철의 산화 — 산소를 먹는 철 */
  {
    id: "c2", tag: "산소의 순환 · 철의 산화", title: "과자 봉지 속 탈산소제", short: "탈산소제",
    who: "🍪", name: "식품 포장 연구소",
    say: "“과자 봉지(공기 <b>500 mL</b>)에 넣을 탈산소제를 설계해요. 철 가루가 산소와 반응해 녹슬면서 산소를 없애죠. 산소를 <b>99% 이상</b> 없애야 과자가 눅눅해지지 않아요. 다만 철 가루가 많으면 비싸니 <b>0.40 g</b> 을 넘기면 안 됩니다.”",
    predict: {
      q: "25억 년 전 광합성으로 처음 생긴 산소가 대기에 바로 쌓이지 못한 까닭은?",
      options: ["㉠ 바닷물에 녹아 있던 철이 산소와 먼저 반응해 가라앉았기 때문이다", "㉡ 산소가 너무 무거워 바다 밑에 가라앉았기 때문이다", "㉢ 산소가 모두 우주로 빠져나갔기 때문이다"],
      answer: 0
    },
    task: "철 가루의 양을 정해 <b>봉지 속 산소의 99% 이상</b>을 없애세요(0.40 g 이하).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(300), ctx = cv.ctx, W = cv.W;
      var g = 0.1, O2 = 500 * 0.21 / 22400;      /* mol */
      function left() { var need = g / 55.85 * 3 / 4; return Math.max(0, O2 - need) / O2; }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "4Fe + 3O₂ → 2Fe₂O₃ (녹)", 40, 26, { s: 14, w: "900" });
        var L = left();
        ctx.strokeStyle = H.v("--line"); ctx.lineWidth = 3; ctx.strokeRect(60, 60, 300, 200);
        for (var i = 0; i < 60; i++) { if (i / 60 < L) H.dot(ctx, 80 + (i * 47) % 270, 80 + (i * 29) % 160, 5, H.v("--brand")); }
        H.box(ctx, 160, 230, 100, 24, "#8a4b2a", 0.2 + 0.8 * Math.min(1, g / 0.4));
        H.text(ctx, "철 가루 " + g.toFixed(2) + " g", 210, 247, { s: 11, w: "800", a: "center", c: "#fff" });
        H.text(ctx, "● 산소 분자", 70, 285, { s: 11, c: H.v("--brand-700") });
        H.rows(ctx, 420, 70, [
          ["처음 산소 (공기 500 mL 의 21%)", (O2 * 1000).toFixed(2) + " mmol"],
          ["철 가루가 없앨 수 있는 산소", (Math.min(O2, g / 55.85 * 0.75) * 1000).toFixed(2) + " mmol"],
          ["남은 산소", (L * 100).toFixed(1) + "%", L <= 0.01 ? "--green-700" : "--rose-700", true]
        ], 62);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "철 가루의 양", min: 0, max: 0.6, step: 0.01, value: 0.1, fmt: function (x) { return x.toFixed(2) + " g"; }, onInput: function (x) { g = x; draw(); } });
      api.info("철의 원자량 55.85. 철 원자 4개가 산소 분자 3개와 반응합니다. 기체 1 mol 은 약 22.4 L 로 보세요.");
      draw();
      return {
        judge: function () {
          var L = left();
          if (g > 0.40 + 1e-9) return { ok: false, msg: g.toFixed(2) + " g — 비용 한도(0.40 g)를 넘었습니다." };
          if (L <= 0.01) return { ok: true, msg: "철 " + g.toFixed(2) + " g — 산소가 " + (L * 100).toFixed(1) + "% 만 남습니다. 철이 산화되며 산소를 붙잡았어요." };
          return { ok: false, msg: "산소가 " + (L * 100).toFixed(1) + "% 남습니다 — 철이 모자랍니다." };
        }
      };
    },
    hints: [
      "산소는 500 × 0.21 = 105 mL ≈ 4.7 mmol 입니다. 반응식에서 철은 산소의 몇 배(몰수)가 필요한가요?",
      "철 = 4.7 × 4/3 ≈ 6.25 mmol → × 55.85 g/mol ≈ ? g"
    ],
    solution: "철 가루 <b>0.35 ~ 0.40 g</b>.",
    why: "철은 산소와 만나 산화 철(녹)이 되며 산소를 붙잡습니다. 25억 년 전 남세균이 광합성으로 산소를 내놓았을 때도, 바닷물에 녹아 있던 철이 먼저 산소와 반응해 산화 철로 가라앉았어요. 그 기록이 붉고 검은 줄무늬의 <b>호상 철광층</b>입니다.<br>" +
      "바다의 철이 바닥난 뒤에야 산소가 대기에 쌓이기 시작했고(대산소화 사건), 이어 오존층이 생겨 생물이 육지로 올라올 수 있었습니다. 과자 봉지 속에서 일어나는 일이 지구 역사 20억 년을 요약하는 셈이지요."
  },

  /* ------------------------------------------------------------------ 3. 탄소 순환의 음의 되먹임 */
  {
    id: "c3", tag: "탄소 순환 · 음의 되먹임", title: "지구의 온도 조절기", short: "풍화 되먹임",
    who: "🌋", name: "행성 기후 모형팀",
    say: "“수억 년 전 화산 활동이 활발해져 대기로 나오는 이산화 탄소가 지금의 <b>2배</b>가 된 시대가 있었다고 합시다. 그래도 기온이 끝없이 오르지 않고 새로운 평형에 도달했어요. 규산염 암석의 <b>풍화</b>가 이산화 탄소를 얼마나 잘 빼내야 평형 기온이 지금(15 ℃)과 같아질까요?”",
    predict: {
      q: "기온이 오르면 규산염 암석의 화학적 풍화는 어떻게 되고, 그 결과 기온은?",
      options: ["㉠ 풍화가 빨라져 이산화 탄소를 더 많이 제거하므로 기온 상승이 억제된다", "㉡ 풍화가 느려져 기온이 더 오른다", "㉢ 풍화와 기온은 관계없다"],
      answer: 0
    },
    task: "대륙의 위치와 풍화 효율을 정해 <b>평형 기온을 15 ± 0.5 ℃</b>로 맞추세요. ▶ 로 평형에 다가가는 모습을 볼 수 있어요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var V = 2, w = 1, cont = "pole", shown = 1;
      var run = api.ticker();
      function wt() { return w * (cont === "eq" ? 1.5 : 1); }
      function teq() { return 15 + 3 * Math.log(V / wt()) / Math.LN2; }
      function series() {
        var T = 15, out = [T];
        for (var i = 1; i <= 60; i++) { T += (teq() - T) * 0.08; out.push(T); }
        return out;
      }
      var gx0 = 70, gx1 = 560, gy0 = 50, gy1 = 280;
      function GX(i) { return gx0 + i / 60 * (gx1 - gx0); }
      function GY(t) { return gy1 - (t - 5) / 20 * (gy1 - gy0); }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "시간에 따른 지구 평균 기온 (가로: 수백만 년)", 40, 26, { s: 13.5, w: "900" });
        H.axes(ctx, gx0, gy0, gx1, gy1);
        [5, 10, 15, 20, 25].forEach(function (t) { H.text(ctx, t + " ℃", gx0 - 6, GY(t) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
        H.dash(ctx, gx0, GY(15), gx1, GY(15), H.v("--green"));
        var s = series(), pts = [];
        for (var i = 0; i <= Math.round(shown * 60); i++) pts.push([GX(i), GY(H.clamp(s[i], 5, 25))]);
        H.line(ctx, pts, H.v("--coral"), 3);
        var T = teq();
        H.rows(ctx, 600, 60, [
          ["화산의 CO₂ 공급", "지금의 " + V + " 배"],
          ["풍화로 빼내는 효율", "지금의 " + wt().toFixed(2) + " 배" + (cont === "eq" ? " (적도 대륙 ×1.5)" : "")],
          ["새 평형 기온", T.toFixed(1) + " ℃", Math.abs(T - 15) <= 0.5 ? "--green-700" : "--rose-700", true]
        ], 62);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "대륙의 위치", value: "pole", options: [{ v: "pole", t: "고위도에 모여 있음" }, { v: "eq", t: "따뜻하고 비가 많은 적도 부근" }], onPick: function (x) { cont = x; shown = 1; draw(); } });
      api.slider({ label: "풍화 효율 (육상 식물·산맥 융기 등)", min: 0.5, max: 4, step: 0.1, value: 1, fmt: function (x) { return x.toFixed(1) + " 배"; }, onInput: function (x) { w = x; shown = 1; draw(); } });
      api.button("▶ 평형에 다가가는 모습", function () { run(40, 40, function (k) { shown = k; draw(); }); });
      api.info("평형 기온에서는 화산이 내놓는 CO₂ 와 풍화가 빼내는 CO₂ 가 같습니다. 이 모형에서는 풍화의 효율이 2배가 되면 평형 기온이 3 ℃ 내려가요.");
      draw();
      return {
        judge: function () {
          var T = teq();
          if (Math.abs(T - 15) <= 0.5) return { ok: true, msg: "풍화 효율 " + wt().toFixed(2) + " 배 → 평형 " + T.toFixed(1) + " ℃ — 공급이 2배여도 빼내는 쪽도 2배가 되어 균형을 찾습니다." };
          return { ok: false, msg: "평형 기온 " + T.toFixed(1) + " ℃ — " + (T > 15 ? "풍화가 이산화 탄소를 충분히 빼내지 못합니다." : "풍화가 너무 세서 지나치게 식습니다.") };
        }
      };
    },
    hints: [
      "들어오는 양(화산)이 2배라면 나가는 양(풍화)도 2배가 되어야 같은 기온에서 균형을 이룹니다.",
      "대륙이 적도에 있으면 효율이 1.5배로 곱해집니다. 합쳐서 약 2배가 되게 하세요."
    ],
    solution: "고위도 대륙이면 풍화 효율 <b>1.8 ~ 2.2배</b>, 적도 대륙이면 <b>1.2 ~ 1.5배</b>(곱해서 약 2배).",
    why: "기온이 오르면 비가 많아지고 화학 반응이 빨라져 규산염 풍화가 활발해집니다. 풍화는 대기의 CO₂ 를 빗물에 녹여 바다로 보내 결국 석회암으로 가두므로, 온실 효과가 줄어 기온이 다시 내려가요. 기온이 내려가면 반대로 풍화가 느려집니다.<br>" +
      "이처럼 변화를 되돌리는 <b>음의 되먹임</b>이 수백만 년에 걸쳐 지구의 기온을 조절합니다. 눈덩이 지구 때는 얼음이 풍화를 멈추게 해 화산의 CO₂ 가 쌓였고, 그 온실 효과로 얼음이 녹았지요. 다만 이 조절기는 <b>매우 느려서</b>, 수십 년 사이에 쏟아낸 인류의 CO₂ 를 제때 치워 주지 못합니다. ※ 수업용 모형입니다."
  }
  ]
});
})();
