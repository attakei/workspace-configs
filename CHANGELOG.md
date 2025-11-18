# Changelogs

## 0.7.1

Date: 2025-11-18 - Asia/Tokyo

- New feature: sphinx-doc project
  - Add vars to append extra options

## 0.7.0

Date: 2025-11-08 - Asia/Tokyo

- Update python projects:
  - When Ruff make changes in process, it commit changes.

## 0.6.0

Date: 2025-08-25 - Asia/Tokyo

- New feature: sphinx-doc project
  - Add supports for snippet reST files.
  - Drop supporting lefthook version < 1.10.10
- Infrastructure changes:
  - Migrate from Deno to Bun runtime
  - Fix: Sync biome version for cli and schema

## 0.5.1

Date: 2025-07-27 - Asia/Tokyo

- Fix: 'sphinx-doc' project
  - Configure to refer `SPHINX_APIDOC_PACKAGE_PATH` from outside that includes it.

## 0.5.0

Date: 2025-06-24 - Asia/Tokyo

- New renovate: deno
  - Simple monitor `deno.json`.
    This can only check none-scoped packages.
- Misc:
  - Use Deno runtime to test Renovate config.
  - Migrate CLI management from mise to aqua.


## 0.4.0

Date: 2025-05-25 - Asia/Tokyo

- Breaking changes: Rename project and rule file.
  This is to collect rules for Python into same folder.
  - Project: from 'python-astral' to 'python'.
  - Lefthook rule of 'python' project: from 'lefthook.yaml' to 'lefthook-astral.yaml'.

## 0.3.0

Date: 2025-05-25 - Asia/Tokyo

- New domain: python-astral
  - Add lefthook rule.

## 0.2.1

Date: 2025-05-15 - Asia/Tokyo

- Fix renovate:
  - Update query for Taskfile.
- Misc:
  - [#6](https://github.com/attakei/workspace-configs/issues/6):
    Add test cases.

## 0.2.0

Date: 2025/05/08 Asia/Tokyo

- Breaking changes: Move folder to manage projects from root to 'projects'.

## 0.1.1

Date: 2025/05/07 Asia/Tokyo

- Update domain: Sphinx-doc
  - Taskfile: Define missed variables in tasks.

## 0.1.0

Date: 2025/05/07 Asia/Tokyo

- Initial tag.
- New domain: Sphinx-doc
  - Add Taskfile definition.
  - Add lefthook rule.
