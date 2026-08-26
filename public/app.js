import { db, auth, onAuthStateChanged } from "./firebase.js"

import {
    collection,
    query,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"

// Mensajes festivos aleatorios para el modal NFC
const festiveMessages = [
    "¡Salud! +1 a la cuenta",
    "¡Brindo! Una más",
    "¡Qué bueno! +1",
    "¡Sí! Otra ronda",
    "¡Genial! +1",
    "¡Excelente! +1 más",
    "¡Fantástico! +1",
    "¡Perfecto! +1",
    "¡Brindis! +1",
    "¡Qué alegría! +1"
];

document.addEventListener("DOMContentLoaded", () => {

    const tableBody = document.getElementById("tableBody")
    const totalScansEl = document.getElementById("totalScans")
    const tableContainer = document.getElementById("tableContainer")

    let previousCounts = {}
    let previousRanking = []

    // Ocultar pantalla de bienvenida después de 3 segundos
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('hidden');
    }, 3000);

    startAutoScroll()

    const scansQuery = query(
        collection(db, "scans"),
        orderBy("count", "desc")
    )

    onAuthStateChanged(auth, (user) => {

        if (!user) {
            console.log("Esperando login...");
            return;
        }

        console.log("Usuario autenticado:", user.uid);

        onSnapshot(scansQuery, (snapshot) => {

            let ranking = []
            let total = 0

            snapshot.forEach((docItem) => {

                const data = docItem.data()

                ranking.push(data)
                total += data.count

            })

            updateGlobalCounter(total)

            detectRankingChanges(ranking)

            detectPodiumChanges(ranking)

            updatePodium(ranking)

            updateTable(ranking)

            previousRanking = ranking.map(x => x.uid)

        })

    })

    function updateGlobalCounter(total) {

        totalScansEl.textContent = total

    }

    function detectRankingChanges(ranking) {

        ranking.forEach((data) => {

            const uid = data.uid
            const name = data.name || uid
            const count = data.count

            if (previousCounts[uid] !== undefined && count > previousCounts[uid]) {

                // Mostrar modal NFC con mensaje festivo aleatorio
                showNFCModal();

            }

            previousCounts[uid] = count

        })

    }

    function detectPodiumChanges(ranking) {

        const top3 = ranking.slice(0, 3)

        top3.forEach((data, index) => {

            const uid = data.uid
            const name = data.name || uid

            const prevIndex = previousRanking.indexOf(uid)

            const slot = ["first", "second", "third"][index]

            const podiumEl = document.getElementById(slot)

            if (prevIndex === -1) return

            if (prevIndex >= 3 && index < 3) {

                podiumEl.classList.add("podium-new")

                showScanNotification(`🚀 ${name} entra al PODIO`)

            }

            if (prevIndex > index) {

                podiumEl.classList.add("podium-change")

                showScanNotification(`⬆ ${name} sube al puesto ${index + 1}`)

            }

            setTimeout(() => {

                podiumEl.classList.remove("podium-change")
                podiumEl.classList.remove("podium-new")

            }, 1000)

        })

    }

    function updatePodium(ranking) {

        const slots = ["first", "second", "third"]

        slots.forEach((slot, i) => {

            const data = ranking[i]

            const nameEl = document.querySelector(`#${slot} .name`)
            const scoreEl = document.querySelector(`#${slot} .score`)

            if (!nameEl || !scoreEl) return

            nameEl.textContent = data ? (data.name || data.uid) : ""
            scoreEl.textContent = data ? data.count : ""

        })

    }

    function updateTable(ranking) {

        tableBody.innerHTML = ""

        ranking.forEach((data, index) => {

            const uid = data.uid
            const name = data.name || uid
            const lastScan = data.lastScan || 0

            const timeStr = lastScan
                ? new Date(lastScan).toLocaleTimeString()
                : "-"

            const row = document.createElement("tr")

            if (previousRanking.indexOf(uid) > index) {

                row.classList.add("rank-up")

            }

            if (previousCounts[uid] !== undefined && data.count > previousCounts[uid]) {

                row.classList.add("drink-flash")

            }

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${name} (${data.uid})</td>
                <td>${data.count}</td>
                <td>${timeStr}</td>
            `

            tableBody.appendChild(row)

        })

    }

    function showScanNotification(text) {

        const el = document.getElementById("scanNotification")

        el.textContent = text

        el.classList.remove("scan-show")
        void el.offsetWidth
        el.classList.add("scan-show")

    }

    // Función para mostrar el modal animado NFC solo con el mensaje aleatorio
    function showNFCModal() {
        const overlay = document.getElementById('modalOverlay');
        const messageEl = document.querySelector('.modal-message');

        // Seleccionar un mensaje aleatorio
        const randomIndex = Math.floor(Math.random() * festiveMessages.length);
        messageEl.textContent = festiveMessages[randomIndex];

        // Mostrar modal
        overlay.classList.remove('modal-hidden');
        overlay.classList.add('modal-show');

        // Ocultar después de 2 segundos
        setTimeout(() => {
            overlay.classList.remove('modal-show');
            overlay.classList.add('modal-hidden');
        }, 2000);
    }

    function startAutoScroll() {

        const speed = 0.3

        setInterval(() => {

            if (tableContainer.scrollHeight <= tableContainer.clientHeight) return

            tableContainer.scrollTop += speed

            if (tableContainer.scrollTop >= tableContainer.scrollHeight - tableContainer.clientHeight) {

                tableContainer.scrollTop = 0

            }

        }, 16)

    }

})