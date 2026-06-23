const stances = ["Regular", "Fakie", "Switch", "Nollie"];
const diffLabel = ["", "Easy", "Medium", "Hard", "Very Hard"];

const sliderMin = document.getElementById("slider-min");
const sliderMax = document.getElementById("slider-max");
const rangeDisplay = document.getElementById("range-display");
const rangeFill = document.getElementById("range-fill");

const stanceToggles = {
  Regular: document.getElementById("toggle-regular"),
  Fakie:   document.getElementById("toggle-fakie"),
  Switch:  document.getElementById("toggle-switch"),
  Nollie:  document.getElementById("toggle-nollie"),
};

function getRange() {
  const lo = Math.min(parseInt(sliderMin.value), parseInt(sliderMax.value));
  const hi = Math.max(parseInt(sliderMin.value), parseInt(sliderMax.value));
  return { lo, hi };
}

function getEnabledStances() {
  return stances.filter(s => stanceToggles[s].checked);
}

function updateRange() {
  const { lo, hi } = getRange();
  rangeDisplay.textContent = `${diffLabel[lo]} – ${diffLabel[hi]}`;
  const pctLo = ((lo - 1) / 3) * 100;
  const pctHi = ((hi - 1) / 3) * 100;
  rangeFill.style.left = pctLo + "%";
  rangeFill.style.width = (pctHi - pctLo) + "%";
  updateTable();
}

function updateTable() {
  const { lo, hi } = getRange();
  const enabledIdxs = getEnabledStances().map(s => stances.indexOf(s));
  document.querySelectorAll("#diff-table tr").forEach((tr, i) => {
    const t = tricks[i];
    const inRange = enabledIdxs.some(si => t.diff[si] >= lo && t.diff[si] <= hi);
    tr.classList.toggle("out-of-range", !inRange);
  });
}

sliderMin.addEventListener("input", updateRange);
sliderMax.addEventListener("input", updateRange);
Object.values(stanceToggles).forEach(cb => cb.addEventListener("change", updateTable));

function generate() {
  const { lo, hi } = getRange();
  const enabledStances = getEnabledStances();
  if (enabledStances.length === 0) {
    document.getElementById("result").textContent = "No stances selected!";
    return;
  }
  const pool = [];
  tricks.forEach(t => {
    enabledStances.forEach(stance => {
      const si = stances.indexOf(stance);
      const d = t.diff[si];
      if (d >= lo && d <= hi) pool.push({ trick: t, stance, diff: d });
    });
  });
  if (pool.length === 0) {
    document.getElementById("result").textContent = "No tricks in that range!";
    return;
  }
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const label = pick.stance === "Regular" ? pick.trick.name : `${pick.stance} ${pick.trick.name}`;
  const stars = "★".repeat(pick.diff) + "☆".repeat(4 - pick.diff);
  document.getElementById("result").textContent = `${label}  ${stars}`;
}

// Build difficulty table
const tbody = document.getElementById("diff-table");
tricks.forEach(t => {
  const tr = document.createElement("tr");
  tr.innerHTML = `<td>${t.name}</td>` +
    t.diff.map(d => `<td class="diff-${d}">${diffLabel[d]}</td>`).join("");
  tbody.appendChild(tr);
});

updateRange();
