require("dotenv").config();
const express = require("express");
const path = require("path");
const axios = require("axios");
const http = require("http");
const { Server } = require("socket.io");
const { saveToGitHub } = require("./githubSave");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

const { TASKS_MASTER } = require("./tasks");
const { getCleanData } = require("./gameReset");

// --- MISSION LOG INITIALIZATION ---
let liveTasks = [];
Object.keys(TASKS_MASTER).forEach(roomName => {
    TASKS_MASTER[roomName].forEach(task => {
        liveTasks.push({
            name: task.name,
            loc: roomName,
            type: task.type,
            complete: false,
            completedBy: ""
        });
    });
});

const SABOTAGE_CONFIG = {
    "speed": { color: "#00aaff", bar: "speed" },
    "signal": { color: "#00ff00", bar: "signal" },
    "hide": { color: "#aa00ff", bar: "hide" }
};

// --- WIN CONDITION CHECKER ---
function checkWinConditions(state) {
    if (!state || !state.bars) return;
    let outcomeFile = null;

    if (state.bars.speed >= 100) outcomeFile = "warp.html";
    else if (state.bars.signal >= 100) outcomeFile = "signal.html";
    else if (state.bars.hide >= 100) outcomeFile = "stealth.html";
    else if (state.bars.threat >= 100) outcomeFile = "alienWin.html";

    if (outcomeFile) {
        io.emit("TRIGGER_OUTCOME", outcomeFile);
    }
}

const shipMap = {
    "BRIDGE": ["NAVIGATION", "SCANNER"],
    "NAVIGATION": ["BRIDGE", "SCANNER", "CENTRAL HUB"],
    "SCANNER": ["BRIDGE", "NAVIGATION", "COMMS", "CENTRAL HUB"],
    "COMMS": ["SCANNER", "CENTRAL HUB"],
    "CENTRAL HUB": ["NAVIGATION", "SCANNER", "COMMS", "DATA CORE", "SECURITY", "ENGINE"],
    "DATA CORE": ["CENTRAL HUB", "SECURITY", "LIFE SUPPORT"],
    "SECURITY": ["CENTRAL HUB", "DATA CORE", "ENGINE", "LIFE SUPPORT", "POWER CORE"],
    "ENGINE": ["CENTRAL HUB", "SECURITY", "FUEL CONTROL"],
    "LIFE SUPPORT": ["DATA CORE", "SECURITY", "POWER CORE", "CARGO BAY"],
    "POWER CORE": ["SECURITY", "LIFE SUPPORT", "FUEL CONTROL", "CARGO BAY"],
    "FUEL CONTROL": ["ENGINE", "POWER CORE", "CARGO BAY"],
    "CARGO BAY": ["LIFE SUPPORT", "POWER CORE", "FUEL CONTROL", "MAINTENANCE"],
    "MAINTENANCE": ["CARGO BAY"]
};

let currentGameState = null;

