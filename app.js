let warningCount = 0;
let criticalCount = 0;
import { db, collection, addDoc } from "./firebase.js";

// UI elements
const bpEl = document.getElementById("bp");
const spo2El = document.getElementById("spo2");
const statusEl = document.getElementById("status");

// Generate random vitals
let currentVitals = {
  systolic: 120,
  diastolic: 80,
  spo2: 98
};

function generateVitals() {
  // Small gradual change
  currentVitals.systolic += Math.floor(Math.random() * 5 - 2); // -2 to +2
  currentVitals.diastolic += Math.floor(Math.random() * 3 - 1); // -1 to +1
  currentVitals.spo2 += Math.floor(Math.random() * 3 - 1); // -1 to +1

  // Clamp realistic ranges
  currentVitals.systolic = Math.max(100, Math.min(180, currentVitals.systolic));
  currentVitals.diastolic = Math.max(60, Math.min(110, currentVitals.diastolic));
  currentVitals.spo2 = Math.max(85, Math.min(100, currentVitals.spo2));

  // 🔥 Rare spike event (for demo drama)
  if (Math.random() < 0.1) { // 10% chance
    currentVitals.systolic += 20;
    currentVitals.spo2 -= 5;
  }

  return { ...currentVitals };
}

// Determine status
function getStatus(s, d, spo2) {
  if (s > 160 || spo2 < 90) return "CRITICAL";
  if (s > 140 || spo2 < 94) return "WARNING";
  return "NORMAL";
}

// Push to Firebase
async function sendToFirebase(vitals) {
  try {
    await addDoc(collection(db, "patients", "patient_1", "readings"), {
      bp_systolic: vitals.systolic,
      bp_diastolic: vitals.diastolic,
      spo2: vitals.spo2,
      timestamp: Date.now()
    });

    console.log("✅ Data written to Firebase");

  } catch (error) {
    console.error("❌ Firebase write error:", error);
  }
}

// Simulation loop
function startSimulation() {
  setInterval(async () => {
    const vitals = generateVitals();

    // Update UI
    bpEl.innerText = `${vitals.systolic}/${vitals.diastolic}`;
    spo2El.innerText = vitals.spo2;

    const status = getStatus(vitals.systolic, vitals.diastolic, vitals.spo2);
    statusEl.innerText = status;

    // Track consecutive states
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

    // Trigger alerts
    if (criticalCount >= 2) {
      showAlert("🚨 CRITICAL ALERT: Immediate attention required!");
      sendAlertToFirebase("CRITICAL", "Vitals critical for consecutive readings");
      criticalCount = 0; // reset after alert
    }

    if (warningCount >= 3) {
      showAlert("⚠️ WARNING: Health parameters unstable");
      sendAlertToFirebase("WARNING", "Vitals abnormal for sustained period");
      warningCount = 0;
    }

    async function sendAlertToFirebase(type, message) {
      await addDoc(collection(db, "alerts"), {
        patientId: "patient_1",
        type: type,
        message: message,
        timestamp: Date.now()
      });
    }

    // Send to Firebase
    await sendToFirebase(vitals);

    console.log("Data sent:", vitals, status);

  }, 3000); // every 3 sec (simulating 30 mins)
}

function showAlert(message) {
  alert(message); // simple popup (works for hackathon)
}

// Make button work
window.startSimulation = startSimulation;