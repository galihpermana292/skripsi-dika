const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");
console.log("frontend");

// Store the latest values
let currentValues = {
  garduA: 0,
  garduB: 0,
  garduC: 0,
  rssi1: 0,
  rssi2: 0,
  rssi3: 0,
};

client.on("connect", () => {
  console.log("Terhubung ke MQTT broker");

  // ✅ FIX TOPIK SUBSCRIBE
  client.subscribe("sensor/pot1"); 
  client.subscribe("sensor/pot2");
  client.subscribe("sensor/pot3");

  client.subscribe("sensor/rssi1");
  client.subscribe("sensor/rssi2");
  client.subscribe("sensor/rssi3");
});

client.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log(data, "data?", message);

    document.getElementById("time").innerText = new Date().toLocaleTimeString('id-ID');

    switch (topic) {
      case "sensor/pot1":
        document.getElementById("pot1").innerText = data.nilai;
        currentValues.garduA = data.nilai;
        checkGarduStatus();
        break;

      case "sensor/pot2":
        document.getElementById("pot2").innerText = data.nilai;
        currentValues.garduB = data.nilai;
        checkGarduStatus();
        break;

      case "sensor/pot3":
        document.getElementById("pot3").innerText = data.nilai;
        currentValues.garduC = data.nilai;
        checkGarduStatus();
        break;

      case "sensor/rssi1":
        document.getElementById("rssi1").innerText = data.nilai;
        currentValues.rssi1 = data.nilai;
        break;

      case "sensor/rssi2":
        document.getElementById("rssi2").innerText = data.nilai;
        currentValues.rssi2 = data.nilai;
        break;

      case "sensor/rssi3":
        document.getElementById("rssi3").innerText = data.nilai;
        currentValues.rssi3 = data.nilai;
        break;
    }

    updateTime();

  } catch (e) {
    console.error("Pesan MQTT bukan JSON valid:", message.toString());
  }
});

function updateTime() {
  const now = new Date();
  document.getElementById("time").innerText = now.toLocaleTimeString('id-ID');
}

// ===============================
// ✅ FIX NOTIFIKASI MULTI-GARDU
// ===============================
function checkGarduStatus() {
  const isBrokenElement = document.querySelector(".isbroken");
  let brokenList = [];

  if (currentValues.garduA === 0) brokenList.push("Gardu A");
  if (currentValues.garduB === 0) brokenList.push("Gardu B");
  if (currentValues.garduC === 0) brokenList.push("Gardu C");

  if (brokenList.length > 0) {
    isBrokenElement.textContent = `⚠️ Ada kerusakan pada ${brokenList.join(", ")}`;
    isBrokenElement.style.color = "red";
    isBrokenElement.style.fontWeight = "bold";
  } else {
    isBrokenElement.textContent = "";
  }
}

// ===============================
// ❌ checkOtherGardus DIMATIKAN
// (agar notifikasi TIDAK tertimpa)
// ===============================

// FUNCTION INI TIDAK DIPAKAI LAGI
/*
function checkOtherGardus(currentGardu) {
  if (currentGardu !== 1 && currentValues.garduA === 0) {
    document.querySelector(".isbroken").textContent = "Ada kerusakan pada Gardu A";
    return true;
  }
  if (currentGardu !== 2 && currentValues.garduB === 0) {
    document.querySelector(".isbroken").textContent = "Ada kerusakan pada Gardu B";
    return true;
  }
  if (currentGardu !== 3 && currentValues.garduC === 0) {
    document.querySelector(".isbroken").textContent = "Ada kerusakan pada Gardu C";
    return true;
  }
  return false;
}
*/

// Initialize buttons and load history data when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveButton");
  const refreshButton = document.getElementById("refreshButton");

  saveButton.addEventListener("click", saveToHistory);
  refreshButton.addEventListener("click", fetchHistoryData);

  fetchHistoryData();
});

// Function to save data to MongoDB via the API
function saveToHistory() {
  const data = {
    garduA: parseInt(currentValues.garduA),
    garduB: parseInt(currentValues.garduB),
    garduC: parseInt(currentValues.garduC),
    rssi1: parseInt(currentValues.rssi1),
    rssi2: parseInt(currentValues.rssi2),
    rssi3: parseInt(currentValues.rssi3),
  };

  fetch("https://skripsi-dika-production.up.railway.app/api/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Success:", data);
      alert("Data berhasil disimpan ke riwayat!");
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error menyimpan data ke riwayat: " + error.message);
    })
    .finally(() => {
      fetchHistoryData();
    });
}

function fetchHistoryData() {
  const tableBody = document.getElementById("historyTableBody");
  tableBody.innerHTML =
    '<tr><td colspan="7" style="text-align: center; padding: 10px;">Memuat data...</td></tr>';

  fetch("https://skripsi-dika-production.up.railway.app/api/data")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("History data:", data);
      displayHistoryData(data);
    })
    .catch((error) => {
      console.error("Error fetching history:", error);
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 10px; color: red;">Error memuat data: ${error.message}</td></tr>`;
    });
}

function displayHistoryData(data) {
  const tableBody = document.getElementById("historyTableBody");

  tableBody.innerHTML = "";

  if (!data || data.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="7" style="text-align: center; padding: 10px;">Tidak ada data riwayat tersedia</td></tr>';
    return;
  }

  data.forEach((item) => {
    const row = document.createElement("tr");

    const timestamp = new Date(item.timestamp);
    const formattedDate = timestamp.toLocaleDateString('id-ID');
    const formattedTime = timestamp.toLocaleTimeString('id-ID');

    const garduA = item.garduA !== undefined ? item.garduA : item.tower1 || 0;
    const garduB = item.garduB !== undefined ? item.garduB : item.tower2 || 0;
    const garduC = item.garduC !== undefined ? item.garduC : item.tower3 || 0;
    const rssi1 = item.rssi1 !== undefined ? item.rssi1 : item.rssi || 0;
    const rssi2 = item.rssi2 !== undefined ? item.rssi2 : item.rssi || 0;
    const rssi3 = item.rssi3 !== undefined ? item.rssi3 : item.rssi || 0;

    row.innerHTML = `
      <td style="border: 1px solid #ddd; padding: 8px;">${garduA}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${garduB}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${garduC}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${rssi1}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${rssi2}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${rssi3}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${formattedDate} ${formattedTime}</td>
    `;

    if (garduA === 0 || garduB === 0 || garduC === 0) {
      row.style.backgroundColor = "#ffebee";
    }

    tableBody.appendChild(row);
  });
}
