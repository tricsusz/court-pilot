# Court Pilot

Court Pilot is a local-first web and desktop application for managing badminton court officials, waiting rotations, and court assignments. It supports optional service judges and an English/Hungarian interface.

## Current stack

- Angular 22 and Ionic Angular 9
- Dexie / IndexedDB local persistence
- Angular CDK drag and drop
- Tauri 2 desktop application
- Jasmine and Karma tests

## Main workflows

The application has three routes:

- **Pilot** — assign officials to courts and manage waiting rotations
- **Court Officials** — maintain the official roster
- **Settings** — configure court count, service judges, confirmation alerts, and language

Application data is stored locally in the browser/webview through IndexedDB. No server-side API is currently present in this repository.

## Prerequisites

For web development:

- NVM with the Node.js `lts/jod` release (Node.js 22)
- npm
- Ionic CLI available on the command line

For desktop development, also install:

- Rust stable; the crate declares a minimum Rust version of 1.77.2
- The platform prerequisites required by Tauri 2

## Install

These commands target **Bash** (Linux, macOS, or Windows WSL). From fish,
start `bash` first. Follow the [shell and NVM setup](docs/development.md#shell-and-nvm-setup)
before continuing. If Bash NVM is missing, agents must ask permission before
installing it. `.nvmrc` declares `lts/jod`:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm install lts/jod
nvm use lts/jod && npm ci
```

Each npm command block loads Bash NVM explicitly and selects the required Node
version, including in fresh noninteractive shells.

If Ionic CLI is not already installed:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm use lts/jod && npm install --global @ionic/cli
```

## Web development

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm use lts/jod && npm start
```

Build the Angular application:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm use lts/jod && npm run build
```

Run linting and tests:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm use lts/jod && npm run lint
nvm use lts/jod && npm test
```

`npm test` starts Karma in its configured mode and may remain open in watch mode.

## Code formatting

Use the Prettier plugin in your editor to format files you change. The repository already provides `.prettierrc` at its root, and compatible editor plugins discover it automatically. Use the project configuration rather than personal Prettier overrides, and avoid reformatting unrelated files.

For VS Code, the recommended extension is `esbenp.prettier-vscode`. Use **Format Document** or enable format-on-save after selecting Prettier as the formatter.

## Desktop development

The Tauri CLI is available through:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm use lts/jod && npm run tauri -- <command>
```

For example:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm use lts/jod && npm run tauri -- dev
nvm use lts/jod && npm run tauri -- build
```

> Tauri development intentionally uses `http://localhost:8103`. The current `npm start` script does not explicitly select that port, so verify that Ionic is listening on `8103` when using `tauri dev`.

## Persistence

The database is declared in `db.ts` and currently uses Dexie schema version 1. Data includes:

- court officials
- active umpire assignments
- active service-judge assignments
- umpire and service-judge waiting queues
- application settings

Released schema changes must use a new Dexie version and an explicit migration strategy.

## Localization

Translations are defined in `src/app/i18n/translations.ts`. English (`en`) and Hungarian (`hu`) are currently supported. Add new user-facing keys to both languages.

## Desktop releases

Pushing a tag matching `v*` triggers `.github/workflows/release.yml`. The workflow:

1. Creates a CrabNebula draft release.
2. Builds and uploads Windows packages.
3. Builds and uploads Apple Silicon and Intel macOS packages.
4. Builds and publishes a Linux Snap.
5. Publishes the CrabNebula release.

The workflow requires repository secrets for CrabNebula, Tauri signing, and Snap publication. Linux updates are managed by Snap; Windows and macOS use the Tauri updater configured in `src-tauri/tauri.conf.json`.

## Supported platforms

Browser/web, Windows, macOS, and Linux Snap are supported. Android and iOS are not supported or planned at this stage, although Capacitor configuration remains for possible future use.

## Project documentation

- `AGENTS.md` — instructions for coding agents
- `docs/architecture.md` — current technical structure and data flow
- `docs/domain-glossary.md` — confirmed terminology and business rules
- `docs/development.md` — local setup, development workflows, and manual versioning
- `docs/testing.md` — test and validation guidance

## License

MIT — see `LICENSE`.
