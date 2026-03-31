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
  await addDoc(collection(db, "patients/patient_1/readings"), {
    bp_systolic: vitals.systolic,
    bp_diastolic: vitals.diastolic,
    spo2: vitals.spo2,
    timestamp: Date.now()
  });
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

    // Send to Firebase
    await sendToFirebase(vitals);

    console.log("Data sent:", vitals, status);

  }, 3000); // every 3 sec (simulating 30 mins)
}

// Make button work
window.startSimulation = startSimulation;