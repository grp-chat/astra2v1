// gameReset.js

function getCleanData(currentData, mode, liveTasks) {
    // 1. Base Reset (Bars, Tasks, and Turns)
    const resetData = {
        ...currentData,
        bars: { speed: 0, signal: 0, hide: 0, threat: 0 },
        turnData: {
            waiting: Object.keys(currentData.players),
            finished: []
        },
        roomStatus: {},
        tasks: liveTasks.map(t => ({ ...t, complete: false, completedBy: "" }))
    };

    // 2. Handle Players based on mode
    if (mode === "HARD") {
        resetData.players = {};
        resetData.turnData.waiting = [];
    } else {
        // SOFT RESET: Keep players but reset their status/location
        Object.keys(resetData.players).forEach(name => {
            resetData.players[name].loc = "CENTRAL HUB";
            resetData.players[name].status = "ALIVE";
            resetData.players[name].petrified = false;
        });
    }

    return resetData;
}

module.exports = { getCleanData };