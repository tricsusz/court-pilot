# Angular and Ionic code audit

Reviewed on 2026-11-04 against the installed Angular 22 and Ionic 9 packages.
Scope: application components, templates, styles, services, localization,
bootstrap, routes, TypeScript configuration, and lint rules.

## Corrections

- Moved court and queue state changes from page orchestration into
  `CourtRotationService`. Moves and rotations now use transactions, await writes,
  check persisted court occupancy, and reject stale confirmations. A failed write
  rolls back the entire operation.
- Fixed rotation without confirmation when service judges are disabled. The lone
  umpire returns to the umpire queue.
- Moved court-count and service-judge cleanup into `SettingsService` transactions.
  Court counts must be positive safe integers. Court count changes commit after
  the input is confirmed rather than deleting assignments during each keystroke.
- Made roster deletion remove dependent duty records and normalize remaining
  queue positions in the same transaction. Clearing the roster clears duty too.
- Made queue insertion/reordering and deletion/renumbering atomic. Queue heads
  use the lowest numeric order, including when the first order is greater than one.
- Replaced method-created `toSignal()` court queries with `computed()` lookups
  derived from existing service signals. Callers no longer need an injection
  context or create a new database subscription for every lookup.
- Kept defensive copies of caller-owned records before Dexie inserts, so generated
  IDs do not mutate form or caller state. Removed unnecessary entity casts.
- Made roster saves finish before modal dismissal. The form prevents duplicate
  saves, rejects blank names, trims names and country, and preserves the draft
  with a translated error alert when saving fails. Modal presentation uses its
  Angular view reference instead of a global trigger ID.
- Replaced the court loop's array-constructor migration expression with the
  existing computed court indexes and stable court-number tracking.
- Corrected Ionic grid boolean bindings, removed redundant literal property
  bindings and an empty disabled binding, and applied the empty-court drag
  predicate consistently to both roles.
- Localized the remaining hardcoded roster heading, added names for icon-only
  actions, allowed browser zoom, and synchronized the document language with
  the selected UI language.
- Exposed language state as a readonly signal and rejected inherited object keys
  such as `toString` as saved language values.
- Replaced alert styles coupled to generated Ionic classes with the public host
  class and CSS variables, with a viewport-aware minimum width.
- Added bootstrap error handling and moved the desktop platform lookup inside
  the updater's error boundary.
- Removed unused dependencies, imports, pipe arguments, and non-null assertions;
  added `readonly` where appropriate and typed Ionic events and CDK drag data.
- Enabled lint rules for unused variables and explicit `any`. Removed the blanket
  suppression of optional-chain and nullish-coalescing compiler diagnostics.
- Formatted changed files with the repository Prettier configuration and updated
  the architecture documentation.

## Conventions retained

- Ionic 9 exports standalone components from `@ionic/angular`; no import-path
  migration is needed. The installed package does not export the old
  `@ionic/angular/standalone` entry point.
- Eager change detection remains explicit on the root and Ionic routed components.
  Ionic outlet ancestors must continue checking pages that use plain-field form
  state. See [Ionic page lifecycle](https://ionicframework.com/docs/angular/lifecycle).
- Existing standalone components, lazy routes, `inject()`, strict typing, reactive
  service signals, and computed page state already follow the project's approach.
  See [Ionic standalone build options](https://ionicframework.com/docs/angular/build-options)
  and [Angular component guidance](https://github.com/angular/angular/blob/main/packages/core/resources/best-practices.md).
- The translation and full-name pipes remain impure: their output depends on a
  language signal in addition to the explicit pipe arguments.
- Template-driven forms remain appropriate for the small roster form. This audit
  does not require a form-framework migration.
- No database schema, release versions, dependencies, or tournament rules changed.

## Validation

Final checks, using Node `lts/jod`:

- `npm run lint` — passed.
- `npm run build` — passed, including strict template checking with diagnostic
  suppressions removed.
- `CHROME_BIN=/snap/bin/chromium npm test -- --watch=false --browsers=ChromeHeadless`
  — all 102 tests passed. Karma and Chromium ran outside the sandbox because the
  sandbox cannot bind Karma's server port.
- Focused roster tests using `--include=src/app/tab2/tab2.page.spec.ts` — all four
  passed before the final full-suite run.
- Prettier on touched files and `git diff --check` — passed.

Regression coverage includes concurrent assignment attempts, failed rotation
rollback, stale confirmations, FIFO ordering with gaps, state exclusivity,
settings cleanup, cascade deletion, readonly language behavior, name localization,
and roster save failure and duplicate-submit behavior.

Desktop installation, updater downloads, native platform builds, and manual
end-to-end drag interaction were not exercised by this frontend audit.
The existing Karma builder and Zone.js/Jasmine integration emit upstream
deprecation messages; migrating the runner or dependency versions is separate
from these application fixes.
