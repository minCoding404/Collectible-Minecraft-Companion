import {
  CATEGORIES,
  CATEGORIES_EN,
  CHOICE_LABELS_EN,
  ENCHANTMENT_INFO,
  ENCHANTMENT_INFO_EN,
  COLLECTIBLES,
  ITEMS,
  ITEM_MIN_VERSIONS,
  TASK_MIN_VERSIONS,
  COLLECTIBLE_MIN_VERSIONS,
  MATERIALS,
  MUSIC_DISCS,
  RECIPES,
  SMITHING_TEMPLATES,
  SUPPORTED_VERSIONS,
  VERSION_PROFILES,
  getCompletedTotal,
  getAdjustedRecipe,
  getTaskTotal,
  resetItemState,
  sanitizeChecklistState,
  sanitizeChecklistLayout,
  sanitizeCustomItems,
  sanitizeNotes,
} from "./data.js";

const STORAGE_KEY = "enchanting-desk.checklist.v1";
const LANGUAGE_KEY = "enchanting-desk.language";
const EDITION_KEY = "enchanting-desk.edition";
const VERSION_KEY = "enchanting-desk.version";
const CUSTOM_ITEMS_KEY = "enchanting-desk.custom-items.v1";
const LAYOUT_KEY = "enchanting-desk.layout.v1";
const NOTES_KEY = "enchanting-desk.notes.v1";
const grid = document.querySelector("#items-grid");
const searchInput = document.querySelector("#search-input");
const emptyState = document.querySelector("#empty-state");
const collectibleGrid = document.querySelector("#collectibles-grid");
const collectibleSearchInput = document.querySelector("#collectibles-search-input");
const collectibleEmptyState = document.querySelector("#collectibles-empty-state");
const resetButtons = document.querySelectorAll(".reset-button");
const languageSelect = document.querySelector("#language-select");
const editionSelect = document.querySelector("#edition-select");
const versionSelect = document.querySelector("#version-select");
const plannerItemSelect = document.querySelector("#planner-item-select");
const plannerWorkSelect = document.querySelector("#planner-work-select");
const plannerOutput = document.querySelector("#planner-output");
const backupFileInput = document.querySelector("#backup-file");
const noteForm = document.querySelector("#note-form");
const noteNameInput = document.querySelector("#note-name");
const noteChecklistToggle = document.querySelector("#note-checklist-enabled");
const noteChecklistFields = document.querySelector("#note-checklist-fields");
const noteChecklistInput = document.querySelector("#note-checklist");
const noteList = document.querySelector("#notes-list");
const noteEmptyState = document.querySelector("#notes-empty-state");
const noteFilterButtons = document.querySelectorAll("[data-note-filter]");
const storageNotice = document.createElement("p");
document.querySelector(".progress-panel").after(storageNotice);
let state = {};
let language = "en";
let category = "all";
let query = "";
let collectibleType = "all";
let collectibleQuery = "";
let currentPage = "enchantments";
let edition = "java";
let selectedVersion = "1.21.11";
let customItems = [];
let hiddenItems = new Set();
let notes = [];
let noteFilter = "all";
let itemOrder = [];
let draggedItemId = "";
let plannerItemId = RECIPES[0].itemId;
let plannerPriorWorkCount = 0;

