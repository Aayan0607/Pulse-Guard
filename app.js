import { db, collection, addDoc } from "./firebase.js";

async function addTestReading() {
  await addDoc(collection(db, "patients/patient_1/readings"), {
    bp_systolic: 120,
    bp_diastolic: 80,
    spo2: 98,
    timestamp: Date.now()
  });

  console.log("Test data added");
}

addTestReading();