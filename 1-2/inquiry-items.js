/* 교과서 실험 — 교과서 탐구를 시뮬레이션으로 해 보고 하나만 바꿔 내 탐구로. 엔진: ../assets/inquiry.js
   교과서 쪽 번호는 비상교육 교과서. 내용은 교과서 문장을 옮기지 않고 짧게 줄여 새로 썼다. */
window.sthInquiry({ mount: "inq", key: "inq", result: "rInq", items: [
  { id: "e1", sec: "04", book: "지구시스템과학", page: 38, title: "한반도 지진의 분포 특성과 발생 가능성 예측", purpose: "지진 자료를 그래프와 지도로 나타내 한반도 지진의 분포를 분석한다.",
    steps: ["연도별 지진 목록을 내려받는다", "규모 기준별로 연도별 지진 횟수 그래프를 만든다", "진앙 분포를 지도에서 본다", "지진이 일어날 가능성이 높은 지역을 예측한다"],
    iv: "규모 기준(하한)·연도", dv: "지진 횟수(회)·진앙 분포", cv: ["같은 지역(한반도 둘레)", "같은 기간"], safety: "",
    extend: ["지역은 그대로 두고 규모 하한만 바꿔 보이는 지진 수 비교", "규모 하한은 그대로 두고 지도만 일본 쪽으로 옮겨 진앙 밀도 비교"],
    sim: { kind: "iframe", name: "Seismic Explorer(Concord Consortium, 영어)", url: "https://seismic-explorer.concord.org/", h: 600,
      ivControl: "지도를 한반도로 확대한 뒤 Magnitude 슬라이더(규모 하한)와 시간 슬라이더 바꾸기, Animate Earthquakes", dvReading: "화면에 찍힌 한반도 둘레 진앙 수와 분포(이 자료는 USGS 자료라 규모 2~3 지진은 빠짐)",
      x: { label: "규모 하한", unit: "" }, y: { label: "한반도 둘레 진앙 수", unit: "개" } } },
  { id: "e2", sec: "04", book: "지구시스템과학", page: 42, title: "지진파 자료를 활용하여 지각의 두께 구하기", purpose: "관측소별 P파 도착 시각으로 주시 곡선을 그려 교차 거리와 지각의 두께를 구한다.",
    steps: ["관측소별 P파 주행 시간을 계산한다", "진앙 거리-주행 시간 그래프를 그린다", "직접파와 굴절파에 각각 추세선을 긋는다", "두 추세선이 만나는 교차 거리를 찾는다", "교차 거리로 지각의 두께를 계산한다"],
    iv: "진앙 거리(km)", dv: "P파가 처음 도착하는 주행 시간(s) → 교차 거리·지각 두께", cv: ["같은 지진", "지각·맨틀의 P파 속도"], safety: "",
    extend: ["지각 두께만 바꾸면 교차 거리는 어떻게 달라질까", "맨틀의 P파 속도만 바꾸면 교차 거리는?"],
    sim: { kind: "model", name: "가상 두 층 지각", noise: 0.01,
      note: "수평한 두 층(지각 위, 맨틀 아래) 모형. 직접파 t = x/v₁, 모호면을 따라 오는 굴절파 t = x/v₂ + 2h√(1/v₁² − 1/v₂²). 먼저 도착하는 파의 시간을 보여 주고, 교차 거리 x꼴 = 2h√((v₂+v₁)/(v₂−v₁))입니다. 진원은 지표에 있다고 가정합니다.",
      inputs: [{ k: "x", label: "진앙 거리", unit: "km", min: 0, max: 400, step: 10, value: 50 }, { k: "h", label: "지각 두께", unit: "km", min: 20, max: 50, step: 1, value: 30 }, { k: "v1", label: "지각의 P파 속도", unit: "km/s", min: 5.5, max: 6.5, step: 0.1, value: 6 }, { k: "v2", label: "맨틀의 P파 속도", unit: "km/s", min: 7.6, max: 8.4, step: 0.1, value: 8 }],
      outputs: [{ k: "t", label: "P파 첫 도착 주행 시간", unit: "s", dp: 2, expr: "Math.min(x/v1, x/v2+2*h*Math.sqrt(1/(v1*v1)-1/(v2*v2)))" },
        { k: "xc", label: "교차 거리", unit: "km", dp: 0, expr: "2*h*Math.sqrt((v2+v1)/(v2-v1))" }] } }
] });
