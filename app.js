import {
  CATEGORIES,
  CATEGORIES_EN,
  CHOICE_LABELS_EN,
  ENCHANTMENT_INFO,
  ENCHANTMENT_INFO_EN,
  COLLECTIBLES,
  ITEMS,
  MUSIC_DISCS,
  RECIPES,
  SMITHING_TEMPLATES,
  getCompletedTotal,
  getTaskTotal,
  resetItemState,
} from "./data.js";

const STORAGE_KEY = "enchanting-desk.checklist.v1";
const LANGUAGE_KEY = "enchanting-desk.language";
const grid = document.querySelector("#items-grid");
const searchInput = document.querySelector("#search-input");
const emptyState = document.querySelector("#empty-state");
const collectibleGrid = document.querySelector("#collectibles-grid");
const collectibleSearchInput = document.querySelector("#collectibles-search-input");
const collectibleEmptyState = document.querySelector("#collectibles-empty-state");
const resetButtons = document.querySelectorAll(".reset-button");
const languageSelect = document.querySelector("#language-select");
const storageNotice = document.createElement("p");
document.querySelector(".progress-panel").after(storageNotice);
let state = {};
let language = "en";
let category = "all";
let query = "";
let collectibleType = "all";
let collectibleQuery = "";
let currentPage = "enchantments";