const UI_COPY = {
  en: {
    title: "Collectible Minecraft Companion (CMC)",
    metaDescription: "CMC is an interactive Minecraft companion for enchantments, collectibles, notes, and checklists.",
    editionMode: "SURVIVAL MODE",
    languageLabel: "Language",
    navigationLabel: "Main navigation",
    editionLabel: "Edition",
    versionLabel: "Minecraft version",
    javaEdition: "Java Edition",
    bedrockEdition: "Bedrock Edition",
    navEnchantments: "Enchantments",
    navCollectibles: "Collectibles",
    navNotes: "Notes",
    notesEyebrow: "FIELD NOTES",
    notesTitle: "Your notes",
    notesDescription: "Create dated notes, turn them into checklists, and track when they're complete.",
    noteNameLabel: "Name",
    noteCreatedDateLabel: "Created",
    noteDescriptionLabel: "Description",
    noteChecklistToggle: "Create a checklist from this note",
    noteChecklistHeading: "Checklist",
    noteChecklistLabel: "Checklist tasks (one per line)",
    noteChecklistHelp: "Each non-empty line becomes a separate task.",
    noteSave: "Save note",
    noteSaveError: "Could not save note",
    noteFilterAll: "All notes",
    noteFilterOpen: "Open",
    noteFilterCompleted: "Completed",
    noteFilterHidden: "Hidden",
    noteCompletedOn: "Completed on",
    noteComplete: "Complete note",
    noteReopen: "Reopen",
    noteHide: "Hide",
    noteShow: "Show",
    noteHidden: "Hidden",
    noteChecklistProgress: "{done} / {total} tasks",
    noteEmpty: "No notes match this view yet.",
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
    plannerEyebrow: "ANVIL COST PLANNER",
    plannerTitle: "Estimate your anvil level cost.",
    plannerItemLabel: "Item",
    plannerPriorWorkLabel: "Prior anvil uses",
    plannerTotal: "Estimated total",
    plannerAdditional: "additional levels",
    plannerPriorWorkStep: "+{levels} prior-work levels",
    plannerNote: "Adds target-item prior work to the guide sequence; source books are assumed unused. Survival/Adventure rejects any single operation costing 40 or more levels.",
    anvilTooExpensive: "TOO EXPENSIVE — 40+ levels",
    backupExport: "Export backup",
    backupImport: "Import backup",
    backupToolsLabel: "Checklist backup",
    backupExportSuccess: "Checklist backup downloaded.",
    backupImportSuccess: "Checklist backup restored.",
    backupImportConfirm: "Replace this browser's checklist, custom items, and profile with the backup?",
    backupImportError: "Could not restore backup",
    backupInvalid: "This file is not a valid CMC backup.",
    backupVersionUnsupported: "This backup format version is not supported.",
    backupFileTooLarge: "Backup files must be 1 MB or smaller.",
    duplicateItem: "Duplicate",
    renameItem: "Rename",
    deleteCopy: "Delete copy",
    copySuffix: "copy",
    renameCopyPrompt: "Optional name for {item} (leave blank to use the default name):",
    confirmDeleteCopy: "Delete {item} and its checklist progress?",
    invalidCopyName: "Names must be 60 characters or fewer.",
    hideItem: "Hide",
    unhideItem: "Unhide",
    dragItem: "Reorder {item}; use arrow keys to move",
    collectionEyebrow: "YOUR COLLECTION",
    collectionTitle: "Enchantments",
    searchLabel: "Search items or enchantments",
    searchPlaceholder: "Search items...",
    categoryAll: "All",
    categoryArmor: "Armor",
    categoryWeapons: "Weapons",
    categoryTools: "Tools",
    categoryHiddenItems: "Hidden items",
    categoryCollectibles: "Collectibles",
    collectiblesEyebrow: "EXPLORE AND COLLECT",
    collectiblesTitle: "Smithing templates & music discs",
    collectiblesDescription: "Track every current template and disc, with its in-game find location.",
    collectiblesSearchLabel: "Search collectibles or find locations",
    collectiblesSearchPlaceholder: "Search templates, discs, or locations...",
    collectionAll: "All",
    collectionTemplates: "Smithing templates",
    collectionMusic: "Music discs",
    collectionHidden: "Hidden",
    collectiblesEmptyState: "No collectibles found. Try another search.",
    guideNote: "The listed amounts are individual anvil operations. In Survival/Adventure, each operation must cost 39 levels or less; 40+ is rejected. Prior work can increase costs.",
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
    glossaryTitle: "Glossary",
    glossaryEnchantmentTerm: "Enchantment",
    glossaryEnchantmentDefinition: "A special effect applied to gear, usually with an enchanting table or an enchanted book and an anvil.",
    glossaryExclusiveTerm: "Exclusive enchantments",
    glossaryExclusiveDefinition: "Some enchantments cannot be used together on one item. The checklist groups those alternatives so you can select only one.",
    glossaryAnvilTerm: "Anvil cost",
    glossaryAnvilDefinition: "The experience levels required for one anvil operation. In Survival/Adventure, costs are capped at 39 levels per operation; 40 or more is rejected.",
    glossaryTemplateTerm: "Smithing template",
    glossaryTemplateDefinition: "A structure-found item used at a smithing table to upgrade diamond gear or add an armor trim.",
    glossaryArmorTrimTerm: "Armor trim",
    glossaryArmorTrimDefinition: "A cosmetic pattern added to armor with a smithing template; its material changes the color, not the armor stats.",
    glossaryMusicDiscTerm: "Music disc",
    glossaryMusicDiscDefinition: "A collectible record played in a jukebox.",
    glossaryPriorWorkTerm: "Prior anvil work",
    glossaryPriorWorkDefinition: "Previous operations on an item increase the level cost of later anvil steps.",
    glossaryNoteTerm: "Note",
    glossaryNoteDefinition: "A dated entry with a name and description. Completing it records the current date automatically; it can also be hidden.",
    glossaryNoteChecklistTerm: "Note checklist",
    glossaryNoteChecklistDefinition: "An optional task list created from non-empty lines in a note; each task is tracked independently.",
    glossaryHiddenEntryTerm: "Hidden entry",
    glossaryHiddenEntryDefinition: "An item or note moved out of the regular list. Use its Hidden tab to restore it; hiding never deletes progress.",
    glossaryGearCopyTerm: "Gear copy",
    glossaryGearCopyDefinition: "A duplicated gear entry with independent enchantment progress. Copies can be renamed and deleted; original items cannot be deleted.",
    madeBy: "Made by",
    madeByName: "minCoding404",
    storageReadError: "Your browser could not load saved progress",
    storageWriteError: "Progress will only be kept in this tab",
    netheriteUpgrade: "Upgrade to Netherite",
    netheriteUpgradeTooltip: "Mark this when you have upgraded the diamond item to Netherite.",
    craftingMaterials: "Crafting materials",
    smithingMaterials: "Smithing & upgrade materials",
    achievementEyebrow: "MILESTONES",
    achievementTitle: "Badges & milestones.",
    achievementDescription: "Finish item sets to unlock badges for your selected edition and version.",
    milestonesTitle: "Progress milestones",
    badgesTitle: "Set badges",
    badgeUnlocked: "Unlocked",
    badgeLocked: "In progress",
    badgeSteps: "{done} / {total} steps",
    armorBadge: "Armor set",
    armorBadgeDescription: "Complete every armor checklist item.",
    weaponsBadge: "Arsenal",
    weaponsBadgeDescription: "Complete every weapon checklist item.",
    toolsBadge: "Toolsmith",
    toolsBadgeDescription: "Complete every tool checklist item.",
    collectiblesBadge: "Collector",
    collectiblesBadgeDescription: "Collect every available template and music disc.",
    completionBadge: "Completionist",
    completionBadgeDescription: "Complete every checklist item in this profile.",
  },
  de: {
    title: "Collectible Minecraft Companion (CMC)",
    metaDescription: "CMC ist dein interaktiver Minecraft-Begleiter für Verzauberungen, Sammlerstücke, Notizen und Checklisten.",
    editionMode: "ÜBERLEBENS-MODUS",
    languageLabel: "Sprache",
    navigationLabel: "Hauptnavigation",
    editionLabel: "Edition",
    versionLabel: "Minecraft-Version",
    javaEdition: "Java Edition",
    bedrockEdition: "Bedrock Edition",
    navEnchantments: "Verzauberungen",
    navCollectibles: "Sammlerstücke",
    navNotes: "Notizen",
    notesEyebrow: "DEINE NOTIZEN",
    notesTitle: "Deine Notizen",
    notesDescription: "Erstelle datierte Notizen, mache daraus Checklisten und halte das Abschlussdatum fest.",
    noteNameLabel: "Name",
    noteCreatedDateLabel: "Erstellt",
    noteDescriptionLabel: "Beschreibung",
    noteChecklistToggle: "Aus dieser Notiz eine Checkliste erstellen",
    noteChecklistHeading: "Checkliste",
    noteChecklistLabel: "Checklistenpunkte (einer pro Zeile)",
    noteChecklistHelp: "Jede nicht leere Zeile wird zu einer eigenen Aufgabe.",
    noteSave: "Notiz speichern",
    noteSaveError: "Notiz konnte nicht gespeichert werden",
    noteFilterAll: "Alle Notizen",
    noteFilterOpen: "Offen",
    noteFilterCompleted: "Abgeschlossen",
    noteFilterHidden: "Verborgen",
    noteCompletedOn: "Abgeschlossen am",
    noteComplete: "Notiz abschließen",
    noteReopen: "Wieder öffnen",
    noteHide: "Ausblenden",
    noteShow: "Anzeigen",
    noteHidden: "Verborgen",
    noteChecklistProgress: "{done} / {total} Aufgaben",
    noteEmpty: "Für diese Ansicht gibt es noch keine passenden Notizen.",
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
    plannerEyebrow: "AMBOSSKOSTEN-PLANER",
    plannerTitle: "Schätze deine Ambosskosten.",
    plannerItemLabel: "Item",
    plannerPriorWorkLabel: "Vorherige Ambossarbeiten",
    plannerTotal: "Geschätzte Gesamtkosten",
    plannerAdditional: "zusätzliche Level",
    plannerPriorWorkStep: "+{levels} Level Vorarbeit",
    plannerNote: "Ergänzt die Vorarbeit des Ziel-Items zur Guide-Reihenfolge; Bücher gelten als unbenutzt. In Überleben/Abenteuer werden einzelne Arbeiten ab 40 Leveln abgelehnt.",
    anvilTooExpensive: "ZU TEUER — 40+ Level",
    backupExport: "Backup exportieren",
    backupImport: "Backup importieren",
    backupToolsLabel: "Checklisten-Backup",
    backupExportSuccess: "Checklisten-Backup heruntergeladen.",
    backupImportSuccess: "Checklisten-Backup wiederhergestellt.",
    backupImportConfirm: "Die Checkliste, eigenen Items und das Profil dieses Browsers durch das Backup ersetzen?",
    backupImportError: "Backup konnte nicht wiederhergestellt werden",
    backupInvalid: "Diese Datei ist kein gültiges CMC-Backup.",
    backupVersionUnsupported: "Diese Backup-Formatversion wird nicht unterstützt.",
    backupFileTooLarge: "Backups dürfen höchstens 1 MB groß sein.",
    duplicateItem: "Duplizieren",
    renameItem: "Umbenennen",
    deleteCopy: "Kopie löschen",
    copySuffix: "Kopie",
    renameCopyPrompt: "Optionaler Name für {item} (leer lassen für den Standardnamen):",
    confirmDeleteCopy: "{item} und den zugehörigen Checklisten-Fortschritt löschen?",
    invalidCopyName: "Namen dürfen höchstens 60 Zeichen lang sein.",
    hideItem: "Ausblenden",
    unhideItem: "Einblenden",
    dragItem: "{item} neu anordnen; mit Pfeiltasten verschieben",
    collectionEyebrow: "DEINE SAMMLUNG",
    collectionTitle: "Verzauberungen",
    searchLabel: "Items oder Verzauberungen suchen",
    searchPlaceholder: "Item suchen...",
    categoryAll: "Alle",
    categoryArmor: "Rüstung",
    categoryWeapons: "Waffen",
    categoryTools: "Werkzeuge",
    categoryHiddenItems: "Verborgene Items",
    categoryCollectibles: "Sammlerstücke",
    collectiblesEyebrow: "ENTDECKEN UND SAMMELN",
    collectiblesTitle: "Schmiedevorlagen & Schallplatten",
    collectiblesDescription: "Verfolge alle aktuellen Vorlagen und Schallplatten samt Fundort im Spiel.",
    collectiblesSearchLabel: "Sammlerstücke oder Fundorte suchen",
    collectiblesSearchPlaceholder: "Vorlagen, Schallplatten oder Fundorte suchen...",
    collectionAll: "Alle",
    collectionTemplates: "Schmiedevorlagen",
    collectionMusic: "Schallplatten",
    collectionHidden: "Verborgene",
    collectiblesEmptyState: "Keine Sammlerstücke gefunden. Versuch einen anderen Suchbegriff.",
    guideNote: "Die Angaben sind einzelne Ambossarbeiten. In Überleben/Abenteuer darf jede Arbeit höchstens 39 Level kosten; ab 40 wird sie abgelehnt. Vorarbeit kann die Kosten erhöhen.",
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
    glossaryTitle: "Glossar",
    glossaryEnchantmentTerm: "Verzauberung",
    glossaryEnchantmentDefinition: "Ein besonderer Effekt für Ausrüstung, meist angewendet am Zaubertisch oder mit einem verzauberten Buch und Amboss.",
    glossaryExclusiveTerm: "Unvereinbare Verzauberungen",
    glossaryExclusiveDefinition: "Manche Verzauberungen können nicht gemeinsam auf einem Item liegen. Die Checkliste bündelt solche Alternativen zur Einzelauswahl.",
    glossaryAnvilTerm: "Ambosskosten",
    glossaryAnvilDefinition: "Die Erfahrungslevel für eine Ambossarbeit. In Überleben/Abenteuer gilt ein Limit von 39 Leveln pro Arbeit; ab 40 wird sie abgelehnt.",
    glossaryTemplateTerm: "Schmiedevorlage",
    glossaryTemplateDefinition: "Ein in Strukturen gefundenes Item, das am Schmiedetisch zum Aufwerten von Diamantausrüstung oder für Rüstungsverzierungen dient.",
    glossaryArmorTrimTerm: "Rüstungsverzierung",
    glossaryArmorTrimDefinition: "Ein kosmetisches Muster, das mit einer Schmiedevorlage auf Rüstung kommt. Das Material ändert die Farbe, nicht die Rüstungswerte.",
    glossaryMusicDiscTerm: "Schallplatte",
    glossaryMusicDiscDefinition: "Ein sammelbarer Tonträger, der in einer Musikbox abgespielt wird.",
    glossaryPriorWorkTerm: "Vorarbeit am Amboss",
    glossaryPriorWorkDefinition: "Vorherige Ambossarbeiten an einem Item erhöhen die Levelkosten späterer Arbeitsschritte.",
    glossaryNoteTerm: "Notiz",
    glossaryNoteDefinition: "Ein datierter Eintrag mit Name und Beschreibung. Beim Abschließen wird das aktuelle Datum automatisch gespeichert; die Notiz kann auch verborgen werden.",
    glossaryNoteChecklistTerm: "Notiz-Checkliste",
    glossaryNoteChecklistDefinition: "Eine optionale Aufgabenliste aus nicht leeren Zeilen einer Notiz; jede Aufgabe wird separat gespeichert.",
    glossaryHiddenEntryTerm: "Verborgener Eintrag",
    glossaryHiddenEntryDefinition: "Ein Item oder eine Notiz außerhalb der normalen Liste. Im Tab „Verborgen“ kann es wieder eingeblendet werden; der Fortschritt bleibt erhalten.",
    glossaryGearCopyTerm: "Ausrüstungskopie",
    glossaryGearCopyDefinition: "Ein dupliziertes Gear-Item mit eigenständigem Verzauberungsfortschritt. Kopien lassen sich umbenennen und löschen, Originale nicht.",
    madeBy: "Erstellt von",
    madeByName: "minCoding404",
    storageReadError: "Dein Browser konnte den gespeicherten Fortschritt nicht laden",
    storageWriteError: "Dein Fortschritt bleibt nur in diesem Tab erhalten",
    netheriteUpgrade: "Zu Netherit aufwerten",
    netheriteUpgradeTooltip: "Abhaken, sobald du das Diamant-Item zu Netherit aufgewertet hast.",
    craftingMaterials: "Herstellungsmaterialien",
    smithingMaterials: "Schmiede- und Aufwertungsmaterialien",
    achievementEyebrow: "MEILENSTEINE",
    achievementTitle: "Abzeichen & Meilensteine.",
    achievementDescription: "Vervollständige Item-Sets und schalte Abzeichen für deine gewählte Edition und Version frei.",
    milestonesTitle: "Fortschrittsmeilensteine",
    badgesTitle: "Set-Abzeichen",
    badgeUnlocked: "Freigeschaltet",
    badgeLocked: "In Arbeit",
    badgeSteps: "{done} / {total} Schritte",
    armorBadge: "Rüstungsset",
    armorBadgeDescription: "Schließe alle Checklisten-Items der Rüstung ab.",
    weaponsBadge: "Waffenarsenal",
    weaponsBadgeDescription: "Schließe alle Checklisten-Items der Waffen ab.",
    toolsBadge: "Werkzeugmeister",
    toolsBadgeDescription: "Schließe alle Checklisten-Items der Werkzeuge ab.",
    collectiblesBadge: "Sammler",
    collectiblesBadgeDescription: "Sammle alle verfügbaren Vorlagen und Schallplatten.",
    completionBadge: "Komplettist",
    completionBadgeDescription: "Schließe alle Checklisten-Items dieses Profils ab.",
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

function versionAtLeast(requiredVersion) {
  const required = requiredVersion.split(".").map(Number);
  const selected = selectedVersion.split(".").map(Number);
  for (let index = 0; index < Math.max(required.length, selected.length); index += 1) {
    const difference = (selected[index] ?? 0) - (required[index] ?? 0);
    if (difference !== 0) return difference > 0;
  }
  return true;
}

function isEditionAvailable(entry) {
  const note = entry.note ?? "";
  if (/Nur Java Edition/.test(note) && edition !== "java") return false;
  if (/Nur Bedrock Edition/.test(note) && edition !== "bedrock") return false;
  return true;
}

function getAvailableItems(items) {
  return items.flatMap((item) => {
    const minVersion = ITEM_MIN_VERSIONS[item.id] ?? COLLECTIBLE_MIN_VERSIONS[item.id] ?? "1.0";
    if (!versionAtLeast(minVersion)) return [];
    const tasks = item.tasks.filter((task) => versionAtLeast(TASK_MIN_VERSIONS[task.id] ?? "1.0") && isEditionAvailable(task));
    const choices = (item.choices ?? [])
      .map((choice) => ({
        ...choice,
        options: choice.options.filter((option) => versionAtLeast(TASK_MIN_VERSIONS[option.id] ?? "1.0") && isEditionAvailable(option)),
      }))
      .filter((choice) => choice.options.length > 0);
    const materials = (MATERIALS[item.id] ?? []).filter((material) => versionAtLeast(material.minVersion ?? (material.group === "smithing" ? "1.16" : "1.0")));
    return [{
      ...item,
      tasks,
      choices,
      materials,
      netheriteUpgrade: Boolean(item.netheriteUpgrade && versionAtLeast("1.16")),
    }];
  });
}

function sortItems(items) {
  const positions = new Map(itemOrder.map((itemId, index) => [itemId, index]));
  const originalPositions = new Map(items.map((item, index) => [item.id, index]));
  return [...items].sort((first, second) => {
    const firstPosition = positions.get(first.id) ?? Number.MAX_SAFE_INTEGER;
    const secondPosition = positions.get(second.id) ?? Number.MAX_SAFE_INTEGER;
    return firstPosition - secondPosition || originalPositions.get(first.id) - originalPositions.get(second.id);
  });
}

function getAllOrderedItems() {
  const copies = customItems.map((customItem) => ({
    ...ITEMS.find((item) => item.id === customItem.sourceId),
    id: customItem.id,
    baseItemId: customItem.sourceId,
    customItemId: customItem.id,
    customName: customItem.customName,
    copyNumber: customItem.copyNumber,
  }));
  return sortItems([...ITEMS, ...COLLECTIBLES, ...copies]);
}

function persistLayout(nextHiddenItems, nextOrder, nextCustomItems = customItems) {
  try {
    const layout = sanitizeChecklistLayout({
      hidden: [...nextHiddenItems],
      order: nextOrder,
    }, nextCustomItems);
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
    hiddenItems = new Set(layout.hidden);
    itemOrder = layout.order;
    showStorageNotice("");
    return true;
  } catch (error) {
    showStorageNotice(`${copy().storageWriteError}: ${error.message}`);
    return false;
  }
}

function getAvailableGearItems() {
  const availableItems = getAvailableItems(ITEMS);
  const itemsById = new Map(availableItems.map((item) => [item.id, item]));
  const copies = customItems.flatMap((customItem) => {
    const source = itemsById.get(customItem.sourceId);
    return source ? [{
      ...source,
      id: customItem.id,
      baseItemId: customItem.sourceId,
      customItemId: customItem.id,
      customName: customItem.customName,
      copyNumber: customItem.copyNumber,
    }] : [];
  });
  return sortItems([...availableItems, ...copies]);
}

function getItemById(itemId) {
  const item = [...ITEMS, ...COLLECTIBLES].find((entry) => entry.id === itemId);
  if (item) return item;
  const customItem = customItems.find((entry) => entry.id === itemId);
  const source = customItem && ITEMS.find((entry) => entry.id === customItem.sourceId);
  return source ? {
    ...source,
    id: customItem.id,
    baseItemId: source.id,
    customItemId: customItem.id,
    customName: customItem.customName,
    copyNumber: customItem.copyNumber,
    materials: MATERIALS[source.id] ?? [],
  } : null;
}

function itemDisplayName(item) {
  if (item.customItemId) {
    if (item.customName) return item.customName;
    const sourceName = language === "de" ? ITEMS.find((entry) => entry.id === item.baseItemId).name : ITEMS.find((entry) => entry.id === item.baseItemId).english;
    return `${sourceName} (${copy().copySuffix} ${item.copyNumber})`;
  }
  return language === "de" ? item.name : item.english;
}

function renderVersionOptions() {
  const profiles = VERSION_PROFILES[edition];
  if (!profiles.some((profile) => profile.version === selectedVersion)) selectedVersion = profiles[0].version;
  versionSelect.innerHTML = profiles.map((profile) => `<option value="${profile.version}">${profile.label}</option>`).join("");
  versionSelect.value = selectedVersion;
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
    const savedEdition = localStorage.getItem(EDITION_KEY);
    const savedVersion = localStorage.getItem(VERSION_KEY);
    const savedCustomItems = localStorage.getItem(CUSTOM_ITEMS_KEY);
    const savedLayout = localStorage.getItem(LAYOUT_KEY);
    const savedNotes = localStorage.getItem(NOTES_KEY);
    state = saved ? JSON.parse(saved) : {};
    if (savedCustomItems) {
      try {
        customItems = sanitizeCustomItems(JSON.parse(savedCustomItems));
      } catch (error) {
        customItems = [];
        showStorageNotice(`${copy().storageReadError}: ${error.message}`);
      }
    }
    if (savedLayout) {
      try {
        const layout = sanitizeChecklistLayout(JSON.parse(savedLayout), customItems);
        hiddenItems = new Set(layout.hidden);
        itemOrder = layout.order;
      } catch (error) {
        hiddenItems = new Set();
        itemOrder = [];
        showStorageNotice(`${copy().storageReadError}: ${error.message}`);
      }
    }
    if (savedNotes) {
      try {
        notes = sanitizeNotes(JSON.parse(savedNotes));
      } catch (error) {
        notes = [];
        showStorageNotice(`${copy().storageReadError}: ${error.message}`);
      }
    }
    if (!state || typeof state !== "object" || Array.isArray(state)) state = {};
    if (savedLanguage === "de" || savedLanguage === "en") language = savedLanguage;
    if (savedEdition === "java" || savedEdition === "bedrock") edition = savedEdition;
    if (SUPPORTED_VERSIONS.includes(savedVersion)) selectedVersion = savedVersion;
  } catch (error) {
    state = {};
    customItems = [];
    hiddenItems = new Set();
    notes = [];
    itemOrder = [];
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

function saveProfile() {
  try {
    localStorage.setItem(EDITION_KEY, edition);
    localStorage.setItem(VERSION_KEY, selectedVersion);
    showStorageNotice("");
  } catch (error) {
    showStorageNotice(`${copy().storageWriteError}: ${error.message}`);
  }
}

function persistCustomItems(items) {
  try {
    localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(items));
    showStorageNotice("");
    return true;
  } catch (error) {
    showStorageNotice(`${copy().storageWriteError}: ${error.message}`);
    return false;
  }
}

function persistNotes(nextNotes) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(nextNotes));
    showStorageNotice("");
    return true;
  } catch (error) {
    showStorageNotice(`${copy().storageWriteError}: ${error.message}`);
    return false;
  }
}

