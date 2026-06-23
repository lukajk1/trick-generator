const WORD = "SKATE";
const stances = ["Regular", "Fakie", "Switch", "Nollie"];

let state = {};

function getBotDiff() {
  return parseInt(document.querySelector('input[name="bot-diff"]:checked').value);
}

function pickTrick(maxDiff) {
  const pool = [];
  tricks.forEach(t => {
    stances.forEach((stance, si) => {
      if (t.diff[si] <= maxDiff) pool.push({ trick: t, stance });
    });
  });
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick.stance === "Regular" ? pick.trick.name : `${pick.stance} ${pick.trick.name}`;
}

// Bot land probability: scales with diff relative to bot's max
function botLandChance(trickName) {
  // Find the trick's difficulty for a rough stance
  const maxDiff = state.botDiff;
  let trickDiff = 1;
  for (const t of tricks) {
    for (let si = 0; si < stances.length; si++) {
      const label = stances[si] === "Regular" ? t.name : `${stances[si]} ${t.name}`;
      if (label === trickName) { trickDiff = t.diff[si]; break; }
    }
  }
  // Easy trick vs easy bot = high chance; hard trick = lower
  const ratio = trickDiff / maxDiff;
  return Math.max(0.25, 1.1 - ratio * 0.7);
}

function lettersSoFar(count) {
  return WORD.slice(0, count) + "_".repeat(WORD.length - count);
}

function updateScoreboard() {
  document.getElementById("player-letters").textContent = lettersSoFar(state.playerLetters);
  document.getElementById("bot-letters").textContent = lettersSoFar(state.botLetters);
  document.getElementById("player-card").classList.toggle("active", state.offense === "player");
  document.getElementById("bot-card").classList.toggle("active", state.offense === "bot");
}

function setStatus(msg) { document.getElementById("status").textContent = msg; }
function setTrick(msg) { document.getElementById("trick-display").textContent = msg; }

function showActions(show) { document.getElementById("actions").style.display = show ? "" : "none"; }
function showNextBtn(show) { document.getElementById("next-area").style.display = show ? "" : "none"; }

function checkGameOver() {
  if (state.playerLetters >= WORD.length) {
    endGame("You spelled SKATE. Bot wins!");
    return true;
  }
  if (state.botLetters >= WORD.length) {
    endGame("Bot spelled SKATE. You win!");
    return true;
  }
  return false;
}

function endGame(msg) {
  document.getElementById("game").style.display = "none";
  document.getElementById("gameover").style.display = "";
  document.getElementById("gameover-msg").textContent = msg;
}

function startGame() {
  state = {
    botDiff: getBotDiff(),
    playerLetters: 0,
    botLetters: 0,
    offense: Math.random() < 0.5 ? "player" : "bot",
    pendingTrick: null,
    phase: "set",  // "set" = offense picks trick, "respond" = defense must match
  };
  document.getElementById("setup").style.display = "none";
  document.getElementById("game").style.display = "";
  document.getElementById("gameover").style.display = "none";
  updateScoreboard();
  beginTurn();
}

function beginTurn() {
  state.phase = "set";
  state.pendingTrick = null;
  showNextBtn(false);

  if (state.offense === "player") {
    setStatus("Your turn — attempt a trick.");
    setTrick(pickTrick(4));
    showActions(true);
  } else {
    showActions(false);
    botTakeTurn();
  }
  updateScoreboard();
}

// Player is on offense and either lands or bails their trick
function playerAction(landed) {
  showActions(false);
  if (state.phase === "set") {
    // Player is setting
    if (landed) {
      state.pendingTrick = document.getElementById("trick-display").textContent;
      state.phase = "respond";
      showActions(false);
      botTakeTurn();
    } else {
      setStatus("You bailed. Bot's turn to set.");
      state.offense = "bot";
      showNextBtn(true);
    }
  } else {
    // Player is responding to bot's trick
    if (landed) {
      setStatus("You matched it! Neither gets a letter. Your turn to set.");
      state.offense = "player";
      showNextBtn(true);
    } else {
      state.playerLetters++;
      updateScoreboard();
      if (!checkGameOver()) {
        setStatus(`You missed it! You get a letter. Bot sets again.`);
        state.offense = "bot";
        showNextBtn(true);
      }
    }
  }
}

function botTakeTurn() {
  if (state.phase === "set") {
    // Bot sets a trick
    const trick = pickTrick(state.botDiff);
    const lands = Math.random() < botLandChance(trick);
    setTrick(trick);

    if (lands) {
      state.pendingTrick = trick;
      setStatus(`Bot landed it! You have to match: ${trick}`);
      state.phase = "respond";
      showActions(true);
    } else {
      setStatus(`Bot bailed on ${trick}. Your turn to set.`);
      state.offense = "player";
      showNextBtn(true);
    }
  } else {
    // Bot responds to player's trick
    const lands = Math.random() < botLandChance(state.pendingTrick);
    if (lands) {
      setStatus("Bot matched it! Neither gets a letter. Bot sets next.");
      state.offense = "bot";
      showNextBtn(true);
    } else {
      state.botLetters++;
      updateScoreboard();
      if (!checkGameOver()) {
        setStatus("Bot missed it! Bot gets a letter. You set next.");
        state.offense = "player";
        showNextBtn(true);
      }
    }
  }
}

function nextTurn() {
  beginTurn();
}

function resetGame() {
  document.getElementById("setup").style.display = "";
  document.getElementById("game").style.display = "none";
  document.getElementById("gameover").style.display = "none";
}
