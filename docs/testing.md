# Testing and Validation

## Test stack

Angular unit tests use Jasmine and Karma. Test files are colocated with their subjects as `*.spec.ts`. Karma launches Chrome by default and keeps running in watch mode for local development.

Jasmine is kept on the compatible 6.x line. Jasmine 7 does not support Karma
or Zone.js. The npm overrides make Karma adapters use the same Jasmine core
as the app rather than installing an older nested copy.

## Local test commands

These examples target Bash and run from the project root. Complete the
[shell and NVM setup](development.md#shell-and-nvm-setup) first. Agents must ask
permission before installing missing Bash NVM. Each npm block loads NVM explicitly.

Run the interactive test suite:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm use lts/jod && npm test
```

Run the configured non-watching CI test mode:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm use lts/jod && npm test -- --configuration=ci
```

The test environment requires an available Chrome installation. Test coverage output, when enabled by the test runner, is written under `coverage/app/`.

Run the suite once in headless Chrome with a coverage report:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm use lts/jod && npm test -- --watch=false --browsers=ChromeHeadless --code-coverage
```

If Chrome is not auto-detected, set `CHROME_BIN` to its executable path
(for example, `/snap/bin/chromium`) before running the command. Open
`coverage/app/index.html` to inspect coverage by file.

The queue and assignment service tests exercise real browser IndexedDB, clearing
their tables before and after each test. Court rotation page tests use service
spies and signals to isolate assignments, confirmation, and role swaps.

## Lint and build

Lint TypeScript and Angular templates:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm use lts/jod && npm run lint
```

Build the production Angular application:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm use lts/jod && npm run build
```

Check Rust changes from the Tauri directory:

```sh
cargo check
```

## What to validate

Choose checks based on the changed area:

| Change                         | Expected validation                                                  |
| ------------------------------ | -------------------------------------------------------------------- |
| Documentation only             | Markdown/editor diagnostics and `git diff --check`                   |
| Angular TypeScript or template | Related tests, `npm run lint`, and `npm run build`                   |
| Service or domain behavior     | Behavior-focused service/page tests, lint, and build                 |
| Dexie schema or migration      | Migration tests where practical, lint, and build                     |
| Styles only                    | Build and visual verification at relevant viewport sizes             |
| Rust code                      | `cargo check` plus relevant Rust tests if introduced                 |
| Tauri/release configuration    | Build/config checks available on the host; report untested platforms |

## Testing conventions

- Prefer behavior assertions over tests that only check whether a service or component was created.
- Cover domain invariants when changing court assignments or queues.
- Verify that an official cannot end up in multiple operational states.
- Verify FIFO ordering and contiguous queue order values after additions, removals, and moves.
- Verify the intentional umpire/service-judge role swap after rotation.
- Verify that reducing the court count removes assignments on eliminated courts and leaves those officials not on duty.
- For localization changes, exercise both English and Hungarian catalogs when practical.
- Do not hide existing failures by weakening unrelated assertions.

## Reporting validation

At task completion, list commands actually run and whether they passed. If a check cannot run—for example, Chrome is unavailable or a platform-specific desktop build cannot run on the host—state that explicitly. Distinguish pre-existing failures from failures introduced by the change.