function persistBackup(progress, items, layout, savedNotes, preferences) {
  const updates = [
    [STORAGE_KEY, JSON.stringify(progress)],
    [CUSTOM_ITEMS_KEY, JSON.stringify(items)],
    [LAYOUT_KEY, JSON.stringify(layout)],
    [NOTES_KEY, JSON.stringify(savedNotes)],
    [LANGUAGE_KEY, preferences.language],
    [EDITION_KEY, preferences.edition],
    [VERSION_KEY, preferences.version],
  ];
  const previous = [];
  try {
    for (const [key] of updates) previous.push([key, localStorage.getItem(key)]);
    for (const [key, value] of updates) localStorage.setItem(key, value);
    return true;
  } catch (error) {
    const rollbackErrors = [];
    for (const [key, value] of previous) {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError.message);
      }
    }
    const rollbackNote = rollbackErrors.length ? ` (${rollbackErrors.join("; ")})` : "";
    showStorageNotice(`${copy().storageWriteError}: ${error.message}${rollbackNote}`);
    return false;
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
  editionSelect.setAttribute("aria-label", text.editionLabel);
  versionSelect.setAttribute("aria-label", text.versionLabel);
  document.querySelector(".site-navigation").setAttribute("aria-label", text.navigationLabel);
  document.querySelector(".backup-actions").setAttribute("aria-label", text.backupToolsLabel);
  document.querySelectorAll(".progress-panel").forEach((panel) => panel.setAttribute("aria-label", text.progressAria));
  document.querySelectorAll(".progress-track").forEach((track) => track.setAttribute("aria-label", text.progressAria));
  document.querySelector("#category-tabs").setAttribute("aria-label", `${text.navEnchantments}: ${text.categoryAll}, ${text.categoryArmor}, ${text.categoryWeapons}, ${text.categoryTools}, ${text.categoryHiddenItems}`);
  document.querySelector("#collectible-tabs").setAttribute("aria-label", `${text.navCollectibles}: ${text.collectionAll}, ${text.collectionTemplates}, ${text.collectionMusic}, ${text.collectionHidden}`);
  document.querySelector("#note-filters").setAttribute("aria-label", `${text.navNotes}: ${text.noteFilterAll}, ${text.noteFilterOpen}, ${text.noteFilterCompleted}, ${text.noteFilterHidden}`);
}

