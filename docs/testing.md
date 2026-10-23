# Testing and Validation

## Test stack

Angular unit tests use Jasmine and Karma. Test files are colocated with their subjects as `*.spec.ts`. Karma launches Chrome by default and keeps running in watch mode for local development.

## Local test commands

Run the interactive test suite:

```sh
npm test
```

Run the configured non-watching CI test mode:

```sh
npm test -- --configuration=ci
```

The test environment requires an available Chrome installation. Test coverage output, when enabled by the test runner, is written under `coverage/app/`.

## Lint and build

Lint TypeScript and Angular templates:

```sh
npm run lint
```

Build the production Angular application:

```sh
npm run build
```

Check Rust changes from the Tauri directory:

```sh
cargo check
```

## What to validate

Choose checks based on the changed area:

| Change | Expected validation |
|---|---|
| Documentation only | Markdown/editor diagnostics and `git diff --check` |
| Angular TypeScript or template | Related tests, `npm run lint`, and `npm run build` |
| Service or domain behavior | Behavior-focused service/page tests, lint, and build |
| Dexie schema or migration | Migration tests where practical, lint, and build |
| Styles only | Build and visual verification at relevant viewport sizes |
| Rust code | `cargo check` plus relevant Rust tests if introduced |
| Tauri/release configuration | Build/config checks available on the host; report untested platforms |

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
