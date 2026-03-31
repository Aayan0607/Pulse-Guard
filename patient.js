import { db, collection, addDoc, query, where, getDocs } from "./firebase.js";

async function registerPatient() {
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const condition = document.getElementById("condition").value;
  const doctorId = document.getElementById("doctorId").value;

  if (!name || !age || !condition || !doctorId) {
    alert("Please fill all fields");
    return;
  }

  try {
    // 🔍 Check if patient already exists
    const q = query(
      collection(db, "patients"),
      where("name", "==", name),
      where("doctorId", "==", doctorId)
    );

    const snapshot = await getDocs(q);

    let patientId;

    if (!snapshot.empty) {
      // ✅ Existing patient
      patientId = snapshot.docs[0].id;
      console.log("✅ Existing patient found:", patientId);
    } else {
      // 🆕 Create new patient
      const docRef = await addDoc(collection(db, "patients"), {
        name,
        age: Number(age),
        condition,
        doctorId,
        createdAt: Date.now()
      });

      patientId = docRef.id;
      console.log("🆕 New patient created:", patientId);
    }

    // 🔥 Store patientId
    localStorage.setItem("patientId", patientId);

    // Redirect
    window.location.href = "index.html";

  } catch (error) {
    console.error("❌ Error:", error);
    alert("Something went wrong");
  }
}

window.registerPatient = registerPatient;