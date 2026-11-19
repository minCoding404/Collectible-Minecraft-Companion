# Minecraft Enchantment Checklist

An interactive, bilingual (English/German) checklist for planning Minecraft armor, weapons, and tools using the [Minecraft Wiki Best Enchantments Guide](https://minecraft.wiki/w/Tutorial:Best_enchantments_guide).

## Features

- Check off enchantments and track overall and per-item progress.
- Choose between mutually exclusive enchantments, such as protection types.
- Track when eligible diamond equipment has been upgraded to Netherite.
- See enchantment explanations on hover or keyboard focus.
- View the guide's book-combination order and level costs on applicable item cards.
- Switch between English and German; checklist progress and language preference are saved in your browser.
- View Minecraft item artwork when connected to the internet.

The app is static and needs no backend, account, or third-party package installation. Checklist data is stored locally in your browser.

## Run locally

1. Install Git. To run the tests, also install Node.js (npm is included with Node.js).
2. Clone the repository and enter its folder:

   ```sh
   git clone https://github.com/minCoding404/mcEnchantmentChecklist.git
   cd mcEnchantmentChecklist
   ```

3. Start a local static web server from the repository folder:

   **Windows (Python launcher):**

   ```powershell
   py -m http.server 4173
   ```

   **macOS or Linux:**

   ```sh
   python3 -m http.server 4173
   ```

4. Open [http://localhost:4173](http://localhost:4173) in your browser. Keep the server running while using the app.

No `npm install` is needed to run the app. A local web server is required because the app uses JavaScript modules.

## Run tests

With Node.js installed, run the data and checklist tests from the repository folder:

```sh
npm test
```