const UI_COPY = {
  en: {
    title: "Enchanting Desk — Minecraft checklist",
    metaDescription: "An interactive Minecraft enchantment checklist with exclusive choices and optimized anvil book orders.",
    editionMode: "SURVIVAL MODE",
    languageLabel: "Language",
    navigationLabel: "Main navigation",
    navEnchantments: "Enchantments",
    navCollectibles: "Collectibles",
    heroEyebrow: "YOUR LOADOUT, YOUR PLAN",
    heroTitle: "Build your<br /><span>best</span> gear.",
    heroDescription: "Every slot, every enchantment. Keep your perfect Minecraft loadout in sight.",
    heroLink: "Jump to checklist",
    footnoteChecklist: "GEAR CHECKLIST",
    footnoteGuide: "ENCHANTMENT GUIDE",
    progressLabel: "PAGE PROGRESS",
    progressCaption: "Track your progress in this checklist.",
    checkedLabel: "checked",
    resetProgress: "Reset progress",
    collectionEyebrow: "YOUR COLLECTION",
    collectionTitle: "Enchantments",
    searchLabel: "Search items or enchantments",
    searchPlaceholder: "Search items...",
    categoryAll: "All",
    categoryArmor: "Armor",
    categoryWeapons: "Weapons",
    categoryTools: "Tools",
    categoryCollectibles: "Collectibles",
    collectiblesEyebrow: "EXPLORE AND COLLECT",
    collectiblesTitle: "Smithing templates & music discs",
    collectiblesDescription: "Track every current template and disc, with its in-game find location.",
    collectiblesSearchLabel: "Search collectibles or find locations",
    collectiblesSearchPlaceholder: "Search templates, discs, or locations...",
    collectionAll: "All",
    collectionTemplates: "Smithing templates",
    collectionMusic: "Music discs",
    collectiblesEmptyState: "No collectibles found. Try another search.",
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
    confirmReset: "Reset all checklist progress?",
    confirmResetItem: "Reset all progress for {item}?",
    resetItem: "Reset",
    resetItemLabel: "Reset {item} progress",
    foundAt: "FOUND AT",
    locationSource: "Minecraft Wiki",
    glossaryTitle: "Glossary",
    glossaryEnchantmentTerm: "Enchantment",
    glossaryEnchantmentDefinition: "A special effect applied to gear, usually with an enchanting table or an enchanted book and an anvil.",
    glossaryExclusiveTerm: "Exclusive enchantments",
    glossaryExclusiveDefinition: "Some enchantments cannot be used together on one item. The checklist groups those alternatives so you can select only one.",
    glossaryAnvilTerm: "Anvil cost",
    glossaryAnvilDefinition: "The experience levels required to combine or apply items. Prior anvil work can raise the cost.",
    glossaryTemplateTerm: "Smithing template",
    glossaryTemplateDefinition: "A structure-found item used at a smithing table to upgrade diamond gear or add an armor trim.",
    glossaryArmorTrimTerm: "Armor trim",
    glossaryArmorTrimDefinition: "A cosmetic pattern added to armor with a smithing template; its material changes the color, not the armor stats.",
    glossaryMusicDiscTerm: "Music disc",
    glossaryMusicDiscDefinition: "A collectible record played in a jukebox.",
    madeBy: "Made by",
    madeByName: "minCoding404",
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
    navigationLabel: "Hauptnavigation",
    navEnchantments: "Verzauberungen",
    navCollectibles: "Sammlerstücke",
    heroEyebrow: "DEIN LOADOUT, DEIN PLAN",
    heroTitle: "Mach dein<br /><span>bestes</span> Gear.",
    heroDescription: "Jeder Slot, jede Verzauberung. Behalte dein perfektes Minecraft-Loadout im Blick.",
    heroLink: "Zur Checkliste",
    footnoteChecklist: "GEAR-CHECKLISTE",
    footnoteGuide: "VERZAUBERUNGS-GUIDE",
    progressLabel: "SEITENFORTSCHRITT",
    progressCaption: "Behalte den Fortschritt dieser Checkliste im Blick.",
    checkedLabel: "abgehakt",
    resetProgress: "Fortschritt zurücksetzen",
    collectionEyebrow: "DEINE SAMMLUNG",
    collectionTitle: "Verzauberungen",
    searchLabel: "Items oder Verzauberungen suchen",
    searchPlaceholder: "Item suchen...",
    categoryAll: "Alle",
    categoryArmor: "Rüstung",
    categoryWeapons: "Waffen",
    categoryTools: "Werkzeuge",
    categoryCollectibles: "Sammlerstücke",
    collectiblesEyebrow: "ENTDECKEN UND SAMMELN",
    collectiblesTitle: "Schmiedevorlagen & Schallplatten",
    collectiblesDescription: "Verfolge alle aktuellen Vorlagen und Schallplatten samt Fundort im Spiel.",
    collectiblesSearchLabel: "Sammlerstücke oder Fundorte suchen",
    collectiblesSearchPlaceholder: "Vorlagen, Schallplatten oder Fundorte suchen...",
    collectionAll: "Alle",
    collectionTemplates: "Schmiedevorlagen",
    collectionMusic: "Schallplatten",
    collectiblesEmptyState: "Keine Sammlerstücke gefunden. Versuch einen anderen Suchbegriff.",
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
    confirmReset: "Den gesamten Checklisten-Fortschritt zurücksetzen?",
    confirmResetItem: "Den Fortschritt für {item} zurücksetzen?",
    resetItem: "Zurücksetzen",
    resetItemLabel: "Fortschritt für {item} zurücksetzen",
    foundAt: "FUNDORT",
    locationSource: "Minecraft-Wiki",
    glossaryTitle: "Glossar",
    glossaryEnchantmentTerm: "Verzauberung",
    glossaryEnchantmentDefinition: "Ein besonderer Effekt für Ausrüstung, meist angewendet am Zaubertisch oder mit einem verzauberten Buch und Amboss.",
    glossaryExclusiveTerm: "Unvereinbare Verzauberungen",
    glossaryExclusiveDefinition: "Manche Verzauberungen können nicht gemeinsam auf einem Item liegen. Die Checkliste bündelt solche Alternativen zur Einzelauswahl.",
    glossaryAnvilTerm: "Ambosskosten",
    glossaryAnvilDefinition: "Die benötigten Erfahrungslevel zum Kombinieren oder Anwenden von Items. Vorherige Ambossarbeit kann die Kosten erhöhen.",
    glossaryTemplateTerm: "Schmiedevorlage",
    glossaryTemplateDefinition: "Ein in Strukturen gefundenes Item, das am Schmiedetisch zum Aufwerten von Diamantausrüstung oder für Rüstungsverzierungen dient.",
    glossaryArmorTrimTerm: "Rüstungsverzierung",
    glossaryArmorTrimDefinition: "Ein kosmetisches Muster, das mit einer Schmiedevorlage auf Rüstung kommt. Das Material ändert die Farbe, nicht die Rüstungswerte.",
    glossaryMusicDiscTerm: "Schallplatte",
    glossaryMusicDiscDefinition: "Ein sammelbarer Tonträger, der in einer Musikbox abgespielt wird.",
    madeBy: "Erstellt von",
    madeByName: "minCoding404",
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
  collectibleSearchInput.placeholder = text.collectiblesSearchPlaceholder;
  collectibleSearchInput.setAttribute("aria-label", text.collectiblesSearchLabel);
  languageSelect.setAttribute("aria-label", text.languageLabel);
  document.querySelector(".site-navigation").setAttribute("aria-label", text.navigationLabel);
  document.querySelectorAll(".progress-panel").forEach((panel) => panel.setAttribute("aria-label", text.progressAria));
  document.querySelectorAll(".progress-track").forEach((track) => track.setAttribute("aria-label", text.progressAria));
  document.querySelector("#category-tabs").setAttribute("aria-label", `${text.navEnchantments}: ${text.categoryAll}, ${text.categoryArmor}, ${text.categoryWeapons}, ${text.categoryTools}`);
  document.querySelector("#collectible-tabs").setAttribute("aria-label", `${text.navCollectibles}: ${text.collectionAll}, ${text.collectionTemplates}, ${text.collectionMusic}`);
}

function selectLanguage(value) {
  language = value === "de" ? "de" : "en";
  languageSelect.value = language;
  translateStaticText();
  renderCards();
  renderCollectibleCards();
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
    item.location,
    item.locationEn,
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
  const location = language === "de" ? item.location : item.locationEn;
  const locationInfo = location ? `
      <div class="item-location">
        <span class="location-label">${copy().foundAt}</span>
        <p>${escapeHTML(location)}</p>
        <a href="${escapeHTML(item.sourceUrl)}" target="_blank" rel="noreferrer">${copy().locationSource} ↗</a>
      </div>` : "";
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
        <div class="item-card-actions">
          <span class="item-progress">${done}<span>/${taskCount}</span></span>
          <button type="button" class="item-reset-button" data-reset-item="${item.id}" aria-label="${escapeHTML(copy().resetItemLabel.replace("{item}", itemName))}" ${done === 0 ? "disabled" : ""}>${copy().resetItem}</button>
        </div>
      </div>
      <div class="item-progress-track"><span style="width:${progress}%"></span></div>
      ${locationInfo}
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

function renderCollectibleCards() {
  const filtered = COLLECTIBLES.filter((item) => (collectibleType === "all" || item.collectionType === collectibleType) && itemSearchText(item).includes(collectibleQuery));
  collectibleGrid.innerHTML = filtered.map(renderItem).join("");
  collectibleEmptyState.hidden = filtered.length !== 0;
  collectibleGrid.hidden = filtered.length === 0;
  collectibleGrid.querySelectorAll(".item-art img").forEach((image) => {
    image.addEventListener("error", () => {
      image.hidden = true;
      image.closest(".item-art").classList.add("image-unavailable");
    }, { once: true });
  });
  updateProgress();
  updateCategoryCounts();
}

function updateProgress() {
  document.querySelectorAll(".progress-panel").forEach((panel) => {
    const items = panel.dataset.progressScope === "collectibles" ? COLLECTIBLES : ITEMS;
    const total = getTaskTotal(items);
    const completed = getCompletedTotal(state, items);
    const percent = total ? Math.round((completed / total) * 100) : 0;
    const label = panel.querySelector(".progress-percent");
    panel.querySelector(".progress-count-number").textContent = `${completed} / ${total}`;
    label.textContent = language === "de" ? `${percent} % abgeschlossen` : `${percent}% ${copy().complete}`;
    panel.querySelector(".progress-fill").style.width = `${percent}%`;
    const track = panel.querySelector(".progress-track");
    track.setAttribute("aria-valuenow", String(percent));
    track.setAttribute("aria-valuetext", label.textContent);
  });
}

function updateCategoryCounts() {
  for (const key of ["all", "armor", "weapons", "tools"]) {
    const count = key === "all" ? ITEMS.length : ITEMS.filter((item) => item.category === key).length;
    document.querySelector(`[data-count="${key}"]`).textContent = String(count);
  }
  document.querySelector('[data-collectible-count="all"]').textContent = String(COLLECTIBLES.length);
  document.querySelector('[data-collectible-count="templates"]').textContent = String(SMITHING_TEMPLATES.length);
  document.querySelector('[data-collectible-count="music"]').textContent = String(MUSIC_DISCS.length);
}

function onGridChange(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  const item = [...ITEMS, ...COLLECTIBLES].find((entry) => entry.id === input.dataset.item);
  if (!item) return;
  const saved = itemState(item);
  if (input.type === "checkbox") {
    saved.tasks[input.dataset.task] = input.checked;
  } else if (input.type === "radio") {
    saved.choices[input.dataset.choice] = input.value;
  } else {
    return;
  }
  saveState();
  renderCards();
  renderCollectibleCards();
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

document.querySelector("#collectible-tabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-collectible-type]");
  if (!button) return;
  collectibleType = button.dataset.collectibleType;
  document.querySelectorAll("#collectible-tabs .category-tab").forEach((tab) => {
    const active = tab === button;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", String(active));
  });
  renderCollectibleCards();
});

searchInput.addEventListener("input", () => {
  query = searchInput.value.trim().toLocaleLowerCase("de");
  renderCards();
});

collectibleSearchInput.addEventListener("input", () => {
  collectibleQuery = collectibleSearchInput.value.trim().toLocaleLowerCase("de");
  renderCollectibleCards();
});

function updatePage() {
  currentPage = location.hash === "#collectibles" ? "collectibles" : "enchantments";
  const collectiblesPage = currentPage === "collectibles";
  document.querySelector("#enchantments-page").hidden = collectiblesPage;
  document.querySelector("#collectibles-page").hidden = !collectiblesPage;
  document.querySelectorAll(".site-nav-link").forEach((link) => {
    const active = link.hash === `#${currentPage}`;
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.addEventListener("hashchange", updatePage);

languageSelect.addEventListener("change", () => {
  selectLanguage(languageSelect.value);
});

grid.addEventListener("change", onGridChange);
collectibleGrid.addEventListener("change", onGridChange);

function onItemReset(event) {
  const button = event.target.closest("button[data-reset-item]");
  if (!button) return;
  const item = [...ITEMS, ...COLLECTIBLES].find((entry) => entry.id === button.dataset.resetItem);
  if (!item || !window.confirm(copy().confirmResetItem.replace("{item}", language === "de" ? item.name : item.english))) return;
  state = resetItemState(state, item.id);
  saveState();
  renderCards();
  renderCollectibleCards();
}

grid.addEventListener("click", onItemReset);
collectibleGrid.addEventListener("click", onItemReset);

resetButtons.forEach((resetButton) => resetButton.addEventListener("click", () => {
  if (!window.confirm(copy().confirmReset)) return;
  state = {};
  saveState();
  renderCards();
  renderCollectibleCards();
}));

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    (currentPage === "collectibles" ? collectibleSearchInput : searchInput).focus();
  }
});

readState();
languageSelect.value = language;
translateStaticText();
renderCards();
renderCollectibleCards();
updatePage();
