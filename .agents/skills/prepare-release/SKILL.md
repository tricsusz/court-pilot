---
name: prepare-release
description: Prepare a Court Pilot desktop release by recommending a semantic version from commits or code changes, letting the developer confirm or override it, synchronizing all version locations, validating builds, and reviewing Windows, macOS, CrabNebula, and Linux Snap publication. Use whenever a developer asks to prepare or version a release.
---

# Prepare Release

Use this skill only when the user explicitly asks to prepare a release. A release-preparation request authorizes creating the local release tag after the developer confirms the version and the synchronized version changes are committed and validated. It does not authorize creating a commit, pushing the tag, or publishing unless the developer explicitly requests those actions.

## Recommend the version

Do not change version files immediately. First determine the latest reachable release tag and the current application version, then review all changes since that tag.

Use Conventional Commits when the commit history is clear:

- `type!:` or a `BREAKING CHANGE:` footer → major bump
- `feat:` or `feat(scope):` → minor bump
- `fix:` or `perf:` → patch bump
- `docs:`, `test:`, `refactor:`, `build:`, `ci:`, `chore:`, and style-only changes do not require a release bump by themselves unless they alter shipped behavior or packaging

The highest required bump wins. For example, a range containing both `fix:` and `feat:` recommends a minor bump.

This repository contains commits that do not always follow Conventional Commits. If commit messages are missing, inconsistent, or ambiguous:

1. Inspect the diff and changed files from the latest release tag through `HEAD`.
2. Inspect relevant implementation and configuration—not only the diff summary—to determine shipped behavior.
3. Treat incompatible user data, behavior, configuration, or supported-platform changes as major.
4. Treat backward-compatible functionality as minor.
5. Treat backward-compatible corrections, performance improvements, packaging fixes, or security fixes as patch.
6. Mention unreleased working-tree changes separately; do not silently base a release solely on uncommitted work.

If there is no prior tag, inspect the complete relevant history and ask whether the release should establish the chosen initial version.

Present the developer with:

- current application version
- latest release tag
- relevant commits or code changes
- recommended version
- recommended bump type and concise reasoning

Then explicitly ask the developer to either accept the recommendation or enter a different version. Do not edit versions until they answer.

During release version confirmation, ask whether to run the test suite or skip it. Running tests is the default; skip them only when the developer explicitly chooses to skip. Record any skipped tests in the release validation report. Lint, build, and Cargo checks still apply.

Validate the selected value as Semantic Versioning. It should normally be greater than both the current released version and latest release tag. Warn and request confirmation for a lower, equal, or prerelease version.

Release tags use the selected value prefixed with `v`, such as `v1.2.0`.

## Synchronize the confirmed version manually

After the developer accepts the recommendation or supplies a manual version, set that exact version in:

1. `package.json`
2. The root package entries in `package-lock.json`
3. `src-tauri/tauri.conf.json`
4. `src-tauri/Cargo.toml`
5. The `court-pilot` entry in `src-tauri/Cargo.lock`, normally refreshed by Cargo
6. `snap/snapcraft.yaml`
7. The version displayed in `src/app/tab3/tab3.page.html`

Do not introduce a release-version script unless the user requests automation.

After editing `Cargo.toml`, run `cargo check` from `src-tauri/` and confirm Cargo refreshed its lockfile metadata.

## Review release configuration

- Confirm the tag version matches all files.
- Confirm the Tauri updater endpoint and public key are intentional.
- Confirm Linux still skips the in-app updater because Snap manages updates.
- Confirm `.github/workflows/release.yml` still builds Windows, both macOS architectures, and Linux Snap.
- Do not expose or print signing, CrabNebula, or Snap Store secrets.
- Note that platform packages cannot all be validated on one development host.

## Validate

Honor the developer's test choice: run the test command by default and omit it only when they explicitly chose to skip. Activate the required Node.js version, then run the checks in order. Keep `nvm use lts/jod` in the same shell session as the npm commands:

```sh
nvm use lts/jod
npm ci
npm test -- --configuration=ci
npm run lint
npm run build
```

From `src-tauri/`, run:

```sh
cargo check
```

Run a local Tauri build only when the host has the required native dependencies. Report platforms that were not built locally.

## Create the release tag

Do not tag uncommitted version changes: a tag points to a commit, not to the working tree. After validation:

1. Verify all synchronized version files are included in `HEAD` and the tracked working tree is clean. If they are not committed, ask the developer to commit them or explicitly authorize the agent to create the release commit.
2. Verify that `v<version>` does not already exist locally.
3. Create a lightweight tag, matching this repository's existing release-tag style:

```sh
GIT_EDITOR=true git tag v<version>
```

For version `1.2.0`, run exactly:

```sh
GIT_EDITOR=true git tag v1.2.0
```

4. Verify that the tag resolves to the intended release commit.
5. Report the created local tag.

Do not push automatically. Explain that pushing the tag triggers `.github/workflows/release.yml`, then ask for explicit permission before running:

```sh
git push origin v<version>
```

Never move, overwrite, or force-push an existing release tag without explicit maintainer instructions.

## Completion report

Report:

- latest release tag and current version used for comparison
- recommended bump and reasoning
- version selected by the developer
- files whose versions were synchronized
- test, lint, Angular build, and Cargo results, explicitly noting any tests skipped at the developer's request
- platform builds not run locally
- local release tag created and its target commit
- whether the tag remains local or was explicitly pushed
- any workflow or updater concerns

Stop before committing, pushing, or publishing unless the user explicitly asks for those actions.