async function loadFromGitHub() {
    try {
        const url = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${process.env.GITHUB_PATH}`;
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } });
        const content = JSON.parse(Buffer.from(res.data.content, "base64").toString("utf-8"));
        currentGameState = content;
        if (!currentGameState.tasks) currentGameState.tasks = liveTasks;
        console.log("✅ Game State Synced from GitHub");
    } catch (err) {
        console.log("⚠️ No active game found on GitHub.");
    }
}

io.on("connection", (socket) => {
    if (currentGameState) socket.emit("STATE_UPDATE", currentGameState);

    socket.on("SELECT_PLAYER", (playerName) => {
        if (!currentGameState || !currentGameState.players[playerName]) return;
        const pData = currentGameState.players[playerName];
        const myLoc = pData.loc.toUpperCase();
        const myRole = (pData.role || "HUMAN").toUpperCase();
        const isPetrified = pData.petrified === true;

        // ADD THIS LOGIC HERE:
        const alienTeam = Object.keys(currentGameState.players).filter(name => {
            return currentGameState.players[name].role.toUpperCase() === "ALIEN";
        });

        const roomMates = Object.keys(currentGameState.players).filter(name => {
            return currentGameState.players[name].loc.toUpperCase() === myLoc && name !== playerName;
        });

        let buttons = [];
        if (isPetrified) {
            buttons = ["SKIP"];
        } else {
            buttons.push("MOVE", "SKIP");
            const roomTasks = TASKS_MASTER[myLoc] || [];
            roomTasks.forEach(task => {
                const isActive = !!currentGameState.roomStatus[task.name];
                if (myRole === "ALIEN") {
                    if (isActive) {
                        buttons.push({ name: task.name, type: task.type, color: task.color, isSabotage: true });
                    }
                } else {
                    if (!isActive) {
                        buttons.push({ name: task.name, type: task.type, color: task.color, isSabotage: false });
                    }
                }
            });
        }

        while (buttons.length < 8) { buttons.push("BLANK"); }
        if (myRole === "ALIEN" && !isPetrified) {
            const bIndex = buttons.indexOf("BLANK");
            if (bIndex !== -1) buttons[bIndex] = "PETRIFY";
        }
        buttons = buttons.sort(() => Math.random() - 0.5);

        socket.emit("PLAYER_SCREEN_LOAD", {
            playerName, location: pData.loc, isPetrified, roomMates, buttons, adjacentRooms: shipMap[myLoc] || [],
            isAlien: myRole === "ALIEN", // Added this
            alienTeam: alienTeam        // Added this
        });
    });

    socket.on("SUBMIT_ACTION", async (data) => {
        const { playerName, actionType, taskName, taskType, targetRoom } = data;
        if (!currentGameState || !currentGameState.players[playerName]) return;

        const player = currentGameState.players[playerName];
        const myLoc = player.loc.toUpperCase();

        // --- CORE GAME ACTIONS (Unchanged) ---
        if (actionType === "MOVE" && targetRoom) {
            player.loc = targetRoom;
            io.emit("NEURAL_LOG", `${playerName.toUpperCase()} MOVED TO ${targetRoom}`);
        }
        else if (actionType === "SKIP") {
            player.petrified = false;
            io.emit("NEURAL_LOG", `${playerName.toUpperCase()} PASSED.`);
        }
        else if (actionType === "TASK" || actionType === "SABOTAGE") {
            const isSabotage = actionType === "SABOTAGE";
            const config = SABOTAGE_CONFIG[taskType];
            if (config) {
                const barName = config.bar;
                const change = isSabotage ? -10 : 10;
                if (currentGameState.bars[barName] !== undefined) {
                    currentGameState.bars[barName] = Math.max(0, Math.min(100, currentGameState.bars[barName] + change));
                }
            }
            const taskInLog = currentGameState.tasks.find(t => t.name === taskName);
            if (taskInLog) {
                taskInLog.complete = !isSabotage;
                taskInLog.completedBy = isSabotage ? "" : playerName;
            }
            if (isSabotage) {
                delete currentGameState.roomStatus[taskName];
                io.emit("NEURAL_LOG", `⚠ ALERT: ${taskName.toUpperCase()} COMPROMISED!`);
            } else {
                currentGameState.roomStatus[taskName] = true;
                io.emit("NEURAL_LOG", `${playerName.toUpperCase()} COMPLETED: ${taskName}`);
            }
            checkWinConditions(currentGameState);
        }
        else if (actionType === "PETRIFY") {
            const victimName = data.targetPlayer;
            if (victimName && currentGameState.players[victimName]) {
                const victim = currentGameState.players[victimName];
                if (victim.loc.toUpperCase() === myLoc) {
                    victim.petrified = true;
                    const witness = Object.keys(currentGameState.players).find(n =>
                        n !== playerName && n !== victimName &&
                        currentGameState.players[n].loc.toUpperCase() === myLoc &&
                        currentGameState.players[n].role.toUpperCase() === "HUMAN"
                    );
                    io.emit("NEURAL_LOG", witness
                        ? `⚠ EMERGENCY: ${playerName.toUpperCase()} ATTACKED ${victimName.toUpperCase()}!`
                        : `SYSTEM: AN UNKNOWN ACTION OCCURRED IN ${myLoc}.`);
                }
            }
        }

        // --- NEW TURN LOGIC: 12 ACTION POOL ---
        // 1. Add the player to the finished list (allowing duplicates for history)
        currentGameState.turnData.finished.push(playerName);

        // 2. Check if the cycle limit is hit
        if (currentGameState.turnData.finished.length >= 6) {
            currentGameState.bars.threat = Math.min(100, currentGameState.bars.threat + 10);
            checkWinConditions(currentGameState);

            // Clear history for the new round
            currentGameState.turnData.finished = [];
            
            io.emit("NEURAL_LOG", `--- 6 ACTIONS REACHED: THREAT LEVEL INCREASED ---`);


            io.emit("SAVE_STATUS", "SAVING");
            await saveToGitHub(currentGameState);
            io.emit("SAVE_STATUS", "SUCCESS");
        }

        io.emit("STATE_UPDATE", currentGameState);
    });

    // Add this inside the connection block
    socket.on("RESET_REQUEST", async (mode) => {
        console.log(`System: Executing ${mode} reset...`);

        // 1. Generate clean data
        currentGameState = getCleanData(currentGameState, mode, liveTasks);

        // 2. Save the cleaned data to GitHub
        await saveToGitHub(currentGameState);

        // 3. Tell everyone to update their screens
        io.emit("STATE_UPDATE", currentGameState);

        // 4. Force a reload for everyone to clear any old UI states
        io.emit("FORCE_RELOAD");
    });
});

app.post("/save-game", async (req, res) => {
    currentGameState = req.body;
    if (!currentGameState.tasks) currentGameState.tasks = liveTasks;
    await saveToGitHub(currentGameState);
    io.emit("STATE_UPDATE", currentGameState);
    res.json({ success: true });
});

// Add this near your other app.post/app.get routes in app.js
app.get("/current-game", (req, res) => {
    if (currentGameState) {
        res.json({ success: true, data: currentGameState });
    } else {
        res.json({ success: false, message: "No active game found" });
    }
});

server.listen(PORT, async () => {
    console.log(`Astra-2 Engine Live on ${PORT}`);
    await loadFromGitHub();
});