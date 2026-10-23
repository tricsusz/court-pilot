---
name: database-change
description: Modify Court Pilot's Dexie entities, indexes, or persisted data safely with a new schema version, explicit migration behavior, domain-invariant protection, tests, and documentation. Use whenever a task changes db.ts or the shape or meaning of stored records.
---

# Database Change Workflow

Use this skill for any change to persisted Court Pilot data.

## Establish the migration

1. Read `AGENTS.md`, `docs/architecture.md`, and `docs/domain-glossary.md`.
2. Read `db.ts` and every service that reads or writes the affected tables.
3. Determine whether the change affects existing released records.
4. Define the old shape, new shape, defaults, invalid-data handling, and rollback limitations before editing.
5. Ask the maintainer if the migration depends on an undefined domain rule.

## Version the schema safely

- Never modify an existing released `db.version(...)` declaration in place.
- Add the next integer schema version.
- Declare the complete store schema required by that version.
- Use an explicit Dexie upgrade callback when records need transformation.
- Keep migration logic deterministic and safe to run once per database upgrade.
- Do not delete user data unless the task explicitly requires and documents it.

## Preserve domain invariants

After migration, every court official must be in exactly one operational state:

- not on duty
- waiting as umpire
- waiting as service judge
- assigned as umpire
- assigned as service judge

Preserve FIFO queue ordering. Normalize order values if the migration can create gaps or conflicts. Removing assignments because courts no longer exist must leave those officials not on duty unless the requested behavior says otherwise.

Use a Dexie transaction for multi-table changes that must succeed or fail together.

## Update all affected layers

- Update TypeScript entity interfaces and table declarations.
- Update services rather than moving raw database access into pages.
- Update computed UI state and templates when the new data affects presentation.
- Update both English and Hungarian translations for new user-facing concepts.
- Document the new schema version and migration behavior in `docs/architecture.md`.

## Validate

- Add migration coverage using a database created at the previous version when practical.
- Add tests for changed service behavior and domain invariants.
- Run `npm run lint`.
- Run `npm run build`.
- Run the relevant non-watching tests.
- Report the old and new schema versions and all commands actually run.
