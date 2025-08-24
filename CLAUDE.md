# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rule

- Claude cannot use to implement sources of `projects/` directory.

## Project Overview

This repository contains shared configuration files for workspace management. A "workspace" is defined as a Git local repository after setup scripts. The goal is to run the same commands and workflows across multiple repositories.

## Development Commands

### Setup and Development

- `task setup` - Setup workspace (runs `bun install` + `lefthook install`)
- `task verify` - Health check all files (runs pre-commit hooks + validates Renovate configs)
- `bun test` - Run test suite using Bun's built-in test runner

### Testing Individual Files

- `bun test tests/taskfile.test.ts` - Run specific test file
- `bun test --watch` - Run tests in watch mode

### Code Quality

- `bun x biome check --write .` - Format and lint TypeScript/JSON files
- `lefthook run pre-commit --all-files` - Run pre-commit hooks manually

### Renovate Testing

- `task dry-run` - Test Renovate configuration with dry run (requires `gh auth token`)
- `bun x renovate-config-validator renovate/*` - Validate Renovate configuration files

### Release Management

- `task release-minor` - Run minor release process
- `task release-patch` - Run patch release process
- `task release-major` - Run major release process

## Architecture

### Core Concept: Shared Configuration Templates
This repository provides reusable configuration files that can be:
1. Copied into other repositories
2. Included directly via remote URLs (experimental for Taskfiles)

Example remote inclusion pattern:
```yaml
includes:
  docs:
    taskfile: 'https://github.com/attakei/workspace-configs.git//projects/sphinx-doc/Taskfile.yaml?tag=v0.2.0'
```

### Key Components

#### Custom Renovate Dependency Detection
The most complex part of this system is the custom Renovate managers that use JSONata expressions to detect dependencies in YAML files:

- **Taskfile Dependencies**: Detects GitHub repository references in Taskfile `includes` sections
- **JSONata Expressions**: Complex queries that parse YAML structures and extract repository names and version tags
- **Test Coverage**: Each custom manager has comprehensive test suites that validate pattern matching

The JSONata expression in `renovate/taskfile.json` parses Taskfile includes like:
```
$map(includes.*.{ "taskfile": taskfile }[taskfile ~> /github\.com\/.+\.git/], function($v) {{ "depName": $match($v.taskfile, /github.com\/(.+)\.git/, 1).groups[0], "currentValue": $match($v.taskfile, /\?(tag|ref)=(.+)/, 1).groups[1] }})
```

#### Project Templates
- `projects/sphinx-doc/`: Comprehensive Taskfile for Sphinx documentation projects with i18n support, live dev server, and API documentation generation
- `projects/python/`: Python-specific configurations including Astral toolchain support

#### Runtime Environment
- **Bun**: JavaScript runtime and package manager (ES modules, TypeScript support)
- **Biome**: Code formatting and linting
- **Lefthook**: Git hooks management
- **Task**: Build automation and task running

### Testing Strategy
Tests focus on validating the complex Renovate configuration patterns:
- **Pattern Matching**: Ensures file patterns correctly match various Taskfile naming conventions
- **JSONata Parsing**: Tests the complex expressions against example YAML structures
- **Edge Cases**: Handles mixed local/remote includes, missing tags, and various URL formats
