const userID = "887557388700368896";

const elements = {
    statusBox: document.querySelector(".status"),
    statusImage: document.getElementById("status-image"),
    displayName: document.querySelector(".display-name"),
    username: document.querySelector(".username"),
    customStatus: document.querySelector(".custom-status"),
    customStatusText: document.querySelector(".custom-status-text"),
    customStatusEmoji: document.getElementById("custom-status-emoji"),
};

// WebSocket retry limit
let retryCount = 0;

function startWebSocket() {
    const ws = new WebSocket("wss://api.lanyard.rest/socket");

    ws.onopen = () => {
        ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userID } }));
        retryCount = 0;  // Reset retry count on successful connection
    };

    ws.onmessage = (event) => {
        const { t, d } = JSON.parse(event.data);
        if (t === "INIT_STATE" || t === "PRESENCE_UPDATE") {
            updateStatus(d);
        }
    };

    ws.onerror = (error) => {
        console.error("Lỗi WebSocket:", error);
        ws.close();
    };

    ws.onclose = () => {
        console.log("WebSocket đóng, thử kết nối lại...");
        if (retryCount < 5) {  // Limit the retry attempts
            retryCount++;
            setTimeout(startWebSocket, 1000);
        } else {
            console.log("Reached maximum retry attempts.");
        }
    };
}

function updateStatus(lanyardData) {
    // Destructure the data from the WebSocket
    const { discord_status, activities, discord_user } = lanyardData;

    // Ensure activities is an array and get the first activity
    const activitiesArray = Array.isArray(activities) ? activities : [];
    const firstActivity = activitiesArray[0] || {};

    // Handle user information
    if (elements.displayName) elements.displayName.innerHTML = discord_user.display_name || "Unknown";
    if (elements.username) elements.username.innerHTML = discord_user.username || "Unknown";

    // Handle status
    let imagePath = "./public/status/offline.svg";
    let label = "Offline";
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
            label = "Unknown";
            break;
    }

    // Check if the user is streaming (e.g., on Twitch or YouTube)
    const isStreaming = activitiesArray.some(
        (activity) =>
            activity.type === 1 &&
            (activity.url.includes("twitch.tv") || activity.url.includes("youtube.com"))
    );
    if (isStreaming) {
        imagePath = "./public/status/streaming.svg";
        label = "Streaming";
    }

    // Update status image and aria-label
    if (elements.statusImage) elements.statusImage.src = imagePath;
    if (elements.statusBox) elements.statusBox.setAttribute("aria-label", label);

    // Handle custom status (state and emoji)
    const activityState = firstActivity.state || "Not doing anything!";
    if (elements.customStatusText) elements.customStatusText.innerHTML = activityState;

    const emoji = firstActivity?.emoji || {};
    if (elements.customStatusEmoji) {
        if (emoji.id) {
            elements.customStatusEmoji.src = `https://cdn.discordapp.com/emojis/${emoji.id}?format=webp&size=24&quality=lossless`;
        } else if (emoji.name) {
            elements.customStatusEmoji.src = "./public/icons/poppy.png";  // Fallback emoji image
        } else {
            elements.customStatusEmoji.style.display = "none";
        }
    }

    // Toggle the visibility of custom status based on state and emoji
    if (elements.customStatus) {
        if (activityState || emoji.id || emoji.name) {
            elements.customStatus.style.display = "flex";
        } else {
            elements.customStatus.style.display = "none";
        }
    }
}

// Start the WebSocket connection
startWebSocket();
