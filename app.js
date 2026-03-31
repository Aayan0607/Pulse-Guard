import { db, collection, addDoc } from "./firebase.js";

let warningCount = 0;
let criticalCount = 0;
let intervalId = null;
let isRunning = false;

// 🔥 Get IDs from session
const patientId = localStorage.getItem("patientId");
const doctorId = localStorage.getItem("doctorId");

// UI elements
const bpEl = document.getElementById("bp");
const spo2El = document.getElementById("spo2");
const statusEl = document.getElementById("status");

// Generate vitals
let currentVitals = {
  systolic: 120,
  diastolic: 80,
  spo2: 98
};

let isRecovering = false;

function generateVitals() {

  if (isRecovering) {
    currentVitals.systolic -= Math.floor(Math.random() * 5 + 3);
    currentVitals.diastolic -= Math.floor(Math.random() * 3 + 1);
    currentVitals.spo2 += Math.floor(Math.random() * 2 + 1);

    if (currentVitals.systolic < 135 && currentVitals.spo2 > 95) {
      isRecovering = false;
    }

  } else {
    currentVitals.systolic += Math.floor(Math.random() * 5 - 2);
    currentVitals.diastolic += Math.floor(Math.random() * 3 - 1);
    currentVitals.spo2 += Math.floor(Math.random() * 3 - 1);

    if (Math.random() < 0.1) {
      currentVitals.systolic += 20;
      currentVitals.spo2 -= 5;
      isRecovering = false;
    }
  }

  currentVitals.systolic = Math.max(100, Math.min(180, currentVitals.systolic));
  currentVitals.diastolic = Math.max(60, Math.min(110, currentVitals.diastolic));
  currentVitals.spo2 = Math.max(85, Math.min(100, currentVitals.spo2));

  return { ...currentVitals };
}

// Status logic
function getStatus(s, d, spo2) {
  if (s > 160 || spo2 < 90) return "CRITICAL";
  if (s > 140 || spo2 < 94) return "WARNING";
  return "NORMAL";
}

// 🔥 Send readings to correct patient
async function sendToFirebase(vitals) {
  try {
    await addDoc(collection(db, "patients", patientId, "readings"), {
      bp_systolic: vitals.systolic,
      bp_diastolic: vitals.diastolic,
      spo2: vitals.spo2,
      timestamp: Date.now()
    });

    console.log("✅ Data written");

  } catch (error) {
    console.error("❌ Firebase write error:", error);
  }
}

// 🔥 Send alerts linked to doctor + patient
async function sendAlertToFirebase(type, message) {
  try {
    await addDoc(collection(db, "alerts"), {
      patientId: patientId,
      doctorId: doctorId,
      type: type,
      message: message,
      timestamp: Date.now()
    });

    console.log("🚨 Alert sent");

  } catch (error) {
    console.error("❌ Alert error:", error);
  }
}

// Simulation
function startSimulation() {

  const btn = document.getElementById("startBtn");

  // 🔴 If already running → STOP
  if (isRunning) {
  clearInterval(intervalId);
  isRunning = false;

  btn.innerText = "Start Monitoring";
  btn.classList.remove("ind-stop-btn");
  btn.classList.add("ind-start-btn");

  console.log("⏹ Monitoring stopped");
  return;
}

  // 🟢 Start monitoring
  if (!patientId) {
    alert("No patient found. Please register first.");
    return;
  }

  isRunning = true;
  btn.innerText = "Stop Monitoring";

  intervalId = setInterval(async () => {

    const vitals = generateVitals();

    bpEl.innerText = `${vitals.systolic}/${vitals.diastolic}`;
    spo2El.innerText = vitals.spo2;

    const status = getStatus(vitals.systolic, vitals.diastolic, vitals.spo2);
    statusEl.innerText = status;

    if (status === "WARNING") {
      warningCount++;
      criticalCount = 0;
    } else if (status === "CRITICAL") {
      criticalCount++;
      warningCount = 0;
    } else {
      warningCount = 0;
      criticalCount = 0;
    }

    if (criticalCount >= 2) {
      showAlert("🚨 CRITICAL ALERT: Immediate attention required!");
      await sendAlertToFirebase("CRITICAL", "Vitals critical for consecutive readings");
      criticalCount = 0;
    }

    if (warningCount >= 3) {
      showAlert("⚠️ WARNING: Health parameters unstable");
      await sendAlertToFirebase("WARNING", "Vitals abnormal for sustained period");
      warningCount = 0;
    }

    await sendToFirebase(vitals);

  }, 3000);
}

function showAlert(message) {
  alert(message);
}

window.startSimulation = startSimulation;