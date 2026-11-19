import {
  CATEGORIES,
  CATEGORIES_EN,
  CHOICE_LABELS_EN,
  ENCHANTMENT_INFO,
  ENCHANTMENT_INFO_EN,
  ITEMS,
  RECIPES,
  getCompletedTotal,
  getTaskTotal,
} from "./data.js";

const STORAGE_KEY = "enchanting-desk.checklist.v1";
const LANGUAGE_KEY = "enchanting-desk.language";
const grid = document.querySelector("#items-grid");
const searchInput = document.querySelector("#search-input");
const emptyState = document.querySelector("#empty-state");
const resetButton = document.querySelector("#reset-button");
const languageSelect = document.querySelector("#language-select");
const storageNotice = document.createElement("p");
document.querySelector(".progress-panel").after(storageNotice);
let state = {};
let language = "en";
let category = "all";
let query = "";

const UI_COPY = {
  en: {
    title: "Enchanting Desk — Minecraft checklist",
    metaDescription: "An interactive Minecraft enchantment checklist with exclusive choices and optimized anvil book orders.",
    editionMode: "SURVIVAL MODE",
    languageLabel: "Language",
    heroEyebrow: "YOUR LOADOUT, YOUR PLAN",
    heroTitle: "Build your<br /><span>best</span> gear.",
    heroDescription: "Every slot, every enchantment. Keep your perfect Minecraft loadout in sight.",
    heroLink: "Jump to checklist",
    footnoteChecklist: "GEAR CHECKLIST",
    footnoteGuide: "ENCHANTMENT GUIDE",
    progressLabel: "YOUR PROGRESS",
    progressCaption: "One step closer to your perfect gear.",
    checkedLabel: "checked",
    resetProgress: "Reset progress",
    collectionEyebrow: "YOUR COLLECTION",
    collectionTitle: "The checklist",
    searchLabel: "Search items or enchantments",
    searchPlaceholder: "Search items...",
    categoryAll: "All",
    categoryArmor: "Armor",
    categoryWeapons: "Weapons",
    categoryTools: "Tools",
    guideNote: "Book combinations and level costs are shown on the relevant items. Previous anvil work can increase actual costs.",
    sourceLink: "Minecraft Wiki: Best enchantments guide",
    emptyState: "No items found. Try another search.",
    footerNote: "Your next adventure awaits.",
    optional: "OPTIONAL",
    exclusive: "CHOOSE ONE",
    bookCombination: "BOOK COMBINATION",
    levelsFromGuide: "levels per guide",
    complete: "complete",
    progressAria: "Checklist progress",
    confirmReset: "Reset all checked enchantments?",
    storageReadError: "Your browser could not load saved progress",
    storageWriteError: "Progress will only be kept in this tab",
    netheriteUpgrade: "Upgrade to Netherite",
    netheriteUpgradeTooltip: "Mark this when you have upgraded the diamond item to Netherite.",
  },
  de: {
    title: "Enchanting Desk — Minecraft-Checkliste",
    metaDescription: "Interaktive Minecraft-Verzauberungs-Checkliste mit exklusiven Auswahlmöglichkeiten und optimalen Amboss-Buchreihenfolgen.",
    editionMode: "ÜBERLEBENS-MODUS",
    languageLabel: "Sprache",
    heroEyebrow: "DEIN LOADOUT, DEIN PLAN",
    heroTitle: "Mach dein<br /><span>bestes</span> Gear.",
    heroDescription: "Jeder Slot, jede Verzauberung. Behalte dein perfektes Minecraft-Loadout im Blick.",
    heroLink: "Zur Checkliste",
    footnoteChecklist: "GEAR-CHECKLISTE",
    footnoteGuide: "VERZAUBERUNGS-GUIDE",
    progressLabel: "DEIN FORTSCHRITT",
    progressCaption: "Ein Schritt näher an perfektem Gear.",
    checkedLabel: "abgehakt",
    resetProgress: "Fortschritt zurücksetzen",
    collectionEyebrow: "DEINE SAMMLUNG",
    collectionTitle: "Die Checkliste",
    searchLabel: "Items oder Verzauberungen suchen",
    searchPlaceholder: "Item suchen...",
    categoryAll: "Alle",
    categoryArmor: "Rüstung",
    categoryWeapons: "Waffen",
    categoryTools: "Werkzeuge",
    guideNote: "Buch-Kombinationen und ihre Levelkosten findest du direkt beim jeweiligen Item. Vorarbeit am Amboss kann die tatsächlichen Kosten erhöhen.",
    sourceLink: "Minecraft Wiki: Verzauberungs-Guide",
    emptyState: "Keine Items gefunden. Versuch einen anderen Suchbegriff.",
    footerNote: "Dein nächstes Abenteuer wartet.",
    optional: "OPTIONAL",
    exclusive: "EINE AUSWAHL",
    bookCombination: "BUCH-KOMBINATION",
    levelsFromGuide: "Level laut Guide",
    complete: "abgeschlossen",
    progressAria: "Checklisten-Fortschritt",
    confirmReset: "Alle abgehakten Verzauberungen zurücksetzen?",
    storageReadError: "Dein Browser konnte den gespeicherten Fortschritt nicht laden",
    storageWriteError: "Dein Fortschritt bleibt nur in diesem Tab erhalten",
    netheriteUpgrade: "Zu Netherit aufwerten",
    netheriteUpgradeTooltip: "Abhaken, sobald du das Diamant-Item zu Netherit aufgewertet hast.",
  },
};

