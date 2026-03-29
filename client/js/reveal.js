/**
 * REVEAL.JS - Isolated Slide Show Module
 * Handles 1-by-1 identity reveal with Snap-to-Wide bluffing
 */

let currentRevealIndex = 0;
let isIdentityVisible = false;

// Standard UI dimensions from your CSS
const STD_WIDTH = "100%";
const STD_PADDING = "14px";
const STD_FONT = "16px";

function startReveal() {
    if (!window.playersData || window.playersData.length === 0) {
        alert("ACCESS DENIED: No crew manifest found. Start the game first.");
        return;
    }

    currentRevealIndex = 0;
    showScreen("identityReveal");
    renderReveal(currentRevealIndex);
}

function renderReveal(i) {
    const total = window.playersData.length;
    const nameEl = document.getElementById("revealName");
    const roleEl = document.getElementById("revealRole");
    const headerEl = document.getElementById("revealHeader");
    const showBtn = document.getElementById("showIdentityBtn");
    const nextBtn = document.getElementById("nextRevealBtn");

    isIdentityVisible = false;

    // --- TEXT STYLES ---
    nameEl.style.fontSize = "24px";
    roleEl.style.fontSize = "18px";
    roleEl.style.marginTop = "10px";
    roleEl.style.whiteSpace = "pre-line";

    // End of Slideshow State
    if (i >= total) {
        headerEl.textContent = "BRIEFING COMPLETE";
        nameEl.textContent = "All Personnel Informed";
        roleEl.style.visibility = "hidden";

        showBtn.style.display = "none";
        nextBtn.disabled = false;
        nextBtn.style.width = STD_WIDTH;
        nextBtn.textContent = "Return to Bridge";
        return;
    }

    const p = window.playersData[i];
    headerEl.textContent = `Personnel ${i + 1} of ${total}`;
    nameEl.textContent = p.name;

    // --- ROLE & BLUFFING LOGIC ---
    if (p.role === "ALIEN") {
        const allAliens = window.playersData
            .filter(player => player.role === "ALIEN")
            .map(player => player.name)
            .join(", ");

        roleEl.innerHTML = `
        <span style="color: white;">${allAliens}</span><br>
        <span style="color: #ff4d4d; font-weight: bold;">ALIEN</span>
    `;

        // SHRUNK STATE (Stealth mode)
        showBtn.style.padding = "5px 10px";
        showBtn.style.fontSize = "11px";
        showBtn.style.width = "110px";
        showBtn.textContent = "click quick!";
    } else {
        roleEl.textContent = "HUMAN";
        roleEl.style.color = "#00eaff";

        // Start WIDE for Human (Standard CSS)
        showBtn.style.padding = STD_PADDING;
        showBtn.style.fontSize = STD_FONT;
        showBtn.style.width = STD_WIDTH;
        showBtn.textContent = "Show Identity";
    }

    roleEl.style.visibility = "hidden";
    showBtn.style.display = "inline-block";
    showBtn.disabled = false;

    nextBtn.style.width = STD_WIDTH;
    nextBtn.disabled = true;
    nextBtn.textContent = (i === total - 1) ? "Finalize" : "Next Personnel";
}

function showIdentity() {
    const roleEl = document.getElementById("revealRole");
    const showBtn = document.getElementById("showIdentityBtn");
    const nextBtn = document.getElementById("nextRevealBtn");
    const p = window.playersData[currentRevealIndex];

    if (!roleEl) return;

    if (p.role === "ALIEN") {
        // --- ALIEN STEP-BY-STEP BLUFF ---

        if (showBtn.textContent === "click quick!") {
            // STEP 1: Reveal names + SNAP TO 100% WIDTH
            roleEl.style.visibility = "visible";
            isIdentityVisible = true;
            nextBtn.disabled = false;

            showBtn.style.padding = STD_PADDING;
            showBtn.style.fontSize = STD_FONT;
            showBtn.style.width = STD_WIDTH;
            showBtn.textContent = "Change Text";

        } else if (showBtn.textContent === "Change Text") {
            // STEP 2: Change button name only (The "Bluff")
            showBtn.textContent = "Hide Identity";

        } else {
            // STEP 3: Normal Toggle behavior once restored
            const hidden = roleEl.style.visibility === "hidden";
            roleEl.style.visibility = hidden ? "visible" : "hidden";
            showBtn.textContent = hidden ? "hide identity" : "Show Identity";
        }
    } else {
        // --- HUMAN NORMAL LOGIC ---
        isIdentityVisible = !isIdentityVisible;
        if (isIdentityVisible) {
            roleEl.style.visibility = "visible";
            showBtn.textContent = "Hide Identity";
            nextBtn.disabled = false;
        } else {
            roleEl.style.visibility = "hidden";
            showBtn.textContent = "Show Identity";
        }
    }
}

function nextReveal() {
    currentRevealIndex++;
    if (currentRevealIndex > window.playersData.length) {
        endReveal();
    } else {
        renderReveal(currentRevealIndex);
    }
}

function endReveal() {
    showScreen("mainMenu");
}

window.startReveal = startReveal;
window.showIdentity = showIdentity;
window.nextReveal = nextReveal;
window.endReveal = endReveal;