import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {

  const tableBody = document.getElementById("tableBody");
  const button = document.getElementById("scanButton");
  const cooldownMessage = document.getElementById("cooldownMessage");

  if (!tableBody || !button || !cooldownMessage) {
    console.error("No se encontraron elementos del DOM. Revisa los IDs.");
    return;
  }

  const scansQuery = query(
    collection(db, "scans"),
    orderBy("count", "desc")
  );

  const COOLDOWN = 8 * 60 * 1000;

  let lastPodium = {
    first: "",
    second: "",
    third: ""
  };

  let previousCounts = {};



  // Escucha cambios en tiempo real
  onSnapshot(scansQuery, (snapshot) => {

    tableBody.innerHTML = "";
    let ranking = [];

    snapshot.forEach((docItem) => {

      const data = docItem.data();
      ranking.push(data);

      const uid = data.uid;
      const count = data.count;

      if (previousCounts[uid] !== undefined && count > previousCounts[uid]) {
        showScanNotification(uid);
      }

      previousCounts[uid] = count;

    });

    updatePodium(ranking);
    updateTable(ranking);

  });



  // PODIO
  function updatePodium(ranking) {

    const podiumSlots = ["first", "second", "third"];
    const animations = [
      "podium-animate-gold",
      "podium-animate-silver",
      "podium-animate-bronze"
    ];

    podiumSlots.forEach((slot, i) => {

      const data = ranking[i];

      const nameEl = document.querySelector(`#${slot} .name`);
      const scoreEl = document.querySelector(`#${slot} .score`);

      if (!nameEl || !scoreEl) return;

      const uid = data ? data.uid : "";

      if (lastPodium[slot] !== uid && uid !== "") {

        nameEl.classList.add(animations[i]);
        scoreEl.classList.add(animations[i]);

        setTimeout(() => {
          nameEl.classList.remove(animations[i]);
          scoreEl.classList.remove(animations[i]);
        }, 600);

      }

      nameEl.textContent = uid;
      scoreEl.textContent = data ? data.count : "";

      lastPodium[slot] = uid;

    });

  }



  // TABLA COMPLETA
  function updateTable(ranking) {

    const now = Date.now();

    ranking.forEach((data, index) => {

      const lastScan = data.lastScan || 0;

      const remaining = Math.max(
        0,
        COOLDOWN - (now - lastScan)
      );

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      const timeStr = lastScan
        ? new Date(lastScan).toLocaleTimeString()
        : "-";

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${data.uid}</td>
        <td>${data.count}</td>
        <td>
          ${timeStr}
          ${remaining > 0
            ? ` (activo en ${minutes}:${seconds.toString().padStart(2,'0')})`
            : ""}
        </td>
      `;

      tableBody.appendChild(row);

    });

  }



  // NOTIFICACIÓN DE ESCANEO
  function showScanNotification(uid) {

    const el = document.getElementById("scanNotification");

    if (!el) return;

    el.textContent = `🔥 +1 punto para ${uid}`;

    el.classList.remove("scan-show");

    void el.offsetWidth;

    el.classList.add("scan-show");

  }



  // SIMULACIÓN DE ESCANEO
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
          count: increment(1),
          lastScan: now
        });

      } else {

        cooldownMessage.style.display = "block";

        setTimeout(() => {
          cooldownMessage.style.display = "none";
        }, 3000);

        console.log("Scan ignorado (cooldown)");

      }

    }

  }

});