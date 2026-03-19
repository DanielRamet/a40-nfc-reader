import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const tableBody = document.getElementById("tableBody");
const button = document.getElementById("scanButton");

const scansQuery = query(
  collection(db, "scans"),
  orderBy("count", "desc")
);

const COOLDOWN = 8 * 60 * 1000; // 8 minutos en ms

// Función para actualizar podio y tabla
onSnapshot(scansQuery, (snapshot) => {

  tableBody.innerHTML = "";
  let ranking = [];

  snapshot.forEach((docItem) => {
    ranking.push(docItem.data());
  });

  updatePodium(ranking);
  updateTable(ranking);

});

// Actualizar los 3 primeros en podio
function updatePodium(ranking) {
  const first = ranking[0];
  const second = ranking[1];
  const third = ranking[2];

  if (first) {
    document.querySelector("#first .name").textContent = first.uid;
    document.querySelector("#first .score").textContent = first.count;
  } else {
    document.querySelector("#first .name").textContent = "";
    document.querySelector("#first .score").textContent = "";
  }

  if (second) {
    document.querySelector("#second .name").textContent = second.uid;
    document.querySelector("#second .score").textContent = second.count;
  } else {
    document.querySelector("#second .name").textContent = "";
    document.querySelector("#second .score").textContent = "";
  }

  if (third) {
    document.querySelector("#third .name").textContent = third.uid;
    document.querySelector("#third .score").textContent = third.count;
  } else {
    document.querySelector("#third .name").textContent = "";
    document.querySelector("#third .score").textContent = "";
  }
}

// Actualizar la tabla completa, mostrando cooldown
function updateTable(ranking) {

  const now = Date.now();

  ranking.forEach((data, index) => {
    const lastScan = data.lastScan || 0;
    const remaining = Math.max(0, COOLDOWN - (now - lastScan));
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    const timeStr = lastScan ? new Date(lastScan).toLocaleTimeString() : "-";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${data.uid}</td>
      <td>${data.count}</td>
      <td>${timeStr}${remaining > 0 ? ` (activo en ${minutes}:${seconds.toString().padStart(2,'0')})` : ""}</td>
    `;
    tableBody.appendChild(row);
  });

}

// Función de simulación de escaneo
button.addEventListener("click", simulateScan);

async function simulateScan() {

  const randomUID = "bracelet_" + Math.floor(Math.random() * 5 + 1);
  const ref = doc(db, "scans", randomUID);
  const snap = await getDoc(ref);
  const now = Date.now();

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: randomUID,
      count: 1,
      lastScan: now
    });
  } else {
    const data = snap.data();
    if (now - data.lastScan > COOLDOWN) {
      await updateDoc(ref, {
        count: data.count + 1,
        lastScan: now
      });
    } else {
      console.log("Scan ignorado (cooldown)");
    }
  }

}