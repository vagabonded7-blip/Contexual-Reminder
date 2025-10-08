/********* Smart Contextual Reminder Logic *********/

// Tasks array
// ...existing code...


/********* GPS Tracker Logic *********/
let currentLat = null;
let currentLng = null;
let savedLocations = [];

// Get current GPS coordinates
document.getElementById("getLocationBtn").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLat = position.coords.latitude;
        currentLng = position.coords.longitude;
        document.getElementById("currentLocationGPS").innerText =
          `Latitude: ${currentLat.toFixed(5)}, Longitude: ${currentLng.toFixed(5)}`;
      },
      (error) => {
        alert("Error getting location: " + error.message);
      }
    );
  } else {
    alert("Geolocation not supported by your browser.");
  }
});

// Save GPS location
document.getElementById("saveLocationBtn").addEventListener("click", () => {
  let name = document.getElementById("locationName").value.trim();
  if (!name) {
    alert("Enter a name for the location!");
    return;
  }
  if (currentLat === null || currentLng === null) {
    alert("Get your current location first!");
    return;
  }

  savedLocations.push({ name: name, lat: currentLat, lng: currentLng });
  document.getElementById("locationName").value = "";
  displaySavedLocations();
});

// Add Manual Location
document.getElementById("addManualLocationBtn").addEventListener("click", () => {
  let lat = parseFloat(document.getElementById("manualLat").value);
  let lng = parseFloat(document.getElementById("manualLng").value);
  let name = prompt("Enter a name for this location:");

  if (!isNaN(lat) && !isNaN(lng) && name) {
    savedLocations.push({ name, lat, lng });
    displaySavedLocations();
    document.getElementById("manualLat").value = "";
    document.getElementById("manualLng").value = "";
  } else {
    alert("Invalid latitude or longitude");
  }
});

// Display saved locations
function displaySavedLocations() {
  let list = document.getElementById("savedLocations");
  list.innerHTML = "";
  savedLocations.forEach((loc) => {
    let li = document.createElement("li");
    li.innerText = `${loc.name} → Latitude: ${loc.lat.toFixed(5)}, Longitude: ${loc.lng.toFixed(5)}`;
    list.appendChild(li);
  });
}

/********* Helper: Calculate distance between GPS points *********/
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // distance in km
}

/********* Text-to-Speech Alert *********/
function speakReminder(text) {
  let msg = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(msg);
}

/********* Automatic GPS-Based Alarm System *********/
setInterval(() => {
  if (currentLat && currentLng) {
    savedLocations.forEach(loc => {
      let distance = getDistance(currentLat, currentLng, loc.lat, loc.lng);
      if (distance < 0.05) { // ~50 meters
        tasks.forEach(t => {
          if (t.location.toLowerCase() === loc.name.toLowerCase() && !t.triggered) {
            alert(`Reminder: ${t.task} at ${loc.name}`);
            speakReminder(`Reminder: ${t.task} at ${loc.name}`);
            t.triggered = true;
          }
        });
        displayTasks();
      }
    });
  }
}, 5000); // check every 5 seconds

/********* Time-Based Alarm *********/
setInterval(() => {
  let now = new Date();
  tasks.forEach(t => {
    if (t.time && !t.triggered) {
      let [hour, min] = t.time.split(':').map(Number);
      if (now.getHours() === hour && now.getMinutes() === min) {
        alert(`Time Reminder: ${t.task}`);
        speakReminder(`Time Reminder: ${t.task}`);
        t.triggered = true;
      }
    }
  });
  displayTasks();
}, 60000); // every minute

// Routine setup logic
const routineInput = document.getElementById('routineInput');
const saveRoutineBtn = document.getElementById('saveRoutineBtn');
const routineOutput = document.getElementById('routineOutput');

// Load routine if exists
window.addEventListener('DOMContentLoaded', () => {
  const savedRoutine = localStorage.getItem('userRoutine');
  if (savedRoutine) {
    routineOutput.textContent = "Your routine: " + savedRoutine;
    routineInput.value = savedRoutine;
  }
});

saveRoutineBtn.addEventListener('click', () => {
  const routine = routineInput.value.trim();
  if (routine) {
    localStorage.setItem('userRoutine', routine);
    routineOutput.textContent = "Your routine saved! " + routine;
  } else {
    routineOutput.textContent = "Please enter your routine.";
  }
});

document.getElementById('aiAnalyzeBtn').addEventListener('click', async () => {
  const routine = document.getElementById('routineInput').value;
  const mood = document.getElementById('moodInput').value;
  const aiOutput = document.getElementById('aiOutput');
  aiOutput.textContent = "Analyzing...";

  // Example payload for OpenAI API (replace with your API endpoint and key)
  const apiKey = 'YOUR_OPENAI_API_KEY'; // Replace with your actual API key
  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const prompt = `My mood is ${mood}. My routine: ${routine}. Based on this, give me insights and suggestions for reminders and schedule improvements.`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    aiOutput.textContent = data.choices?.[0]?.message?.content || "No insights received.";
  } catch (err) {
    aiOutput.textContent = "Error connecting to AI API.";
  }
});

// You can now use localStorage.getItem('userRoutine') in your location/reminder logic
// to give smart suggestions or trigger reminders based on user's routine and location.
