# Minecraft Enchantment Checklist

An interactive, bilingual (English/German) checklist for planning Minecraft armor, weapons, and tools using the [Minecraft Wiki Best Enchantments Guide](https://minecraft.wiki/w/Tutorial:Best_enchantments_guide).

## Features

- Check off enchantments and track overall and per-item progress.
- Reset one item's checklist without clearing progress on other items.
- Choose between mutually exclusive enchantments, such as protection types.
- Track when eligible diamond equipment has been upgraded to Netherite.
- See enchantment explanations on hover or keyboard focus.
- View the guide's book-combination order and level costs on applicable item cards.
- Switch between separate Enchantments and Collectibles pages, with independent filters and progress.
- Track all current smithing templates and music discs, including where to find them.
- Choose Java or Bedrock release profiles from 1.16/1.16.0 to 1.21.11/1.21.130; unavailable items and enchantments are filtered by edition and introduction version.
- Check off crafting ingredients and Netherite smithing materials per item.
- Earn set badges and 25%, 50%, 75%, and 100% checklist milestones.
- Use the in-app glossary to look up Minecraft checklist terminology.
- Switch between English and German; checklist progress and language preference are saved in your browser.
- View Minecraft item artwork when connected to the internet.

The app needs no backend or account. Checklist data is stored locally in your browser.

Collectible locations are linked to the [Minecraft Wiki smithing template](https://minecraft.wiki/w/Smithing_Template) and [music disc](https://minecraft.wiki/w/Music_Disc) pages.

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

5. Open [http://localhost:4173](http://localhost:4173) in your browser. Keep the server running while using the app.

## Run tests

With Node.js installed, run the data and checklist tests from the repository folder:

```sh
npm test
```
