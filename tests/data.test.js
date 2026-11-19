import test from "node:test";
import assert from "node:assert/strict";
import {
  CATEGORIES,
  CATEGORIES_EN,
  CHOICE_LABELS_EN,
  ENCHANTMENT_INFO,
  ENCHANTMENT_INFO_EN,
  ALL_ITEMS,
  COLLECTIBLES,
  ITEMS,
  MUSIC_DISCS,
  RECIPES,
  SMITHING_TEMPLATES,
  getCompletedTotal,
  getTaskTotal,
  resetItemState,
} from "../data.js";

test("the guide checklist includes every armor, weapon, and tool item", () => {
  assert.equal(ITEMS.length, 22);
  assert.deepEqual(
    Object.fromEntries(Object.keys(CATEGORIES).map((category) => [
      category,
      (category === "collectibles" ? COLLECTIBLES : ITEMS).filter((item) => item.category === category).length,
    ])),
    { armor: 5, weapons: 7, tools: 10, collectibles: 41 },
  );
  assert.equal(new Set(ITEMS.map((item) => item.id)).size, ITEMS.length);
});

test("collectible checklists cover every current smithing template and music disc with a location", () => {
  assert.equal(SMITHING_TEMPLATES.length, 19);
  assert.equal(MUSIC_DISCS.length, 22);
  assert.equal(COLLECTIBLES.length, 41);
  assert.equal(ALL_ITEMS.length, 63);
  assert.equal(getTaskTotal(), 142);
  assert.equal(new Set(COLLECTIBLES.map((item) => item.id)).size, COLLECTIBLES.length);
  assert.equal(COLLECTIBLES.filter((item) => item.collectionType === "templates").length, 19);
  assert.equal(COLLECTIBLES.filter((item) => item.collectionType === "music").length, 22);
  for (const item of COLLECTIBLES) {
    assert.ok(item.location, `Missing German location for ${item.id}`);
    assert.ok(item.locationEn, `Missing English location for ${item.id}`);
    assert.ok(item.sourceUrl.startsWith("https://minecraft.wiki/"), `Missing source link for ${item.id}`);
    assert.equal(item.tasks.length, 1, `${item.id} should have one collection checkbox`);
  }
});

test("every exclusive choice is represented as one selection task", () => {
  const choiceGroups = ITEMS.flatMap((item) => item.choices ?? []);
  assert.ok(choiceGroups.length > 0);
  for (const item of ITEMS) {
    for (const choice of item.choices ?? []) {
      assert.ok(choice.options.length > 1, `${item.id}/${choice.id} should offer alternatives`);
      assert.equal(new Set(choice.options.map((option) => option.id)).size, choice.options.length);
      assert.ok(!item.tasks.some((task) => choice.options.some((option) => option.id === task.id)));
    }
  }
  assert.ok(ITEMS.find((item) => item.id === "boots").choices.some((choice) => choice.id === "movement"));
  assert.ok(ITEMS.find((item) => item.id === "bow").choices.some((choice) => choice.id === "repair"));
  assert.ok(ITEMS.find((item) => item.id === "helmet").choices.some((choice) => choice.id === "protection"));
  assert.ok(ITEMS.find((item) => item.id === "crossbow").choices.some((choice) => choice.id === "projectile"));
  assert.ok(ITEMS.find((item) => item.id === "trident").choices.some((choice) => choice.id === "throwing"));
});

test("every checklist enchantment has a hover explanation", () => {
  const enchantments = ITEMS.flatMap((item) => [
    ...item.tasks.map((task) => task.english),
    ...(item.choices ?? []).flatMap((choice) => choice.options.map((option) => option.english)),
  ]);
  for (const enchantment of enchantments) {
    assert.ok(ENCHANTMENT_INFO[enchantment], `Missing hover explanation for ${enchantment}`);
    assert.ok(ENCHANTMENT_INFO_EN[enchantment], `Missing English hover explanation for ${enchantment}`);
  }
});

test("category labels, choice labels, and book steps have English translations", () => {
  assert.deepEqual(Object.keys(CATEGORIES_EN), Object.keys(CATEGORIES));
  const choiceLabels = ITEMS.flatMap((item) => (item.choices ?? []).map((choice) => choice.label));
  for (const label of choiceLabels) assert.ok(CHOICE_LABELS_EN[label], `Missing English choice label for ${label}`);
  for (const recipe of RECIPES) {
    for (const step of recipe.sequence) assert.ok(step.descriptionEn, `Missing English recipe step for ${recipe.item}`);
    if (recipe.note) assert.ok(recipe.noteEn, `Missing English recipe note for ${recipe.item}`);
  }
});

test("progress counts checked enchantments and one selected option per exclusive group", () => {
  const item = ITEMS.find((entry) => entry.id === "boots");
  assert.equal(getTaskTotal([item]), item.tasks.length + item.choices.length);
  assert.equal(getCompletedTotal({
    boots: { tasks: { mending: true, "feather-falling": true }, choices: { protection: "protection", movement: "depth-strider" } },
  }, [item]), 4);
});

test("diamond-tier equipment can track a Netherite upgrade", () => {
  const upgradeableIds = ["helmet", "chestplate", "leggings", "boots", "sword", "spear", "axe", "pickaxe", "shovel", "hoe"];
  const upgradeableItems = ITEMS.filter((item) => item.netheriteUpgrade);
  assert.deepEqual(upgradeableItems.map((item) => item.id), upgradeableIds);
  assert.equal(getTaskTotal(upgradeableItems), upgradeableItems.reduce(
    (total, item) => total + item.tasks.length + (item.choices?.length ?? 0) + 1,
    0,
  ));
  const completedState = Object.fromEntries(upgradeableIds.map((id) => [id, { tasks: { "netherite-upgrade": true } }]));
  assert.equal(getCompletedTotal(completedState, upgradeableItems), upgradeableItems.length);
});

test("resetting one item preserves progress on every other item", () => {
  const state = {
    helmet: { tasks: { mending: true }, choices: { protection: "protection" } },
    boots: { tasks: { "feather-falling": true }, choices: { movement: "depth-strider" } },
  };
  const reset = resetItemState(state, "helmet");
  assert.equal(getCompletedTotal(reset), 2);
  assert.equal(reset.helmet, undefined);
  assert.deepEqual(reset.boots, state.boots);
  assert.deepEqual(state.helmet.tasks, { mending: true });
});

test("published recipe totals match their listed anvil step costs", () => {
  const expectedTotals = { Helm: 27, Brustplatte: 13, Beinschutz: 28, Stiefel: 30, Schwert: 49, Bogen: 29, Elytren: 6 };
  assert.deepEqual(Object.fromEntries(RECIPES.map(({ item, levels }) => [item, levels])), expectedTotals);
  assert.ok(RECIPES.every((recipe) => ITEMS.some((item) => item.id === recipe.itemId)));
  assert.ok(RECIPES.every((recipe) => recipe.sequence.reduce((total, step) => total + step.cost, 0) === recipe.levels));
});
