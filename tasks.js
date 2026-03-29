// tasks.js
const TASKS_MASTER = {
    "ENGINE": [
        { name: "Repair Engine Core", type: "speed", color: "var(--color-speed)" },
        { name: "Align Reactor Output", type: "speed", color: "var(--color-speed)" },
        { name: "Overhaul Thruster System", type: "speed", color: "var(--color-speed)" }
    ],
    "FUEL CONTROL": [
        { name: "Refuel Main Tanks", type: "speed", color: "var(--color-speed)" },
        { name: "Stabilize Fuel Flow", type: "speed", color: "var(--color-speed)" }
    ],
    "POWER CORE": [
        { name: "Stabilize Power Output", type: "speed", color: "var(--color-speed)" },
        { name: "Reroute Energy Distribution", type: "speed", color: "var(--color-speed)" },
        { name: "Stabilize Signal Power", type: "signal", color: "var(--color-signal)" },
        { name: "Minimize Power Signature", type: "hide", color: "var(--color-stealth)" }
    ],
    "MAINTENANCE": [
        { name: "Repair Structural Damage", type: "speed", color: "var(--color-speed)" },
        { name: "Reinforce Mechanical Systems", type: "speed", color: "var(--color-speed)" },
        { name: "Reinforce Hull Integrity", type: "hide", color: "var(--color-stealth)" },
        { name: "Silence Mechanical Systems", type: "hide", color: "var(--color-stealth)" }
    ],
    "CENTRAL HUB": [
        { name: "Synchronize Ship Systems", type: "speed", color: "var(--color-speed)" },
        { name: "Authorize Command Protocols", type: "speed", color: "var(--color-speed)" },
        { name: "Synchronize Comm Systems", type: "signal", color: "var(--color-signal)" },
        { name: "Initiate Emergency Broadcast", type: "signal", color: "var(--color-signal)" },
        { name: "Sync Stealth Systems", type: "hide", color: "var(--color-stealth)" },
        { name: "Initiate Stealth Protocol", type: "hide", color: "var(--color-stealth)" }
    ],
    "LIFE SUPPORT": [
        { name: "Stabilize Crew Systems", type: "speed", color: "var(--color-speed)" },
        { name: "Stabilize Internal Systems", type: "hide", color: "var(--color-stealth)" },
        { name: "Reduce System Emissions", type: "hide", color: "var(--color-stealth)" }
    ],
    "COMMS": [
        { name: "Repair Comm Array", type: "signal", color: "var(--color-signal)" },
        { name: "Amplify Signal Trans", type: "signal", color: "var(--color-signal)" },
        { name: "Boost Signal Frequency", type: "signal", color: "var(--color-signal)" }
    ],
    "DATA CORE": [
        { name: "Restore Data Systems", type: "signal", color: "var(--color-signal)" },
        { name: "Decrypt Signal Protocols", type: "signal", color: "var(--color-signal)" }
    ],
    "NAVIGATION": [
        { name: "Recalculate Flight Path", type: "signal", color: "var(--color-signal)" },
        { name: "Update Nav Coordinates", type: "signal", color: "var(--color-signal)" },
        { name: "Plot Escape Route", type: "hide", color: "var(--color-stealth)" },
        { name: "Recalculate Trajectory", type: "hide", color: "var(--color-stealth)" }
    ],
    "SCANNER": [
        { name: "Scan Signal Range", type: "signal", color: "var(--color-signal)" },
        { name: "Lock Transmission Target", type: "signal", color: "var(--color-signal)" },
        { name: "Scan Surrounding Space", type: "hide", color: "var(--color-stealth)" },
        { name: "Identify Safe Zones", type: "hide", color: "var(--color-stealth)" },
        { name: "Detect Alien Presence", type: "hide", color: "var(--color-stealth)" }
    ]
};

module.exports = { TASKS_MASTER };