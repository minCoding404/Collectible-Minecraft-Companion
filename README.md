# Collectible Minecraft Companion (CMC)

An interactive, bilingual (English/German) companion for Minecraft enchantments, gear, collectibles, and dated notes with nested checklists.

See [Infrastructure and accessibility](INFRASTRUCTURE.md) for the application architecture, data flow, local storage, and accessibility guidance.

## Features

- Check off enchantments and track overall and per-item progress.
- Reset one item's checklist without clearing progress on other items.
- Choose between mutually exclusive enchantments, such as protection types.
- Track when eligible diamond equipment has been upgraded to Netherite.
- See enchantment explanations on hover or keyboard focus.
- View the guide's book-combination order and level costs on applicable item cards.
- Estimate anvil costs in an interactive planner, including prior-work penalties on the target item.
- Flag individual Survival/Adventure anvil operations that reach the 40-level "Too Expensive!" limit.
- Duplicate gear beside its source to track alternative enchantment choices independently, and optionally rename each copy.
- Move hidden gear and collectibles into their own tabs without deleting progress; reorder items with drag and drop or arrow keys.
- Export and restore a JSON backup containing progress, notes, custom copies, item visibility/order, and profile preferences.
- Switch between separate Enchantments and Collectibles pages, with independent filters and progress.
- Track all current smithing templates and music discs, including where to find them.
- Create dated notes with names, descriptions, optional checklists, completion dates, and a dedicated Hidden tab.
- Choose Java or Bedrock release profiles from 1.16/1.16.0 to 1.21.11/1.21.130; unavailable items and enchantments are filtered by edition and introduction version.
- Check off crafting ingredients and Netherite smithing materials per item.
- Earn set badges and 25%, 50%, 75%, and 100% checklist milestones.
- Use the in-app glossary to look up Minecraft checklist terminology.
- Restore hidden items and notes from their Hidden tabs without losing progress.
- Switch between English and German; checklist progress and language preference are saved in your browser.
- View Minecraft item artwork when connected to the internet.

The app needs no backend or account. Checklist data is stored locally in your browser.

Collectible locations and anvil level limits are included in the app.

## Notes, hidden entries, and duplicates

Open the **Notes** page to add a note with a name, automatically recorded creation date, and description. Enable **Create a checklist from this note** and enter one task per line to track its subtasks independently. Completing a note automatically records the current date; it can be reopened or moved to the Hidden tab.

Hidden gear and collectibles appear in their own tabs and can be restored at any time. Original items cannot be deleted; gear copies can be renamed, hidden, and deleted. Copies keep separate enchantment progress from the original.

The footer identifies the project as **Collectible Minecraft Companion (CMC)** and includes this disclaimer: “NOT AN OFFICIAL MINECRAFT SERVICE. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.”

## Run locally

1. Install Git and [Node.js 18 or later](https://nodejs.org/) (npm is included with Node.js).
2. Clone the repository and enter its folder:

   ```sh
   git clone https://github.com/minCoding404/mcEnchantmentChecklist.git
   cd mcEnchantmentChecklist
   ```

3. Install the project dependencies:

   ```sh
   npm install
   ```

4. Start the development server:

   ```sh
   npm run dev
   ```

   Or use `npm start`.

5. Open the URL printed by Vite (normally [http://localhost:5173](http://localhost:5173)). Keep the server running while using the app.

## Run tests

With Node.js installed, run the data and checklist tests from the repository folder:

```sh
npm test
```
