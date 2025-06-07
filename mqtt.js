const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");
console.log("frontend");

// Store the latest values
let currentValues = {
  tower1: 0,
  tower2: 0,
  tower3: 0,
  rssi: 0,
};

client.on("connect", () => {
  console.log("Terhubung ke MQTT broker");
  client.subscribe("sensor/pot1");
  client.subscribe("sensor/pot2");
  client.subscribe("sensor/pot3");
  client.subscribe("sensor/rssi");
});

client.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log(data, "data?", message);

    // Update timestamp
    document.getElementById("time").innerText = new Date().toLocaleTimeString();

    switch (topic) {
      case "sensor/pot1":
        document.getElementById("pot1").innerText = data.nilai;
        currentValues.tower1 = data.nilai;
        checkTowerStatus(1, data.nilai);
        break;
      case "sensor/pot2":
        document.getElementById("pot2").innerText = data.nilai;
        currentValues.tower2 = data.nilai;
        checkTowerStatus(2, data.nilai);
        break;
      case "sensor/pot3":
        document.getElementById("pot3").innerText = data.nilai;
        currentValues.tower3 = data.nilai;
        checkTowerStatus(3, data.nilai);
        break;
      case "sensor/rssi":
        document.getElementById("rssi").innerText = data.nilai;
        currentValues.rssi = data.nilai;
        break;
    }
    updateTime(); // update waktu setiap ada data masuk
  } catch (e) {
    console.error("Pesan MQTT bukan JSON valid:", message.toString());
  }
});

function updateTime() {
  const now = new Date();
  document.getElementById("time").innerText = now.toLocaleTimeString();
}

// Function to check if tower value is above 500
function checkTowerStatus(towerNumber, value) {
  const isBrokenElement = document.querySelector(".isbroken");

  if (value === 0) {
    isBrokenElement.textContent = `There is a broken tower ${towerNumber}`;
    isBrokenElement.style.color = "red";
    isBrokenElement.style.fontWeight = "bold";
  } else {
    // Check if any other tower is broken
    const otherBrokenTower = checkOtherTowers(towerNumber);
    if (!otherBrokenTower) {
      isBrokenElement.textContent = "";
    }
  }
}

// Helper function to check if other towers are broken
function checkOtherTowers(currentTower) {
  if (currentTower !== 1 && currentValues.tower1 === 0) {
    document.querySelector(".isbroken").textContent =
      "There is a broken tower 1";
    return true;
  }
  if (currentTower !== 2 && currentValues.tower2 === 0) {
    document.querySelector(".isbroken").textContent =
      "There is a broken tower 2";
    return true;
  }
  if (currentTower !== 3 && currentValues.tower3 === 0) {
    document.querySelector(".isbroken").textContent =
      "There is a broken tower 3";
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
    tower1: parseInt(currentValues.tower1),
    tower2: parseInt(currentValues.tower2),
    tower3: parseInt(currentValues.tower3),
    rssi: parseInt(currentValues.rssi),
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
      alert("Data saved to history successfully!");
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error saving data to history: " + error.message);
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
    '<tr><td colspan="5" style="text-align: center; padding: 10px;">Loading data...</td></tr>';

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
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 10px; color: red;">Error loading data: ${error.message}</td></tr>`;
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
      '<tr><td colspan="5" style="text-align: center; padding: 10px;">No history data available</td></tr>';
    return;
  }

  // Add each data item to the table
  data.forEach((item) => {
    const row = document.createElement("tr");

    // Format the timestamp
    const timestamp = new Date(item.timestamp);
    const formattedDate = timestamp.toLocaleDateString();
    const formattedTime = timestamp.toLocaleTimeString();

    // Create row content
    row.innerHTML = `
      <td style="border: 1px solid #ddd; padding: 8px;">${item.tower1}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.tower2}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.tower3}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.rssi}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${formattedDate} ${formattedTime}</td>
    `;

    // Highlight rows with broken towers
    if (item.tower1 === 0 || item.tower2 === 0 || item.tower3 === 0) {
      row.style.backgroundColor = "#ffebee";
    }

    tableBody.appendChild(row);
  });
}
