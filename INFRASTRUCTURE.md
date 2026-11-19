# Infrastructure and accessibility

This document describes how Collectible Minecraft Companion (CMC) is put together, where it stores data, and how its interface supports accessible use.

## Architecture at a glance

CMC is a client-side web application. It has no application server, database, account system, or server-side API.

- **Browser:** Runs the interface and all checklist, note, filter, and planner logic.
- **Vite:** Serves the files during local development. It is the only development dependency.
- **`index.html`:** Defines the page landmarks, navigation, forms, and checklist regions.
- **`app.js`:** Handles interactions, language and edition profiles, rendering, browser storage, and backup import/export.
- **`data.js`:** Holds item, enchantment, material, collectible, recipe, and profile data, plus validation helpers.
- **`styles.css`:** Defines the responsive visual design, focus indicators, animations, and reduced-motion behavior.
- **`tests/`:** Contains Node.js tests for data, validation, and checklist behavior.

### Request and update flow

1. The browser requests `index.html`, `styles.css`, and the JavaScript modules from the local Vite server or a static web host.
2. `app.js` reads saved progress and preferences from `localStorage`.
3. `data.js` supplies the item and recipe data used to render the selected edition, version, language, and page.
4. User actions update the in-memory state, then save it to `localStorage`.
5. Backup export serializes the saved state as JSON. Backup import validates the data before replacing the current browser state.

The page uses JavaScript modules, so it should be served over HTTP or HTTPS rather than opened directly as a `file://` URL.

## Data storage and external resources

Checklist data stays in the browser profile for the current site origin. It is not synchronized between browsers or devices. Clearing the browser's site data removes the saved state, so export a backup before clearing it.

CMC uses these `localStorage` entries:

- `enchanting-desk.checklist.v1` for item progress.
- `enchanting-desk.custom-items.v1` for duplicated gear and custom names.
- `enchanting-desk.layout.v1` for hidden items and item order.
- `enchanting-desk.notes.v1` for notes and their checklists.
- `enchanting-desk.language`, `enchanting-desk.edition`, and `enchanting-desk.version` for profile preferences.

JSON backups include progress, notes, custom items, layout, and profile preferences. Imported notes, item data, and layout values are checked against supported fields and limits before they are stored.

The application does not need a network connection for checklist logic or saved progress. Item artwork is loaded from remote image URLs, and the stylesheet imports fonts from Google Fonts; those visual assets may not load offline. Clickable Minecraft Wiki source links have been removed.

## Accessibility

The interface includes the following accessibility features:

- Semantic `header`, `nav`, `main`, `section`, `form`, and `footer` landmarks with heading relationships.
- Native buttons, inputs, checkboxes, radio buttons, and selects with visible or programmatic labels.
- Visible keyboard focus indicators on interactive controls.
- `aria-pressed` states for page filters and category controls; progress bars expose their current values.
- Polite live regions for changing checklists, notes, planner results, badges, and storage notices.
- A keyboard alternative for drag ordering: focus an item's drag handle and use the Up or Down arrow key. The `/` shortcut focuses the current page's search or note-name field.
- Decorative artwork is hidden from assistive technology, and the stylesheet reduces animation when `prefers-reduced-motion` is enabled.
- English and German interface text is applied to document language and page content.

### Accessibility maintenance

When adding or changing interface elements:

- Keep heading levels in order and give each new page or section a clear heading.
- Associate every input with a visible label; do not rely on placeholder text as its only label.
- Keep actions usable by keyboard and provide visible focus. If a drag action is added, include a non-drag alternative.
- Announce meaningful dynamic changes without making large regions excessively chatty.
- Preserve reduced-motion support and do not communicate state through color alone.
- Add translations for both supported languages and keep the document language synchronized.
- Check the result at narrow widths and with keyboard navigation and a screen reader.

The repository does not currently include an automated accessibility audit. Manual assistive-technology testing is still needed before claiming full WCAG conformance.

## Local development and tests

Install Node.js 18 or later, then run:

```sh
npm install
npm run dev
```

Vite binds to `127.0.0.1` and uses its default development port, `5173` (or the next available port if it is occupied). Open the URL printed by Vite.

Run the test suite with:

```sh
npm test
```

The `test` script runs Node's built-in test runner. `package.json` does not currently define a production build or deployment script.