const TASK_NOTES_EN = {
  "Nur Java Edition": "Java Edition only.",
  "Verbraucht beim Ausfallschritt viel Hunger.": "Consumes a lot of hunger when lunging.",
  "Schnellladen III gibt es nicht am Zaubertisch.": "Quick Charge III is not available from an enchanting table.",
  "Wirkt in Java Edition vor allem gegen aquatische Kreaturen; in Bedrock Edition breiter wirksam.": "Mainly affects aquatic mobs in Java Edition; has broader effect in Bedrock Edition.",
  "Nur Bedrock Edition": "Bedrock Edition only.",
};

function copy() {
  return UI_COPY[language];
}

storageNotice.className = "storage-notice";
storageNotice.setAttribute("role", "status");
storageNotice.hidden = true;

function showStorageNotice(message) {
  storageNotice.textContent = message;
  storageNotice.hidden = !message;
}

function readState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    state = saved ? JSON.parse(saved) : {};
    if (!state || typeof state !== "object" || Array.isArray(state)) state = {};
    if (savedLanguage === "de" || savedLanguage === "en") language = savedLanguage;
  } catch (error) {
    state = {};
    showStorageNotice(`${copy().storageReadError}: ${error.message}`);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    showStorageNotice("");
  } catch (error) {
    showStorageNotice(`${copy().storageWriteError}: ${error.message}`);
  }
}

function saveLanguage() {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
    showStorageNotice("");
  } catch (error) {
    showStorageNotice(`${copy().storageWriteError}: ${error.message}`);
  }
}

function translateStaticText() {
  const text = copy();
  document.documentElement.lang = language;
  document.title = text.title;
  document.querySelector('meta[name="description"]').content = text.metaDescription;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const translated = text[element.dataset.i18n];
    if (translated !== undefined) element.textContent = translated;
  });
  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    const translated = text[element.dataset.i18nHtml];
    if (translated !== undefined) element.innerHTML = translated;
  });
  searchInput.placeholder = text.searchPlaceholder;
  searchInput.setAttribute("aria-label", text.searchLabel);
  languageSelect.setAttribute("aria-label", text.languageLabel);
  document.querySelector(".progress-panel").setAttribute("aria-label", text.progressAria);
  document.querySelector(".progress-track").setAttribute("aria-label", text.progressAria);
  document.querySelector("#category-tabs").setAttribute("aria-label", `${text.collectionEyebrow}: ${text.categoryAll}, ${text.categoryArmor}, ${text.categoryWeapons}, ${text.categoryTools}`);
}

