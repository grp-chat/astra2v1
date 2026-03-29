// ============================================================
// GLOBAL STATE
// ============================================================
window.players = [];
window.playersData = [];
window.gameStarted = false;
window.totalRounds = 3;
window.totalAliens = 1;

// ============================================================
// LOAD GAME (AUTOMATIC DETECTION)
// ============================================================
async function loadGame() {
    try {
        const res = await fetch("/current-game");
        const data = await res.json();

        if (!data.success || !data.data) {
            console.log("Fresh start: No data found.");
            return;
        }

        const game = data.data;

        // Translate the new Object format back into a simple Name list
        let playerNames = [];
        if (game.players && !Array.isArray(game.players)) {
            playerNames = Object.keys(game.players);
        } else {
            playerNames = game.players || [];
        }

        if (playerNames.length === 0) return;

        // Sync Global Variables
        window.players.length = 0;
        window.players.push(...playerNames);

        window.playersData.length = 0;
        playerNames.forEach(name => {
            window.playersData.push({
                name: name,
                role: (game.players && game.players[name]) ? game.players[name].role : "HUMAN"
            });
        });

        window.gameStarted = true;
        renderPlayerList();
        updatePlayerCount();
        
        if (typeof refreshButtonStates === "function") refreshButtonStates();
        console.log("✅ Previous game data loaded into settings.");
    } catch (err) {
        console.error("Load error:", err);
    }
}
window.loadGame = loadGame;

// ============================================================
// PLAYER & ROLE MANAGEMENT
// ============================================================
function addMultiplePlayers() {
    const area = document.getElementById("playerInput");
    const names = area.value.trim().split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
    names.forEach(name => { if (!players.includes(name)) players.push(name); });
    area.value = "";
    renderPlayerList();
    updatePlayerCount();
}
window.addMultiplePlayers = addMultiplePlayers;

function deletePlayer(idx) {
    players.splice(idx, 1);
    renderPlayerList();
    updatePlayerCount();
}
window.deletePlayer = deletePlayer;

function renderPlayerList() {
    const box = document.getElementById("playerList");
    if (!box) return;
    box.innerHTML = "";
    players.forEach((name, i) => {
        const row = document.createElement("div");
        row.className = "player-row";
        row.innerHTML = `<span>${i + 1}. ${name}</span><span class="delete-player" onclick="deletePlayer(${i})">×</span>`;
        box.appendChild(row);
    });
}
window.renderPlayerList = renderPlayerList;

function updatePlayerCount() {
    const badge = document.getElementById("playerCount");
    if (badge) badge.textContent = `Players: ${players.length}`;
}
window.updatePlayerCount = updatePlayerCount;

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// ============================================================
// START GAME (INITIALIZES EVERYTHING)
// ============================================================
async function startGame() {
    if (players.length < 2) return alert("Add at least 2 players.");
    
    const rounds = parseInt(document.getElementById("roundCount").value, 10) || 3;
    const aliens = parseInt(document.getElementById("alienCount").value, 10) || 1;
    
    const indices = [...Array(players.length).keys()];
    shuffle(indices);
    const alienIndices = new Set(indices.slice(0, aliens));

    const gameState = {
        players: {}, 
        bars: { speed: 20, signal: 20, hide: 20, threat: 10 },
        turnData: { waiting: [...players], finished: [] },
        roomStatus: {},
        metadata: { totalRounds: rounds, totalAliens: aliens }
    };

    players.forEach((name, idx) => {
        gameState.players[name] = {
            role: alienIndices.has(idx) ? "ALIEN" : "HUMAN",
            loc: "CENTRAL HUB",
            status: "ALIVE",
            petrified: false
        };
    });

    try {
        await fetch("/save-game", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gameState)
        });
        alert("Game started! Ship online.");
        location.reload(); 
    } catch (err) {
        console.error("Save failed ❌", err);
    }
}
window.startGame = startGame;