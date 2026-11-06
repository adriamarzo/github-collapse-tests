# GitHub PR - Collapse tests

Chrome extension that adds a purple **Collapse tests** button next to **Submit review** on a pull request's *Files changed* page. One click collapses every test file, a second click expands them again.

A file counts as a test when its path ends in `.test.*` or `.spec.*` (`.js`, `.jsx`, `.ts`, `.tsx`) or lives under `__tests__/`.

## Install

1. Clone this repo.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and pick the cloned folder.

To update: `git pull`, then click the reload icon on the extension card.
