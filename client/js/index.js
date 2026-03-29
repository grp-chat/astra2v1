// ============================================================
// SOCKET INITIALIZATION
// ============================================================
const socket = io(); 

// --- WINNING OUTCOME HANDLER ---
socket.on("TRIGGER_OUTCOME", (fileName) => {
    let message = "MISSION COMPLETE! Access the final report?";
    
    if (fileName === "warp.html") message = "MAX VELOCITY! Initiate Warp Jump?";
    if (fileName === "alienWin.html") message = "SHIP COMPROMISED! Abandon Astra-2?";
    if (fileName === "stealth.html") message = "GHOST PROTOCOL! Vanish from the sector?";
    if (fileName === "signal.html") message = "DATA UPLINK READY! Transmit to Command?";

    if (confirm(message)) {
        window.open(fileName, '_blank');
    }
});

socket.on("STATE_UPDATE", (state) => {
    console.log("🛰️ Live State Received:", state);
    
    window.gameStarted = true;
    window.currentGameState = state; 

    if (state.players) {
        const names = Object.keys(state.players);
        window.players = [...names];
        window.playersData = names.map(name => ({
            name: name,
            role: state.players[name].role
        }));

        if (typeof renderPlayerList === "function") renderPlayerList();
        if (typeof updatePlayerCount === "function") updatePlayerCount();
    }

    refreshButtonStates();
    syncDashboardData(state);
});

// ============================================================
// APP START & STATE INITIALIZATION
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    showScreen("mainMenu");
    if (typeof updatePlayerCount === "function") updatePlayerCount();
    refreshButtonStates();
});

// ============================================================
// SCREEN MANAGEMENT
// ============================================================
function showScreen(id) {
    hideAllScreens();
    const el = document.getElementById(id);
    if (el) {
        el.style.display = (id === "dashboardWrapper") ? "block" : "flex";
        el.classList.add("active");
    }
    
    // DELETE OR COMMENT OUT THE LINE BELOW:
    // if (id === "gameSettings") loadGame(); 

    if (id === "dashboardWrapper" && window.currentGameState) {
        syncDashboardData(window.currentGameState);
    }
}

function hideAllScreens() {
    document.querySelectorAll(".screen").forEach(el => {
        el.style.display = "none";
        el.classList.remove("active");
    });
}

function refreshButtonStates() {
    const isStarted = window.gameStarted || !!window.currentGameState;
    const btnIds = ["dashboardBtn", "actionBtn", "auditBtn", "revealBtn"];
    btnIds.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = !isStarted;
    });
}

// ============================================================
// DATA SYNC & LOADING
// ============================================================
async function loadGame() {
    try {
        const res = await fetch("/current-game");
        const data = await res.json();
        if (!data.success || !data.data) return;

        const game = data.data;
        window.currentGameState = game;
        window.gameStarted = true;

        if (typeof renderPlayerList === "function") renderPlayerList();
        if (typeof updatePlayerCount === "function") updatePlayerCount();
        
        refreshButtonStates(); 
        console.log("Settings synced with current game ✔");
    } catch (err) {
        console.log("Initial load failed or no game active.");
    }
}

function syncDashboardData(state) {
    const frame = document.getElementById('dashboardFrame');
    if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage({
            type: 'UPDATE_GAME_STATE',
            payload: state
        }, "*");
    }
}

window.addEventListener("message", (event) => {
    if (event.data === "CLOSE_DASHBOARD") {
        showScreen("mainMenu");
    }
});

window.showScreen = showScreen;
window.loadGame = loadGame;

function openActionPanel() {
    showScreen("actionWrapper");
}
window.openActionPanel = openActionPanel;

window.addEventListener("message", (event) => {
    if (event.data === "CLOSE_ACTION") {
        console.log("Terminal Disconnected. Returning to Main Menu.");
        showScreen("mainMenu");
        const frame = document.getElementById('actionFrame');
        if (frame) {
            frame.src = 'action.html'; 
        }
    }
});

function showAudit() {
    // This uses your existing showScreen logic to jump to the audit div
    showScreen('auditScreen');
}

function requestReset(mode) {
    const confirmation = confirm(`Are you sure you want to perform a ${mode} reset? This cannot be undone.`);
    if (confirmation) {
        socket.emit("RESET_REQUEST", mode);
        showScreen('mainMenu'); // Go back to menu after clicking
    }
}

// Listen for the force reload signal from server
socket.on("FORCE_RELOAD", () => {
    window.location.reload();
});

// Add these to your js/index.js

function showAudit() {
    renderAuditPlayers();
    showScreen('auditScreen');
}

function renderAuditPlayers() {
    const listCoord = document.getElementById("auditPlayerList");
    listCoord.innerHTML = "";

    // currentGameState is likely globally available from your socket listeners
    if (!currentGameState || !currentGameState.players) return;

    Object.keys(currentGameState.players).forEach(name => {
        const p = currentGameState.players[name];
        const row = document.createElement("div");
        
        // Compact row styling
        row.style = "display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #333;";
        
        row.innerHTML = `
            <span style="font-weight: bold; flex: 1;">${name}</span>
            <span id="role-${name}" style="flex: 1; color: ${p.role === 'ALIEN' ? '#ff4d4d' : '#4dff88'};">${p.role}</span>
            <button onclick="toggleRole('${name}')" style="padding: 2px 10px; font-size: 11px; width: auto;">SWAP</button>
        `;
        listCoord.appendChild(row);
    });
}

function toggleRole(name) {
    const roleSpan = document.getElementById(`role-${name}`);
    // Update local data object
    if (currentGameState.players[name].role === "ALIEN") {
        currentGameState.players[name].role = "HUMAN";
        roleSpan.innerText = "HUMAN";
        roleSpan.style.color = "#4dff88";
    } else {
        currentGameState.players[name].role = "ALIEN";
        roleSpan.innerText = "ALIEN";
        roleSpan.style.color = "#ff4d4d";
    }
}

async function saveAuditChanges() {
    // Send the updated currentGameState to the server's /save-game endpoint
    try {
        const response = await fetch("/save-game", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentGameState)
        });
        
        if (response.ok) {
            alert("✅ Ship Records Updated on GitHub!");
        }
    } catch (err) {
        console.error("Audit save failed:", err);
        alert("❌ Failed to save changes.");
    }
}