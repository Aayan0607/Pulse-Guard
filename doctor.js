import { db, collection, onSnapshot, query, orderBy } from "./firebase.js";

const bpCtx = document.getElementById("bpChart").getContext("2d");
const spo2Ctx = document.getElementById("spo2Chart").getContext("2d");
const riskEl = document.getElementById("risk");
const insightEl = document.getElementById("insight");
const scoreEl = document.getElementById("score");

// Data arrays
let labels = [];
let systolicData = [];
let spo2Data = [];

// Charts
const bpChart = new Chart(bpCtx, {
  type: "line",
  data: {
    labels: labels,
    datasets: [{
      label: "Systolic BP",
      data: systolicData
    }]
  }
});

const spo2Chart = new Chart(spo2Ctx, {
  type: "line",
  data: {
    labels: labels,
    datasets: [{
      label: "SpO₂",
      data: spo2Data
    }]
  }
});

// Listen to Firebase in real-time
const q = query(
  collection(db, "patients", "patient_1", "readings"),
  orderBy("timestamp")
);

onSnapshot(q, (snapshot) => {
  let tempLabels = [];
  let tempSystolic = [];
  let tempSpo2 = [];

  snapshot.forEach((doc) => {
    const data = doc.data();

    tempLabels.push(new Date(data.timestamp).toLocaleTimeString());
    tempSystolic.push(data.bp_systolic);
    tempSpo2.push(data.spo2);
  });

  // 🔥 Keep only last 20 readings
  const MAX_POINTS = 20;

  if (tempLabels.length > MAX_POINTS) {
    tempLabels = tempLabels.slice(-MAX_POINTS);
    tempSystolic = tempSystolic.slice(-MAX_POINTS);
    tempSpo2 = tempSpo2.slice(-MAX_POINTS);
  }

  // Update charts
  bpChart.data.labels = tempLabels;
  bpChart.data.datasets[0].data = tempSystolic;
  bpChart.update();

  spo2Chart.data.labels = tempLabels;
  spo2Chart.data.datasets[0].data = tempSpo2;
  spo2Chart.update();

  // 🔥 Calculate insights
let latestBP = tempSystolic[tempSystolic.length - 1];
let latestSpo2 = tempSpo2[tempSpo2.length - 1];

// --- Risk Level ---
let risk = "Normal";
if (latestBP > 160 || latestSpo2 < 90) risk = "HIGH";
else if (latestBP > 140 || latestSpo2 < 94) risk = "MODERATE";

// --- Trend Detection ---
let insight = "Stable vitals";

// Compare first vs last in window
if (tempSystolic.length >= 6) {
  let firstAvg = (tempSystolic[0] + tempSystolic[1] + tempSystolic[2]) / 3;
  let lastAvg = (
    tempSystolic[tempSystolic.length - 1] +
    tempSystolic[tempSystolic.length - 2] +
    tempSystolic[tempSystolic.length - 3]
  ) / 3;

  if (lastAvg - firstAvg > 8) {
    insight = "BP rising steadily";
  } else if (firstAvg - lastAvg > 8) {
    insight = "BP decreasing";
  }
}

// SpO₂ insight override
if (latestSpo2 < 94) {
  insight = "Oxygen levels dropping";
}

// --- Health Score ---
let score = 100;

if (latestBP > 140) score -= 10;
if (latestBP > 160) score -= 20;
if (latestSpo2 < 94) score -= 15;
if (latestSpo2 < 90) score -= 25;

// Clamp
score = Math.max(0, score);

// Update UI
riskEl.innerText = risk;
insightEl.innerText = insight;
scoreEl.innerText = score;
});