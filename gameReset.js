// gameReset.js

function getCleanData(currentData, mode, liveTasks) {
    // 1. Deep copy to avoid mutating the original state
    const resetData = JSON.parse(JSON.stringify(currentData));

    // 2. Reset Bars, Room Status, and Task Log
    resetData.bars = { speed: 0, signal: 0, hide: 0, threat: 0 };
    resetData.roomStatus = {};
    resetData.tasks = liveTasks.map(t => ({ ...t, complete: false, completedBy: "" }));

    // 3. Reset Turn Logic for the 13-action pool
    resetData.turnData = {
        finished: [] 
    };

    // 4. Handle Players
    if (mode === "HARD") {
        resetData.players = {};
    } else {
        const playerNames = Object.keys(resetData.players);
        
        // --- DYNAMIC ALIEN LOGIC ---
        // Look at metadata first. If it's missing, default to 1 alien.
        let targetAlienCount = 1;
        if (resetData.metadata && resetData.metadata.totalAliens) {
            targetAlienCount = parseInt(resetData.metadata.totalAliens);
        }

        // Safety check: Don't try to make more aliens than there are players
        if (targetAlienCount > playerNames.length) {
            targetAlienCount = Math.max(1, Math.floor(playerNames.length / 2));
        }
        
        // Shuffle the names array using Fisher-Yates or a simple sort
        const shuffled = [...playerNames].sort(() => 0.5 - Math.random());
        
        // Slice the array to get exactly the number of aliens specified in your settings
        const alienTeam = shuffled.slice(0, targetAlienCount);

        playerNames.forEach((name) => {
            resetData.players[name] = {
                loc: "CENTRAL HUB",
                status: "ALIVE",
                petrified: false,
                // Assign role based on whether they are in the sliced alienTeam array
                role: alienTeam.includes(name) ? "ALIEN" : "HUMAN"
            };
        });
    }

    return resetData;
}

module.exports = { getCleanData };