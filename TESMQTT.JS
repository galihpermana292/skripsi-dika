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
  client.subscribe("sensor/pot1");  // Gardu A
  client.subscribe("sensor/pot2");  // Gardu B
  client.subscribe("sensor/pot3");  // Gardu C
  client.subscribe("sensor/rssi1"); // RSSI Gardu A
  client.subscribe("sensor/rssi2"); // RSSI Gardu B
  client.subscribe("sensor/rssi3"); // RSSI Gardu C
});

client.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log(data, "data?", message);

    // Update timestamp
    document.getElementById("time").innerText = new Date().toLocaleTimeString('id-ID');

    switch (topic) {
      case "sensor/pot1":
        document.getElementById("pot1").innerText = data.nilai;
        currentValues.garduA = data.nilai;
        checkGarduStatus(1, data.nilai);
        break;
      case "sensor/pot2":
        document.getElementById("pot2").innerText = data.nilai;
        currentValues.garduB = data.nilai;
        checkGarduStatus(2, data.nilai);
        break;
      case "sensor/pot3":
        document.getElementById("pot3").innerText = data.nilai;
        currentValues.garduC = data.nilai;
        checkGarduStatus(3, data.nilai);
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
    updateTime(); // update waktu setiap ada data masuk
  } catch (e) {
    console.error("Pesan MQTT bukan JSON valid:", message.toString());
  }
});

function updateTime() {
  const now = new Date();
  document.getElementById("time").innerText = now.toLocaleTimeString('id-ID');
}

// Function to check if gardu value is 0 (broken)
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


// Helper function to check if other gardus are broken
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

// Initialize buttons and load history data when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveButton");
  const refreshButton = document.getElementById("refreshButton");

  saveButton.addEventListener("click", saveToHistory);
  refreshButton.addEventListener("click", fetchHistoryData);

  // Load history data when the page loads
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

  // https://skripsi-dika-production.up.railway.app/ atau
  // localhost:5000
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
      // Refresh the history data after saving
      fetchHistoryData();
    });
}

// Function to fetch history data from the API
function fetchHistoryData() {
  // Show loading indicator in the table
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

// Function to display history data in the table
function displayHistoryData(data) {
  const tableBody = document.getElementById("historyTableBody");

  // Clear the table
  tableBody.innerHTML = "";

  // Check if there's no data
  if (!data || data.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="7" style="text-align: center; padding: 10px;">Tidak ada data riwayat tersedia</td></tr>';
    return;
  }

  // Add each data item to the table
  data.forEach((item) => {
    const row = document.createElement("tr");

    // Format the timestamp
    const timestamp = new Date(item.timestamp);
    const formattedDate = timestamp.toLocaleDateString('id-ID');
    const formattedTime = timestamp.toLocaleTimeString('id-ID');

    // Handle both old and new data structure for backward compatibility
    const garduA = item.garduA !== undefined ? item.garduA : item.tower1 || 0;
    const garduB = item.garduB !== undefined ? item.garduB : item.tower2 || 0;
    const garduC = item.garduC !== undefined ? item.garduC : item.tower3 || 0;
    const rssi1 = item.rssi1 !== undefined ? item.rssi1 : item.rssi || 0;
    const rssi2 = item.rssi2 !== undefined ? item.rssi2 : item.rssi || 0;
    const rssi3 = item.rssi3 !== undefined ? item.rssi3 : item.rssi || 0;

    // Create row content
    row.innerHTML = `
      <td style="border: 1px solid #ddd; padding: 8px;">${garduA}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${garduB}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${garduC}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${rssi1}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${rssi2}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${rssi3}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${formattedDate} ${formattedTime}</td>
    `;

    // Highlight rows with broken gardus
    if (garduA === 0 || garduB === 0 || garduC === 0) {
      row.style.backgroundColor = "#ffebee";
    }

    tableBody.appendChild(row);
  });
}
