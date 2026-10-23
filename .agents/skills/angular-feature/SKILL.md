---
name: angular-feature
description: Implement or modify Angular and Ionic features in Court Pilot while following its standalone-component, Dexie service, signal, localization, styling, and testing conventions. Use for changes to pages, routes, services, settings, and user-facing web or desktop UI behavior.
---

# Angular Feature Workflow

Use this workflow for Angular/Ionic feature work in Court Pilot.

## 1. Establish the behavior

1. Read `AGENTS.md`.
2. Identify the affected route in `src/app/app.routes.ts` or `src/app/tabs/tabs.routes.ts`.
3. Read the page component, template, SCSS, related services, and adjacent specs.
4. Check `docs/domain-glossary.md` before changing rotation or assignment behavior.
5. Ask the maintainer rather than inventing a rule when a domain question remains unresolved.

## 2. Choose the correct layer

- Keep rendering and user interaction in the page/component.
- Keep table access and reusable persistence operations in `src/app/services/`.
- Use Angular signals for reactive state and `computed()` for derived state.
- Follow existing `liveQuery()` plus `toSignal()` patterns for reactive Dexie queries.
- If one operation writes multiple tables, consider a Dexie transaction so failure cannot leave a partial move.
- Treat `db.ts` changes as schema work. Add a new schema version for released-data changes; never rewrite an existing released schema in place.

## 3. Follow UI conventions

- Use standalone components.
- Import Ionic controls from `@ionic/angular/standalone` and list them in component `imports`.
- Use `inject()` for dependencies.
- Register new Ionicons with `addIcons()`.
- Keep page HTML and SCSS beside the page TypeScript file.
- Format touched files with the root `.prettierrc`; do not reformat unrelated files or apply personal overrides.
- Preserve strict typing; do not use `any` to bypass domain modeling.

## 4. Localize user-facing text

1. Add a typed key to both `en` and `hu` in `src/app/i18n/translations.ts`.
2. Keep interpolation placeholders identical in both languages.
3. Use `TranslatePipe` in templates.
4. Use `TranslationService` for alerts and TypeScript-created messages.
5. If the Hungarian translation is unknown, ask for it instead of inventing production copy.

## 5. Protect platform behavior

- Guard Tauri-only APIs with `isTauri()` when browser execution is possible.
- Remember that Linux updates are handled by Snap, while Windows and macOS use the Tauri updater.
- Do not assume Capacitor targets are active until their intended support is confirmed.

## 6. Add validation

- Add or update adjacent `*.spec.ts` coverage for changed behavior.
- Prefer behavior assertions over creation-only tests.
- Run the narrowest relevant test first when supported by the current Karma setup.
- Run `npm run lint`.
- Run `npm run build`.
- Report every command actually run and any validation that was unavailable.

## Completion checklist

- [ ] The implementation follows an existing page/service pattern.
- [ ] Domain invariants remain intact.
- [ ] New user-facing text exists in English and Hungarian.
- [ ] Persistence changes have an explicit migration strategy.
- [ ] Relevant tests were updated.
- [ ] Lint and build results were reported.
- [ ] Documentation was updated if behavior or architecture changed.