function selectLanguage(value) {
  language = value === "de" ? "de" : "en";
  languageSelect.value = language;
  translateStaticText();
  renderCards();
  renderCollectibleCards();
  renderNotes();
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

function getLocalDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatNoteDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat(language === "de" ? "de-DE" : "en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function renderNotes() {
  noteFilterButtons.forEach((button) => {
    const active = button.dataset.noteFilter === noteFilter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const visibleNotes = [...notes]
    .filter((note) => noteFilter === "hidden" ? note.hidden : !note.hidden)
    .filter((note) => noteFilter === "all" || noteFilter === "hidden"
      || (noteFilter === "completed" ? Boolean(note.completedDate) : !note.completedDate))
    .sort((first, second) => second.createdDate.localeCompare(first.createdDate)
      || Number(second.id.slice(5)) - Number(first.id.slice(5)));
  noteList.innerHTML = visibleNotes.map((note) => {
    const completed = Boolean(note.completedDate);
    const doneTasks = note.checklist.filter((task) => task.done).length;
    const checklist = note.checklist.length ? `
      <div class="note-checklist">
        <div class="note-checklist-heading"><strong>${copy().noteChecklistHeading}</strong><span>${copy().noteChecklistProgress.replace("{done}", String(doneTasks)).replace("{total}", String(note.checklist.length))}</span></div>
        ${note.checklist.map((task, index) => `
          <label class="note-checklist-task${task.done ? " is-done" : ""}">
            <input type="checkbox" data-note-task="${note.id}" data-note-task-index="${index}" ${task.done ? "checked" : ""} />
            <span>${escapeHTML(task.text)}</span>
          </label>`).join("")}
      </div>` : "";
    const status = `${note.hidden ? `${copy().noteHidden} · ` : ""}${completed ? copy().noteFilterCompleted : copy().noteFilterOpen}`;
    return `
      <article class="note-card${completed ? " is-completed" : ""}${note.hidden ? " is-hidden" : ""}" data-note-card="${note.id}">
        <div class="note-card-heading">
          <div>
            <h3 class="note-card-title">${escapeHTML(note.name)}</h3>
            <div class="note-card-meta"><span>${copy().noteCreatedDateLabel}: ${formatNoteDate(note.createdDate)}</span>${completed ? `<span>${copy().noteCompletedOn}: ${formatNoteDate(note.completedDate)}</span>` : ""}<span class="note-status">${status}</span></div>
          </div>
        </div>
        <p class="note-card-description">${escapeHTML(note.description)}</p>
        ${checklist}
        <div class="note-card-footer">
          <div class="note-completion"><button type="button" class="text-button" data-note-complete="${note.id}">${completed ? copy().noteReopen : copy().noteComplete}</button></div>
          <div class="note-card-actions">
            <button type="button" class="text-button" data-note-visibility="${note.id}">${note.hidden ? copy().noteShow : copy().noteHide}</button>
          </div>
        </div>
      </article>`;
  }).join("");
  noteEmptyState.hidden = visibleNotes.length !== 0;
}

function updateNote(noteId, updater) {
  const nextNotes = notes.map((note) => note.id === noteId ? updater(note) : note);
  if (!persistNotes(nextNotes)) return false;
  notes = nextNotes;
  renderNotes();
  return true;
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
    item.customName,
    ...item.tasks.flatMap((task) => [task.name, task.english]),
    ...(item.choices ?? []).flatMap((choice) => [choice.label, ...choice.options.flatMap((option) => [option.name, option.english])]),
    ...(item.netheriteUpgrade ? ["diamond", "netherite", "diamant", "netherit"] : []),
    item.location,
    item.locationEn,
    ...(item.materials ?? []).flatMap((material) => [material.name, material.english]),
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

function renderMaterials(item, group) {
  const materials = (item.materials ?? []).filter((material) => material.group === group);
  if (!materials.length) return "";
  const heading = group === "crafting" ? copy().craftingMaterials : copy().smithingMaterials;
  const rows = materials.map((material) => renderTask(item, {
    id: `material-${material.id}`,
    name: material.name,
    english: material.english,
  })).join("");
  return `<section class="material-section" aria-label="${heading}"><h4>${heading}</h4><div class="material-list">${rows}</div></section>`;
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
        <ol>${recipe.sequence.map((step) => {
    const tooExpensive = step.cost >= 40;
    return `<li class="${tooExpensive ? "is-too-expensive" : ""}"><span>${escapeHTML(language === "de" ? step.description : step.descriptionEn)}</span><strong>${step.cost} ${language === "de" ? "Level" : "levels"}${tooExpensive ? `<small class="anvil-warning">${copy().anvilTooExpensive}</small>` : ""}</strong></li>`;
  }).join("")}</ol>
        ${recipe.note ? `<p class="recipe-note">${escapeHTML(language === "de" ? recipe.note : recipe.noteEn)}</p>` : ""}
      </section>`;
}

function renderAnvilPlanner() {
  const recipes = RECIPES.filter((recipe) => !recipe.editions || recipe.editions.includes(edition));
  if (!recipes.some((recipe) => recipe.itemId === plannerItemId)) plannerItemId = recipes[0]?.itemId ?? "";
  plannerItemSelect.innerHTML = recipes.map((recipe) => {
    const item = ITEMS.find((entry) => entry.id === recipe.itemId);
    const name = language === "de" ? item.name : item.english;
    return `<option value="${recipe.itemId}">${escapeHTML(name)}</option>`;
  }).join("");
  plannerItemSelect.value = plannerItemId;
  plannerWorkSelect.innerHTML = Array.from({ length: 6 }, (_, count) => {
    const label = language === "de"
      ? `${count} ${count === 1 ? "Vorarbeit" : "Vorarbeiten"}`
      : `${count} ${count === 1 ? "prior use" : "prior uses"}`;
    return `<option value="${count}">${label}</option>`;
  }).join("");
  plannerWorkSelect.value = String(plannerPriorWorkCount);
  const recipe = recipes.find((entry) => entry.itemId === plannerItemId);
  if (!recipe) {
    plannerOutput.innerHTML = "";
    return;
  }
  const adjusted = getAdjustedRecipe(recipe, plannerPriorWorkCount);
  const levelLabel = language === "de" ? "Level" : "levels";
  plannerOutput.innerHTML = `
    <div class="planner-result-summary">
      <div><span class="planner-total-label">${copy().plannerTotal}</span><strong>${adjusted.levels} ${levelLabel}</strong></div>
      <span class="planner-breakdown">${adjusted.baseLevels} + ${adjusted.additionalLevels} ${copy().plannerAdditional}</span>
    </div>
    <ol class="planner-step-list">${adjusted.sequence.map((step) => {
      const tooExpensive = step.adjustedCost >= 40;
      return `
      <li class="${tooExpensive ? "is-too-expensive" : ""}"><span>${escapeHTML(language === "de" ? step.description : step.descriptionEn)}</span>
        <strong>${step.adjustedCost} ${levelLabel}${step.additionalCost ? `<small>${escapeHTML(copy().plannerPriorWorkStep.replace("{levels}", String(step.additionalCost)))}</small>` : ""}${tooExpensive ? `<small class="anvil-warning">${copy().anvilTooExpensive}</small>` : ""}</strong>
      </li>`;
    }).join("")}</ol>`;
}

function renderItem(item) {
  const tasks = item.tasks.map((task) => renderTask(item, task)).join("");
  const upgrade = renderNetheriteUpgrade(item);
  const choices = (item.choices ?? []).map((choice) => renderChoice(item, choice)).join("");
  const materials = `${renderMaterials(item, "crafting")}${renderMaterials(item, "smithing")}`;
    const recipe = RECIPES.find((entry) => entry.itemId === (item.baseItemId ?? item.id)
      && (!entry.editions || entry.editions.includes(edition)));
  const taskCount = item.tasks.length + (item.choices?.length ?? 0) + Number(Boolean(item.netheriteUpgrade)) + (item.materials?.length ?? 0);
  const done = getCompletedTotal(state, [item]);
  const progress = taskCount ? Math.round((done / taskCount) * 100) : 0;
  const categoryName = (language === "de" ? CATEGORIES : CATEGORIES_EN)[item.category];
  const itemName = itemDisplayName(item);
  const isHidden = hiddenItems.has(item.id);
  const itemActions = `
    <button type="button" class="item-drag-handle" draggable="true" data-drag-item="${item.id}" aria-label="${escapeHTML(copy().dragItem.replace("{item}", itemName))}" title="${escapeHTML(copy().dragItem.replace("{item}", itemName))}">⋮⋮</button>
    ${!item.collectionType ? `<button type="button" class="item-action-button" data-duplicate-item="${item.baseItemId ?? item.id}">${copy().duplicateItem}</button>` : ""}
    ${item.customItemId ? `
      <button type="button" class="item-action-button" data-rename-item="${item.id}">${copy().renameItem}</button>
      <button type="button" class="item-action-button item-delete-copy" data-delete-copy="${item.id}">${copy().deleteCopy}</button>
    ` : ""}
    <button type="button" class="item-action-button" data-${isHidden ? "unhide" : "hide"}-item="${item.id}">${isHidden ? copy().unhideItem : copy().hideItem}</button>`;
  const location = language === "de" ? item.location : item.locationEn;
  const locationInfo = location ? `
      <div class="item-location">
        <span class="location-label">${copy().foundAt}</span>
        <p>${escapeHTML(location)}</p>
      </div>` : "";
  return `
    <article class="item-card${progress > 0 ? " has-enchantment" : ""}${isHidden ? " is-hidden" : ""}" data-item-card="${item.id}"${item.customItemId ? ' data-item-copy="true"' : ""}>
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
      <div class="item-custom-actions">${itemActions}</div>
      <div class="item-progress-track"><span style="width:${progress}%"></span></div>
      ${locationInfo}
      <div class="enchantment-list">${tasks}${upgrade}</div>
      ${choices ? `<div class="choice-list">${choices}</div>` : ""}
      ${materials}
      ${renderRecipe(recipe)}
    </article>`;
}

function getActiveItems(items) {
  return items.filter((item) => !hiddenItems.has(item.id));
}

function renderCards() {
  const filtered = getAvailableGearItems()
    .filter((item) => category === "hidden"
      ? hiddenItems.has(item.id)
      : !hiddenItems.has(item.id) && (category === "all" || item.category === category))
    .filter((item) => itemSearchText(item).includes(query));
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
  renderAnvilPlanner();
}

function renderCollectibleCards() {
  const filtered = sortItems(getAvailableItems(COLLECTIBLES))
    .filter((item) => collectibleType === "hidden"
      ? hiddenItems.has(item.id)
      : !hiddenItems.has(item.id) && (collectibleType === "all" || item.collectionType === collectibleType))
    .filter((item) => itemSearchText(item).includes(collectibleQuery));
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
    const items = getActiveItems(panel.dataset.progressScope === "collectibles" ? getAvailableItems(COLLECTIBLES) : getAvailableGearItems());
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
  updateAchievements();
}

function updateCategoryCounts() {
  const allGearItems = getAvailableGearItems();
  const allCollectibles = getAvailableItems(COLLECTIBLES);
  const gearItems = getActiveItems(allGearItems);
  const collectibles = getActiveItems(allCollectibles);
  for (const key of ["all", "armor", "weapons", "tools", "hidden"]) {
    if (key === "hidden") {
      document.querySelector(`[data-count="${key}"]`).textContent = String(allGearItems.filter((item) => hiddenItems.has(item.id)).length);
      continue;
    }
    const count = key === "all" ? gearItems.length : gearItems.filter((item) => item.category === key).length;
    document.querySelector(`[data-count="${key}"]`).textContent = String(count);
  }
  document.querySelector('[data-collectible-count="all"]').textContent = String(collectibles.length);
  document.querySelector('[data-collectible-count="templates"]').textContent = String(collectibles.filter((item) => item.collectionType === "templates").length);
  document.querySelector('[data-collectible-count="music"]').textContent = String(collectibles.filter((item) => item.collectionType === "music").length);
  document.querySelector('[data-collectible-count="hidden"]').textContent = String(allCollectibles.filter((item) => hiddenItems.has(item.id)).length);
}

function updateAchievements() {
  const gearItems = getActiveItems(getAvailableGearItems());
  const collectibles = getActiveItems(getAvailableItems(COLLECTIBLES));
  const allItems = [...gearItems, ...collectibles];
  const completed = getCompletedTotal(state, allItems);
  const total = getTaskTotal(allItems);
  const percent = total ? Math.floor((completed / total) * 100) : 0;
  document.querySelector("#achievement-progress").textContent = `${percent}%`;
  document.querySelector("#milestone-list").innerHTML = [25, 50, 75, 100].map((threshold) => {
    const unlocked = percent >= threshold;
    return `<div class="milestone-card${unlocked ? " is-unlocked" : ""}" aria-label="${threshold}% ${unlocked ? copy().badgeUnlocked : copy().badgeLocked}">${unlocked ? "✓" : "◇"} ${threshold}%</div>`;
  }).join("");

  const badges = [
    { items: gearItems.filter((item) => item.category === "armor"), icon: "◈", name: copy().armorBadge, description: copy().armorBadgeDescription },
    { items: gearItems.filter((item) => item.category === "weapons"), icon: "⚔", name: copy().weaponsBadge, description: copy().weaponsBadgeDescription },
    { items: gearItems.filter((item) => item.category === "tools"), icon: "⚒", name: copy().toolsBadge, description: copy().toolsBadgeDescription },
    { items: collectibles, icon: "♫", name: copy().collectiblesBadge, description: copy().collectiblesBadgeDescription },
    { items: allItems, icon: "✦", name: copy().completionBadge, description: copy().completionBadgeDescription },
  ];
  document.querySelector("#badge-grid").innerHTML = badges.map((badge) => {
    const badgeTotal = getTaskTotal(badge.items);
    const badgeCompleted = getCompletedTotal(state, badge.items);
    const unlocked = badgeTotal > 0 && badgeCompleted === badgeTotal;
    const status = unlocked
      ? copy().badgeUnlocked
      : copy().badgeSteps.replace("{done}", String(badgeCompleted)).replace("{total}", String(badgeTotal));
    return `<article class="badge-card${unlocked ? " is-unlocked" : ""}" aria-label="${escapeHTML(`${badge.name}: ${status}. ${badge.description}`)}"><span class="badge-icon" aria-hidden="true">${badge.icon}</span><strong class="badge-name">${escapeHTML(badge.name)}</strong><span class="badge-status">${escapeHTML(status)}</span></article>`;
  }).join("");
}

function onGridChange(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  const item = getItemById(input.dataset.item);
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
  document.querySelectorAll("#category-tabs .category-tab").forEach((tab) => {
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
  currentPage = location.hash === "#collectibles" ? "collectibles" : location.hash === "#notes" ? "notes" : "enchantments";
  const collectiblesPage = currentPage === "collectibles";
  const notesPage = currentPage === "notes";
  document.querySelector("#enchantments-page").hidden = collectiblesPage || notesPage;
  document.querySelector("#collectibles-page").hidden = !collectiblesPage;
  document.querySelector("#notes-page").hidden = !notesPage;
  document.querySelector(".achievement-section").hidden = notesPage;
  document.querySelector(".glossary-section").hidden = notesPage;
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

editionSelect.addEventListener("change", () => {
  edition = editionSelect.value === "bedrock" ? "bedrock" : "java";
  renderVersionOptions();
  saveProfile();
  renderCards();
  renderCollectibleCards();
});

versionSelect.addEventListener("change", () => {
  selectedVersion = VERSION_PROFILES[edition].some((profile) => profile.version === versionSelect.value)
    ? versionSelect.value
    : VERSION_PROFILES[edition][0].version;
  saveProfile();
  renderCards();
  renderCollectibleCards();
});

grid.addEventListener("change", onGridChange);
collectibleGrid.addEventListener("change", onGridChange);

function onItemReset(event) {
  const button = event.target.closest("button[data-reset-item]");
  if (!button) return;
  const item = getItemById(button.dataset.resetItem);
  if (!item || !window.confirm(copy().confirmResetItem.replace("{item}", itemDisplayName(item)))) return;
  state = resetItemState(state, item.id);
  saveState();
  renderCards();
  renderCollectibleCards();
}

grid.addEventListener("click", onItemReset);
collectibleGrid.addEventListener("click", onItemReset);

function moveItem(sourceId, targetId, placeAfter) {
  const order = getAllOrderedItems().map((item) => item.id);
  const sourceIndex = order.indexOf(sourceId);
  if (sourceIndex < 0 || !order.includes(targetId) || sourceId === targetId) return false;
  order.splice(sourceIndex, 1);
  const targetIndex = order.indexOf(targetId);
  order.splice(targetIndex + Number(placeAfter), 0, sourceId);
  if (!persistLayout(hiddenItems, order)) return false;
  renderCards();
  renderCollectibleCards();
  return true;
}

function attachItemOrdering(container) {
  container.addEventListener("dragstart", (event) => {
    const handle = event.target.closest("button[data-drag-item]");
    if (!handle || !event.dataTransfer) return;
    draggedItemId = handle.dataset.dragItem;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedItemId);
  });
  container.addEventListener("dragover", (event) => {
    const card = event.target.closest("[data-item-card]");
    if (!draggedItemId || !card || card.dataset.itemCard === draggedItemId) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    document.querySelectorAll(".item-card.drop-target").forEach((target) => target.classList.remove("drop-target"));
    card.classList.add("drop-target");
  });
  container.addEventListener("drop", (event) => {
    const card = event.target.closest("[data-item-card]");
    if (!draggedItemId || !card || card.dataset.itemCard === draggedItemId) return;
    event.preventDefault();
    const bounds = card.getBoundingClientRect();
    moveItem(draggedItemId, card.dataset.itemCard, event.clientY > bounds.top + bounds.height / 2);
    draggedItemId = "";
  });
  container.addEventListener("dragend", () => {
    draggedItemId = "";
    document.querySelectorAll(".item-card.drop-target").forEach((card) => card.classList.remove("drop-target"));
  });
  container.addEventListener("keydown", (event) => {
    const handle = event.target.closest("button[data-drag-item]");
    if (!handle || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
    const cards = [...container.querySelectorAll("[data-item-card]")];
    const index = cards.findIndex((card) => card.dataset.itemCard === handle.dataset.dragItem);
    const target = cards[index + (event.key === "ArrowUp" ? -1 : 1)];
    if (!target) return;
    event.preventDefault();
    moveItem(handle.dataset.dragItem, target.dataset.itemCard, event.key === "ArrowDown");
  });
}

attachItemOrdering(grid);
attachItemOrdering(collectibleGrid);

function onItemAction(event) {
  const visibilityButton = event.target.closest("button[data-hide-item], button[data-unhide-item]");
  if (visibilityButton) {
    const itemId = visibilityButton.dataset.hideItem ?? visibilityButton.dataset.unhideItem;
    if (!getItemById(itemId)) return;
    const nextHidden = new Set(hiddenItems);
    if (visibilityButton.hasAttribute("data-hide-item")) nextHidden.add(itemId);
    else nextHidden.delete(itemId);
    if (!persistLayout(nextHidden, itemOrder)) return;
    renderCards();
    renderCollectibleCards();
    return;
  }

  const duplicateButton = event.target.closest("button[data-duplicate-item]");
  if (duplicateButton) {
    const sourceId = duplicateButton.dataset.duplicateItem;
    if (!ITEMS.some((item) => item.id === sourceId)) return;
    const idNumber = Math.max(0, ...customItems.map((item) => Number(item.id.replace("custom-item-", "")))) + 1;
    const copyNumber = Math.max(0, ...customItems.filter((item) => item.sourceId === sourceId).map((item) => item.copyNumber)) + 1;
    const nextCustomItems = [...customItems, {
      id: `custom-item-${idNumber}`,
      sourceId,
      copyNumber,
      customName: "",
    }];
    if (!persistCustomItems(nextCustomItems)) return;
    customItems = nextCustomItems;
    state[`custom-item-${idNumber}`] = { tasks: {}, choices: {} };
    saveState();
    const order = getAllOrderedItems().map((item) => item.id);
    const copyIndex = order.indexOf(`custom-item-${idNumber}`);
    if (copyIndex >= 0) order.splice(copyIndex, 1);
    const sourceIndex = order.indexOf(sourceId);
    order.splice(sourceIndex + 1, 0, `custom-item-${idNumber}`);
    persistLayout(hiddenItems, order);
    if (category === "hidden") {
      category = ITEMS.find((item) => item.id === sourceId).category;
      document.querySelectorAll("#category-tabs .category-tab").forEach((tab) => {
        const active = tab.dataset.category === category;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-pressed", String(active));
      });
    }
    renderCards();
    renderCollectibleCards();
    return;
  }

  const renameButton = event.target.closest("button[data-rename-item]");
  if (renameButton) {
    const item = customItems.find((entry) => entry.id === renameButton.dataset.renameItem);
    if (!item) return;
    const displayName = itemDisplayName(getItemById(item.id));
    const name = window.prompt(copy().renameCopyPrompt.replace("{item}", displayName), item.customName);
    if (name === null) return;
    if (name.trim().length > 60) {
      showStorageNotice(copy().invalidCopyName);
      return;
    }
    const nextCustomItems = customItems.map((entry) => entry.id === item.id ? { ...entry, customName: name.trim() } : entry);
    if (!persistCustomItems(nextCustomItems)) return;
    customItems = nextCustomItems;
    renderCards();
    renderCollectibleCards();
    return;
  }

  const deleteButton = event.target.closest("button[data-delete-copy]");
  if (deleteButton) {
    const item = getItemById(deleteButton.dataset.deleteCopy);
    if (!item || !window.confirm(copy().confirmDeleteCopy.replace("{item}", itemDisplayName(item)))) return;
    const nextCustomItems = customItems.filter((entry) => entry.id !== item.id);
    if (!persistCustomItems(nextCustomItems)) return;
    customItems = nextCustomItems;
    state = resetItemState(state, item.id);
    saveState();
    const nextHidden = new Set(hiddenItems);
    nextHidden.delete(item.id);
    persistLayout(nextHidden, itemOrder.filter((id) => id !== item.id), nextCustomItems);
    renderCards();
    renderCollectibleCards();
  }
}

grid.addEventListener("click", onItemAction);
collectibleGrid.addEventListener("click", onItemAction);

noteChecklistToggle.addEventListener("change", () => {
  noteChecklistFields.hidden = !noteChecklistToggle.checked;
});

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nextId = Math.max(0, ...notes.map((note) => Number(note.id.slice(5)))) + 1;
  const checklist = noteChecklistToggle.checked
    ? noteChecklistInput.value.split(/\r?\n/).map((text) => text.trim()).filter(Boolean).map((text) => ({ text, done: false }))
    : [];
  try {
    const nextNotes = sanitizeNotes([...notes, {
      id: `note-${nextId}`,
      name: noteNameInput.value.trim(),
      createdDate: getLocalDate(),
      description: document.querySelector("#note-description").value.trim(),
      completedDate: null,
      hidden: false,
      checklist,
    }]);
    if (!persistNotes(nextNotes)) return;
    notes = nextNotes;
    noteForm.reset();
    noteChecklistFields.hidden = true;
    noteFilter = "all";
    renderNotes();
    noteNameInput.focus();
  } catch (error) {
    showStorageNotice(`${copy().noteSaveError}: ${error.message}`);
  }
});

noteList.addEventListener("change", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (input.dataset.noteTask) {
    const taskIndex = Number(input.dataset.noteTaskIndex);
    updateNote(input.dataset.noteTask, (note) => ({
      ...note,
      checklist: note.checklist.map((task, index) => index === taskIndex ? { ...task, done: input.checked } : task),
    }));
  }
});

noteList.addEventListener("click", (event) => {
  const completeButton = event.target.closest("button[data-note-complete]");
  if (completeButton) {
    const note = notes.find((entry) => entry.id === completeButton.dataset.noteComplete);
    if (!note) return;
    updateNote(note.id, (entry) => ({
      ...entry,
      completedDate: entry.completedDate ? null : getLocalDate(),
    }));
    return;
  }
  const visibilityButton = event.target.closest("button[data-note-visibility]");
  if (visibilityButton) {
    const note = notes.find((entry) => entry.id === visibilityButton.dataset.noteVisibility);
    if (!note) return;
    updateNote(note.id, (entry) => ({ ...entry, hidden: !entry.hidden }));
  }
});

noteFilterButtons.forEach((button) => button.addEventListener("click", () => {
  noteFilter = button.dataset.noteFilter;
  renderNotes();
}));

resetButtons.forEach((resetButton) => resetButton.addEventListener("click", () => {
  if (!window.confirm(copy().confirmReset)) return;
  state = {};
  saveState();
  renderCards();
  renderCollectibleCards();
}));

plannerItemSelect.addEventListener("change", () => {
  plannerItemId = plannerItemSelect.value;
  renderAnvilPlanner();
});

plannerWorkSelect.addEventListener("change", () => {
  plannerPriorWorkCount = Number(plannerWorkSelect.value);
  renderAnvilPlanner();
});

function exportBackup() {
  const backup = {
    app: "enchanting-desk",
    formatVersion: 1,
    createdAt: new Date().toISOString(),
    progress: sanitizeChecklistState(state, customItems),
    customItems: sanitizeCustomItems(customItems),
    layout: sanitizeChecklistLayout({ hidden: [...hiddenItems], order: itemOrder }, customItems),
    notes: sanitizeNotes(notes),
    preferences: { language, edition, version: selectedVersion },
  };
  const blob = new Blob([`${JSON.stringify(backup, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cmc-backup-${backup.createdAt.slice(0, 10)}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  showStorageNotice(copy().backupExportSuccess);
}

async function importBackup(file) {
  if (!file) return;
  try {
    if (file.size > 1024 * 1024) throw new Error(copy().backupFileTooLarge);
    const backup = JSON.parse(await file.text());
    if (!backup || typeof backup !== "object" || Array.isArray(backup) || backup.app !== "enchanting-desk") {
      throw new Error(copy().backupInvalid);
    }
    if (backup.formatVersion !== 1) throw new Error(copy().backupVersionUnsupported);
    const preferences = backup.preferences;
    if (!preferences || !["en", "de"].includes(preferences.language)
      || !["java", "bedrock"].includes(preferences.edition)
      || !SUPPORTED_VERSIONS.includes(preferences.version)) {
      throw new Error(copy().backupInvalid);
    }
    const importedCustomItems = sanitizeCustomItems(backup.customItems);
    const importedProgress = sanitizeChecklistState(backup.progress, importedCustomItems);
    const importedLayout = sanitizeChecklistLayout(backup.layout ?? { hidden: [], order: [] }, importedCustomItems);
    const importedNotes = sanitizeNotes(backup.notes ?? []);
    if (!window.confirm(copy().backupImportConfirm)) return;
    if (!persistBackup(importedProgress, importedCustomItems, importedLayout, importedNotes, preferences)) return;
    state = importedProgress;
    customItems = importedCustomItems;
    hiddenItems = new Set(importedLayout.hidden);
    itemOrder = importedLayout.order;
    notes = importedNotes;
    noteFilter = "all";
    language = preferences.language;
    edition = preferences.edition;
    selectedVersion = preferences.version;
    languageSelect.value = language;
    editionSelect.value = edition;
    renderVersionOptions();
    translateStaticText();
    renderCards();
    renderCollectibleCards();
    renderNotes();
    showStorageNotice(copy().backupImportSuccess);
  } catch (error) {
    showStorageNotice(`${copy().backupImportError}: ${error.message}`);
  } finally {
    backupFileInput.value = "";
  }
}

document.querySelector("#backup-export").addEventListener("click", exportBackup);
document.querySelector("#backup-import").addEventListener("click", () => backupFileInput.click());
backupFileInput.addEventListener("change", () => importBackup(backupFileInput.files[0]));

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    if (currentPage === "notes") noteNameInput.focus();
    else (currentPage === "collectibles" ? collectibleSearchInput : searchInput).focus();
  }
});

readState();
languageSelect.value = language;
editionSelect.value = edition;
renderVersionOptions();
translateStaticText();
renderCards();
renderCollectibleCards();
noteChecklistFields.hidden = true;
renderNotes();
updatePage();
