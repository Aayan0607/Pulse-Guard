import { db, collection, onSnapshot, query, orderBy } from "./firebase.js";

const bpCtx = document.getElementById("bpChart").getContext("2d");
const spo2Ctx = document.getElementById("spo2Chart").getContext("2d");

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
  labels = [];
  systolicData = [];
  spo2Data = [];
  console.log("Snapshot size:", snapshot.size);

  snapshot.forEach((doc) => {
    const data = doc.data();
    labels.push(new Date(data.timestamp).toLocaleTimeString());
    systolicData.push(data.bp_systolic);
    spo2Data.push(data.spo2);
  });

  bpChart.data.labels = labels;
  bpChart.data.datasets[0].data = systolicData;
  bpChart.update();

  spo2Chart.data.labels = labels;
  spo2Chart.data.datasets[0].data = spo2Data;
  spo2Chart.update();
});