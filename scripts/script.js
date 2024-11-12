const userID = "887557388700368896";  // Replace with your actual user ID
const elements = {
  statusBox: document.querySelector(".status"),
  statusImage: document.getElementById("status-image"),
  displayName: document.querySelector(".display-name"),
  username: document.querySelector(".username"),
  customStatus: document.querySelector(".custom-status"),
  customStatusText: document.querySelector(".custom-status-text"),
  customStatusEmoji: document.getElementById("custom-status-emoji"),
};

function startWebSocket() {
  const ws = new WebSocket("wss://api.lanyard.rest/socket");

  // Handle connection open
  ws.onopen = () => {
    console.log("WebSocket connection established");
    ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userID } }));
  };

  // Handle incoming messages
  ws.onmessage = (event) => {
    const { t, d } = JSON.parse(event.data);

    // Handle INIT_STATE and PRESENCE_UPDATE
    if (t === "INIT_STATE" || t === "PRESENCE_UPDATE") {
      updateStatus(d);
    }
  };

  // Handle WebSocket errors
  ws.onerror = (error) => {
    console.error("WebSocket Error:", error);
    ws.close();
  };

  // Reconnect on close
  ws.onclose = () => {
    console.log("WebSocket closed, attempting reconnect...");
    setTimeout(startWebSocket, 1000);  // Retry connection after 1 second
  };
}

function updateStatus(lanyardData) {
  // Debugging step to check the data structure
  console.log("Received data:", lanyardData);

  // Destructure the necessary fields from the incoming data
  const { discord_status, activities, discord_user } = lanyardData;

  if (!discord_user || !discord_status || !activities) {
    console.error("Invalid data received", lanyardData);
    return;
  }

  // Update display name and username
  elements.displayName.textContent = discord_user.display_name;
  elements.username.textContent = discord_user.username;

  // Handle different Discord status
  let imagePath;
  let label;
  switch (discord_status) {
    case "online":
      imagePath = "./public/status/online.svg";
      label = "Online";
      break;
    case "idle":
      imagePath = "./public/status/idle.svg";
      label = "Idle / AFK";
      break;
    case "dnd":
      imagePath = "./public/status/dnd.svg";
      label = "Do Not Disturb";
      break;
    case "offline":
      imagePath = "./public/status/offline.svg";
      label = "Offline";
      break;
    default:
      imagePath = "./public/status/offline.svg";
      label = "Unknown";
      break;
  }

  // Check if the user is streaming
  const isStreaming = activities.some(
    (activity) =>
      activity.type === 1 &&
      (activity.url.includes("twitch.tv") || activity.url.includes("youtube.com"))
  );
  if (isStreaming) {
    imagePath = "./public/status/streaming.svg";
    label = "Streaming";
  }

  // Update status image and aria-label
  elements.statusImage.src = imagePath;
  elements.statusBox.setAttribute("aria-label", label);

  // Handle custom status message and emoji
  if (activities.length > 0) {
    const activity = activities[0];  // Assuming the first activity is the primary one
    elements.customStatusText.textContent = activity.state || "Not doing anything!";

    const emoji = activity.emoji;
    if (emoji && emoji.id) {
      elements.customStatusEmoji.src = `https://cdn.discordapp.com/emojis/${emoji.id}?format=webp&size=24&quality=lossless`;
      elements.customStatusEmoji.style.display = "inline";  // Ensure emoji is visible
    } else if (emoji && emoji.name) {
      elements.customStatusEmoji.src = "./public/icons/poppy.png";
      elements.customStatusEmoji.style.display = "inline";  // Ensure emoji is visible
    } else {
      elements.customStatusEmoji.style.display = "none";  // Hide emoji if no custom emoji
    }

    // Show or hide custom status
    if (activity.state || emoji) {
      elements.customStatus.style.display = "flex";
    } else {
      elements.customStatus.style.display = "none";
    }
  }

  // If no activities, hide the custom status section
  if (activities.length === 0) {
    elements.customStatus.style.display = "none";
  }
}

// Start WebSocket connection
startWebSocket();