function selectLanguage(value) {
  language = value === "de" ? "de" : "en";
  languageSelect.value = language;
  translateStaticText();
  renderCards();
  saveLanguage();
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function itemState(item) {
  if (!state[item.id] || typeof state[item.id] !== "object") state[item.id] = { tasks: {}, choices: {} };
  if (!state[item.id].tasks || typeof state[item.id].tasks !== "object") state[item.id].tasks = {};
  if (!state[item.id].choices || typeof state[item.id].choices !== "object") state[item.id].choices = {};
  return state[item.id];
}

function itemSearchText(item) {
  return [
    item.name,
    item.english,
    ...item.tasks.flatMap((task) => [task.name, task.english]),
    ...(item.choices ?? []).flatMap((choice) => [choice.label, ...choice.options.flatMap((option) => [option.name, option.english])]),
    ...(item.netheriteUpgrade ? ["diamond", "netherite", "diamant", "netherit"] : []),
  ].join(" ").toLocaleLowerCase("de");
}

function renderTask(item, task) {
  const checked = Boolean(itemState(item).tasks[task.id]);
  const key = `${item.id}-${task.id}`;
  const taskName = language === "de" ? task.name : task.english;
  const note = language === "de" ? task.note : task.noteEn ?? TASK_NOTES_EN[task.note] ?? task.note;
  const description = [
    language === "de" ? ENCHANTMENT_INFO[task.english] : ENCHANTMENT_INFO_EN[task.english],
    note,
  ].filter(Boolean).join(" ");
  return `
    <label class="enchantment-row${checked ? " is-checked" : ""}" for="${key}" data-tooltip="${escapeHTML(description)}" title="${escapeHTML(description)}">
      <input id="${key}" type="checkbox" data-item="${item.id}" data-task="${task.id}" ${checked ? "checked" : ""} />
      <span class="custom-check" aria-hidden="true"></span>
      <span class="enchantment-copy">
        <span class="enchantment-name">${escapeHTML(taskName)}${task.optional ? `<span class="optional-tag">${copy().optional}</span>` : ""}</span>
        ${language === "de" && (task.english || note) ? `<span class="enchantment-meta">${escapeHTML(task.english)}${note ? ` <span class="item-note">${escapeHTML(note)}</span>` : ""}</span>` : note ? `<span class="enchantment-meta"><span class="item-note">${escapeHTML(note)}</span></span>` : ""}
      </span>
    </label>`;
}

function renderNetheriteUpgrade(item) {
  if (!item.netheriteUpgrade) return "";
  const checked = Boolean(itemState(item).tasks["netherite-upgrade"]);
  const key = `${item.id}-netherite-upgrade`;
  const description = copy().netheriteUpgradeTooltip;
  return `
    <label class="enchantment-row netherite-upgrade" for="${key}" data-tooltip="${escapeHTML(description)}" title="${escapeHTML(description)}">
      <input id="${key}" type="checkbox" data-item="${item.id}" data-task="netherite-upgrade" ${checked ? "checked" : ""} />
      <span class="custom-check" aria-hidden="true"></span>
      <span class="enchantment-copy"><span class="enchantment-name">${copy().netheriteUpgrade}</span></span>
    </label>`;
}

function renderChoice(item, choice) {
  const selected = itemState(item).choices[choice.id] ?? "";
  const name = `${item.id}-${choice.id}`;
  const label = language === "de" ? choice.label : CHOICE_LABELS_EN[choice.label] ?? choice.label;
  return `
    <fieldset class="choice-group">
      <legend>${escapeHTML(label)} <span class="exclusive-label">${copy().exclusive}</span></legend>
      <div class="choice-options">
        ${choice.options.map((option) => {
          const checked = selected === option.id;
          const id = `${name}-${option.id}`;
          const optionName = language === "de" ? option.name : option.english;
          const description = language === "de" ? ENCHANTMENT_INFO[option.english] : ENCHANTMENT_INFO_EN[option.english];
          return `
            <label class="choice-option${checked ? " is-selected" : ""}" for="${id}" data-tooltip="${escapeHTML(description)}" title="${escapeHTML(description)}">
              <input id="${id}" type="radio" name="${name}" value="${option.id}" data-item="${item.id}" data-choice="${choice.id}" ${checked ? "checked" : ""} />
              <span class="radio-mark" aria-hidden="true"></span>
              <span><span class="choice-name">${escapeHTML(optionName)}</span>${language === "de" ? `<span class="choice-meta">${escapeHTML(option.english)}</span>` : ""}</span>
            </label>`;
        }).join("")}
      </div>
    </fieldset>`;
}

function renderRecipe(recipe) {
    if (!recipe) return "";
    const itemName = language === "de" ? recipe.item : ITEMS.find((item) => item.id === recipe.itemId).english;
    return `
      <section class="item-recipe" aria-label="${language === "de" ? "Günstigste Buchreihenfolge für" : "Lowest-cost book order for"} ${escapeHTML(itemName)}">
        <div class="item-recipe-heading">
          <span class="recipe-kicker">${copy().bookCombination}</span>
          <span class="recipe-total"><strong>${recipe.levels}</strong> ${copy().levelsFromGuide}</span>
        </div>
        <ol>${recipe.sequence.map((step) => `<li><span>${escapeHTML(language === "de" ? step.description : step.descriptionEn)}</span><strong>${step.cost} ${language === "de" ? "Level" : "levels"}</strong></li>`).join("")}</ol>
        ${recipe.note ? `<p class="recipe-note">${escapeHTML(language === "de" ? recipe.note : recipe.noteEn)}</p>` : ""}
      </section>`;
}

function renderItem(item) {
  const tasks = item.tasks.map((task) => renderTask(item, task)).join("");
  const upgrade = renderNetheriteUpgrade(item);
  const choices = (item.choices ?? []).map((choice) => renderChoice(item, choice)).join("");
    const recipe = RECIPES.find((entry) => entry.itemId === item.id);
  const taskCount = item.tasks.length + (item.choices?.length ?? 0) + Number(Boolean(item.netheriteUpgrade));
  const done = getCompletedTotal(state, [item]);
  const progress = taskCount ? Math.round((done / taskCount) * 100) : 0;
  const categoryName = (language === "de" ? CATEGORIES : CATEGORIES_EN)[item.category];
  const itemName = language === "de" ? item.name : item.english;
  return `
    <article class="item-card${progress > 0 ? " has-enchantment" : ""}" data-item-card="${item.id}">
      <div class="item-card-top">
        <div class="item-art" data-glyph="${escapeHTML(item.glyph)}">
          <span class="item-fallback" aria-hidden="true">${escapeHTML(item.glyph)}</span>
          <img src="https://minecraft.wiki/Special:FilePath/${encodeURIComponent(item.image)}" alt="${escapeHTML(item.name)} in Minecraft" loading="lazy" />
          <span class="item-glint" aria-hidden="true"></span>
        </div>
        <div class="item-title">
          <span class="item-category">${escapeHTML(categoryName)}</span>
          <h3>${escapeHTML(itemName)}</h3>
          ${language === "de" ? `<span class="item-english">${escapeHTML(item.english)}</span>` : ""}
        </div>
        <span class="item-progress">${done}<span>/${taskCount}</span></span>
      </div>
      <div class="item-progress-track"><span style="width:${progress}%"></span></div>
      <div class="enchantment-list">${tasks}${upgrade}</div>
      ${choices ? `<div class="choice-list">${choices}</div>` : ""}
      ${renderRecipe(recipe)}
    </article>`;
}

function renderCards() {
  const filtered = ITEMS.filter((item) => (category === "all" || item.category === category) && itemSearchText(item).includes(query));
  grid.innerHTML = filtered.map(renderItem).join("");
  emptyState.hidden = filtered.length !== 0;
  grid.hidden = filtered.length === 0;
  grid.querySelectorAll(".item-art img").forEach((image) => {
    image.addEventListener("error", () => {
      image.hidden = true;
      image.closest(".item-art").classList.add("image-unavailable");
    }, { once: true });
  });
  updateProgress();
  updateCategoryCounts();
}

function updateProgress() {
  const total = getTaskTotal();
  const completed = getCompletedTotal(state);
  const percent = total ? Math.round((completed / total) * 100) : 0;
  document.querySelector("#progress-count").textContent = `${completed} / ${total}`;
  document.querySelector("#progress-percent").textContent = language === "de" ? `${percent} % abgeschlossen` : `${percent}% ${copy().complete}`;
  document.querySelector("#progress-fill").style.width = `${percent}%`;
  document.querySelector(".progress-track").setAttribute("aria-valuenow", String(percent));
  document.querySelector(".progress-track").setAttribute("aria-valuetext", document.querySelector("#progress-percent").textContent);
}

function updateCategoryCounts() {
  for (const key of ["all", ...Object.keys(CATEGORIES)]) {
    const count = key === "all" ? ITEMS.length : ITEMS.filter((item) => item.category === key).length;
    document.querySelector(`[data-count="${key}"]`).textContent = String(count);
  }
}

function onGridChange(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  const saved = itemState(ITEMS.find((item) => item.id === input.dataset.item));
  if (input.type === "checkbox") {
    saved.tasks[input.dataset.task] = input.checked;
  } else if (input.type === "radio") {
    saved.choices[input.dataset.choice] = input.value;
  } else {
    return;
  }
  saveState();
  renderCards();
}

document.querySelector("#category-tabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  category = button.dataset.category;
  document.querySelectorAll(".category-tab").forEach((tab) => {
    const active = tab === button;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", String(active));
  });
  renderCards();
});

searchInput.addEventListener("input", () => {
  query = searchInput.value.trim().toLocaleLowerCase("de");
  renderCards();
});

languageSelect.addEventListener("change", () => {
  selectLanguage(languageSelect.value);
});

grid.addEventListener("change", onGridChange);

resetButton.addEventListener("click", () => {
  if (!window.confirm(copy().confirmReset)) return;
  state = {};
  saveState();
  renderCards();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
});

readState();
languageSelect.value = language;
translateStaticText();
renderCards();
