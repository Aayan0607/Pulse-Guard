import { 
  db, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from "./firebase.js";

// 🔥 Get doctor ID
const doctorId = localStorage.getItem("doctorId");

// UI
const selectEl = document.getElementById("patientSelect");

if (!selectEl) {
  console.error("❌ patientSelect not found in HTML");
}

// Charts
const bpCtx = document.getElementById("bpChart").getContext("2d");
const spo2Ctx = document.getElementById("spo2Chart").getContext("2d");
const lifetimeCtx = document.getElementById("lifetimeChart").getContext("2d");

// Chart setup
const bpChart = new Chart(bpCtx, {
  type: "line",
  data: { labels: [], datasets: [{ label: "BP", data: [] }] },
});

const spo2Chart = new Chart(spo2Ctx, {
  type: "line",
  data: { labels: [], datasets: [{ label: "SpO₂", data: [] }] },
});

const lifetimeChart = new Chart(lifetimeCtx, {
  type: "line",
  data: { labels: [], datasets: [{ label: "Lifetime BP", data: [], pointRadius: 0, tension: 0.4 }] },
  options: { scales: { x: { display: false } }, animation: false }
});

// 🔥 Load patients for this doctor
const patientQuery = query(
  collection(db, "patients"),
  where("doctorId", "==", doctorId)
);

let patients = [];

onSnapshot(patientQuery, (snapshot) => {
  patients = [];

  snapshot.forEach((doc) => {
    patients.push({ id: doc.id, ...doc.data() });
  });

  renderDropdown();
});

// Dropdown
function renderDropdown() {
  selectEl.innerHTML = "";

  patients.forEach((p) => {
    const option = document.createElement("option");
    option.value = p.id;
    option.textContent = p.name;
    selectEl.appendChild(option);
  });

  if (patients.length > 0) {
    loadPatientData(patients[0].id);
  }
}

// Change patient
selectEl.addEventListener("change", (e) => {
  loadPatientData(e.target.value);
});

// 🔥 Load readings dynamically
let unsubscribe = null;

function loadPatientData(patientId) {

  // Stop previous listener
  if (unsubscribe) unsubscribe();

  const q = query(
    collection(db, "patients", patientId, "readings"),
    orderBy("timestamp")
  );

  unsubscribe = onSnapshot(q, (snapshot) => {

    let labels = [];
    let systolic = [];
    let spo2 = [];

    snapshot.forEach((doc) => {
      const d = doc.data();
      labels.push(new Date(d.timestamp).toLocaleTimeString());
      systolic.push(d.bp_systolic);
      spo2.push(d.spo2);
    });

    // 🔥 Last 20 for live charts
    const MAX = 20;

    const liveLabels = labels.slice(-MAX);
    const liveBP = systolic.slice(-MAX);
    const liveSpO2 = spo2.slice(-MAX);

    // Update live charts
    bpChart.data.labels = liveLabels;
    bpChart.data.datasets[0].data = liveBP;
    bpChart.update();

    spo2Chart.data.labels = liveLabels;
    spo2Chart.data.datasets[0].data = liveSpO2;
    spo2Chart.update();

    // Lifetime chart
    lifetimeChart.data.labels = labels;
    lifetimeChart.data.datasets[0].data = systolic;
    lifetimeChart.update();
  });
}

// 🚨 Doctor Alerts (filtered)
const alertQuery = query(
  collection(db, "alerts"),
  where("doctorId", "==", doctorId)
);

// onSnapshot(alertQuery, (snapshot) => {
//   snapshot.docChanges().forEach((change) => {
//     if (change.type === "added") {
//       const alertData = change.doc.data();

//       alert(`🚨 ${alertData.type}\n${alertData.message}`);
//     }
//   });
// });