# Development Guide

## Prerequisites

### Web development

- NVM
- Node.js `lts/jod` (at least Node.js 22.22.3), matching `.nvmrc` and the release workflow
- npm
- Ionic CLI available as `ionic`

### Shell and NVM setup

The command examples in this repository target **Bash** on Linux, macOS,
or Windows WSL. If your usual shell is fish, start `bash` before using them.
`nvm.fish` is a separate implementation; its functions are unavailable in Bash.

Check for the Bash NVM installation:

```bash
test -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
```

If this check fails, agents must ask the user for permission before installing
NVM. After approval, follow the official
[NVM installation instructions](https://github.com/nvm-sh/nvm#installing-and-updating).
Use the default `~/.nvm` location, or set `NVM_DIR` to your existing Bash NVM
installation. Keep an existing fish installation separate.

After NVM is installed, install the required Node release from the project root:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm install lts/jod
```

Every npm command block below explicitly loads NVM and selects `lts/jod`.
This also works in noninteractive Bash sessions that do not load `.bashrc`.
Run each block from the project root. Stop if loading NVM or selecting Node fails;
do not fall back to the system Node version.

Angular 22 requires TypeScript 6.0 and Node.js 22.22.3 or newer on the
Node.js 22 line. If your installed `lts/jod` is older, run `nvm install lts/jod`
after loading Bash NVM.

Install exact project dependencies with:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm use lts/jod && npm ci
```

If needed, install Ionic CLI globally:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm use lts/jod && npm install --global @ionic/cli
```

The committed `.nvmrc` uses the named `lts/jod` alias. Do not replace it with another Node release or add `.tool-versions` unless the team intentionally changes version-management tools.

### Desktop development

Install Rust stable and the Tauri 2 prerequisites for your operating system. `src-tauri/Cargo.toml` declares Rust 1.77.2 as the minimum supported Rust version.

## Web workflow

Start the Ionic development server:

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

The production web output is generated under `www/`. Do not edit that directory manually.

## Code formatting

Use an editor Prettier plugin for files you change. The root `.prettierrc` is the repository's shared formatting configuration and is discovered automatically by compatible plugins.

Its main rules are:

- 80-character print width
- two spaces, not tabs
- semicolons
- single quotes
- no trailing commas
- opening brackets kept on the same line where supported

For VS Code, install the recommended `esbenp.prettier-vscode` extension, select Prettier as the formatter, and use **Format Document** or format-on-save. Do not introduce personal overrides that conflict with `.prettierrc`, and do not reformat unrelated files during a focused change.

Prettier is currently an editor workflow; the repository does not declare a Prettier npm dependency or formatting script. Do not claim a CLI formatting check exists unless one is added later.

## Dependency compatibility

Angular major upgrades must run `ng update` one major at a time. The Angular
21 and 22 migrations preserve Zone.js with `provideZoneChangeDetection()`
and explicitly select `ChangeDetectionStrategy.Eager` for existing components.
Ionic 9 standalone components are imported from `@ionic/angular`.

ESLint 10 uses `eslint.config.cjs`; the old `.eslintrc.json` format is no longer
supported. The flat configuration retains the Angular template and selector rules.
Unused legacy ESLint plugins and the unused Jasmine spec reporter were removed.
Tests use the replacement `@angular/platform-browser/testing` API, so the
deprecated `@angular/platform-browser-dynamic` package is no longer needed.
The unused `@angular/animations` package was also removed; Ionic manages its
own animations.

The browser target follows Angular 22's widely available Baseline date,
2026-05-07. Older browser versions outside that baseline are no longer targeted.

Two scoped npm overrides apply upstream security fixes: Angular's build package
uses Vite 8.3.5 or newer within v8, and Capacitor's Xcode parser uses UUID 11.1.1
or newer within v11. Xcode uses the compatible CommonJS `uuid.v4()` API.
Revisit these overrides when upstream packages include the patched versions.

## Tauri workflow

Run Tauri commands through the npm script:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm use lts/jod && npm run tauri dev
nvm use lts/jod && npm run tauri build
```

Tauri development intentionally expects the frontend at `http://localhost:8103`. `devUrl` tells Tauri where to connect, and `beforeDevCommand` runs `npm run ng -- serve --host=0.0.0.0 --port=8103` to serve the frontend on the matching port without opening a browser. This uses the project's Angular CLI and does not require a global Ionic CLI installation. Keep these settings aligned when changing Tauri or serve configuration.

The desktop wrapper is under `src-tauri/`. Do not edit generated `src-tauri/target/` or `src-tauri/gen/` content.

## Data storage

Court Pilot has no backend API. It stores domain data in IndexedDB using Dexie. The database and schema are declared in root-level `db.ts`.

Changing an interface in `db.ts` may require a database migration for existing users. Follow `.agents/skills/database-change/SKILL.md` for schema work.

The selected UI language is stored separately in browser local storage under the `language` key.

## Localization workflow

English and Hungarian are both required for user-facing text.

1. Add the same translation key to `en` and `hu` in `src/app/i18n/translations.ts`.
2. Preserve identical placeholder names, such as `{courtNo}`, in both translations.
3. Use `TranslatePipe` in templates.
4. Use `TranslationService` for alerts or other strings created in TypeScript.
5. Build the application so strict translation-key and template typing is checked.

## Manual release versioning

Court Pilot uses one application version across its JavaScript, Rust, Tauri, and Snap packages. Releases are updated manually; there is no version synchronization script.

### Select the next version

Before changing files, review commits since the latest release tag and recommend a Semantic Versioning bump:

- Breaking change (`!` or `BREAKING CHANGE:`) → major
- Backward-compatible `feat` → minor
- Backward-compatible `fix` or `perf` → patch
- Documentation, tests, refactoring, build, CI, chores, and style changes normally do not require a bump by themselves

Use the highest applicable bump. Because older repository commits do not consistently follow Conventional Commits, inspect the implementation and configuration diff since the latest tag whenever the messages are ambiguous. Base the recommendation on shipped behavior, data compatibility, packaging, and supported platforms—not only commit wording.

Show the current version, latest tag, recommendation, bump type, and reasoning to the developer. The developer may accept the recommendation or enter a different semantic version. Do not update files until the developer confirms the final version. Warn before using a version that is not greater than the current release or before using a prerelease identifier.

During release version confirmation, ask whether to run the test suite or skip it. Running tests is the default; skip them only when the developer explicitly chooses to skip. Record any skipped tests in the release validation report. Lint, build, and Cargo checks still apply.

### Synchronize the selected version

After confirmation, set the same semantic version in:

1. `package.json` — top-level `version`
2. `package-lock.json` — root package `version`
3. `src-tauri/tauri.conf.json` — top-level `version`
4. `src-tauri/Cargo.toml` — `[package].version`
5. `src-tauri/Cargo.lock` — the `court-pilot` package entry, normally refreshed by Cargo
6. `snap/snapcraft.yaml` — top-level `version`
7. The version displayed by `src/app/tab3/tab3.page.html`

The current Settings page contains a hardcoded version. Until it is changed to consume build metadata, it must be updated manually for every release.

After editing `Cargo.toml`, run from `src-tauri/`:

```sh
cargo check
```

This validates the Rust package and refreshes its lockfile metadata when needed.

Then verify that all version declarations match and run the checks in `docs/testing.md`, honoring the developer's test choice.

### Create the release tag

The synchronized version changes must be committed before tagging. Git tags point to commits and do not include uncommitted working-tree changes. Verify that the intended release commit contains every version update and that the tracked working tree is clean.

Release tags are lightweight tags, matching the repository's existing convention. Confirm the tag does not already exist, then create it with the selected version prefixed by `v`:

```sh
GIT_EDITOR=true git tag v1.2.0
```

Replace `1.2.0` with the confirmed release version and verify the tag points to the intended commit. Do not overwrite or move an existing release tag.

Creating the tag is local. Pushing it starts `.github/workflows/release.yml`, which builds Windows and macOS artifacts for CrabNebula and builds/publishes the Linux Snap. Push only after explicit confirmation:

```sh
git push origin v1.2.0
```

## Generated and local directories

Do not manually edit or commit generated/dependency content unless a workflow explicitly requires an artifact:

- `node_modules/`
- `.angular/`
- `www/`
- `coverage/`
- `src-tauri/target/`
- `src-tauri/gen/`
- generated `snap-root/`
