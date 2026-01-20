# <img src="https://matterbridge.io/assets/matterbridge.svg" alt="Matterbridge Logo" width="64px" height="64px">&nbsp;&nbsp;&nbsp;Matterbridge accessory platform example plugin changelog

[![npm version](https://img.shields.io/npm/v/matterbridge-example-accessory-platform.svg)](https://www.npmjs.com/package/matterbridge-example-accessory-platform)
[![npm downloads](https://img.shields.io/npm/dt/matterbridge-example-accessory-platform.svg)](https://www.npmjs.com/package/matterbridge-example-accessory-platform)
[![Docker Version](https://img.shields.io/docker/v/luligu/matterbridge?label=docker%20version&sort=semver)](https://hub.docker.com/r/luligu/matterbridge)
[![Docker Pulls](https://img.shields.io/docker/pulls/luligu/matterbridge.svg)](https://hub.docker.com/r/luligu/matterbridge)
![Node.js CI](https://github.com/Luligu/matterbridge-example-accessory-platform/actions/workflows/build.yml/badge.svg)
![CodeQL](https://github.com/Luligu/matterbridge-example-accessory-platform/actions/workflows/codeql.yml/badge.svg)
[![codecov](https://codecov.io/gh/Luligu/matterbridge-example-accessory-platform/branch/main/graph/badge.svg)](https://codecov.io/gh/Luligu/matterbridge-example-accessory-platformr)

[![power by](https://img.shields.io/badge/powered%20by-matterbridge-blue)](https://www.npmjs.com/package/matterbridge)
[![power by](https://img.shields.io/badge/powered%20by-matter--history-blue)](https://www.npmjs.com/package/matter-history)
[![power by](https://img.shields.io/badge/powered%20by-node--ansi--logger-blue)](https://www.npmjs.com/package/node-ansi-logger)
[![power by](https://img.shields.io/badge/powered%20by-node--persist--manager-blue)](https://www.npmjs.com/package/node-persist-manager)

---

All notable changes to this project will be documented in this file.

If you like this project and find it useful, please consider giving it a star on GitHub at https://github.com/Luligu/matterbridge-example-accessory-platform and sponsoring it.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="120"></a>

## [2.0.4] - 2026-01-20

### Added

- [matter]: Conformance to Matter 1.4.2 and matterbridge 3.5.x.

### Changed

- [package]: Updated dependencies.
- [package]: Bumped package to automator v.3.0.0.
- [package]: Refactor Dev Container to use Matterbridge mDNS reflector.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [2.0.3] - 2025-12-25

### Added

- [DevContainer]: Refactored Dev Container setup. The Matterbridge instance can now be paired on native Linux hosts or WSL 2 with Docker engine CLI integration. On Docker Desktop on Windows or macOS is not possible cause Docker Desktop runs inside a VM and not directly on the host so mDNS is not supported.
- [DevContainer]: Since is now possible to pair from Dev Container, named volumes have been added to persist storage and plugins across rebuilds.

### Changed

- [package]: Updated dependencies.
- [package]: Bumped package to automator v.2.1.1.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [2.0.2] - 2025-12-05

### Changed

- [package]: Updated dependencies.
- [package]: Updated to the current Matterbridge signatures.
- [package]: Requires Matterbridge v.3.4.0.
- [package]: Updated tests to use the Matterbridge Jest module.
- [package]: Bumped package to automator v.2.1.0.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [2.0.1] - 2025-11-13

### Changed

- [package]: Updated dependencies.
- [package]: Bumped package to automator v.2.0.12.
- [jest]: Updated jestHelpers to v.1.0.12.
- [workflows]: Use shallow clones and --no-fund --no-audit for faster builds.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [2.0.0] - 2025-10-24

### Changed

- [package]: Bumped platform to v. 2.0.0.
- [package]: Updated dependencies.
- [package]: Bumped package to automator version 2.0.9
- [jest]: Updated jestHelpers to v. 1.0.9.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [1.3.0] - 2025-10-15

### Changed

- [package]: Require matterbridge 3.3.0.
- [index]: Updated to new signature PlatformMatterbridge.
- [platform]: Updated to new signature PlatformMatterbridge.
- [package]: Updated dependencies.
- [package]: Bumped package to automator version 2.0.7
- [workflows]: Ignore any .md in build.yaml.
- [workflows]: Ignore any .md in codeql.yaml.
- [workflows]: Ignore any .md in codecov.yaml.
- [template]: Updated bug_report.md.
- [jest]: Updated jestHelpers to v. 1.0.6.
- [workflows]: Improved speed on Node CI.
- [devcontainer]: Added the plugin name to the container.
- [devcontainer]: Improved performance of first build with shallow clone.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [1.2.2] - 2025-09-02

### Changed

- [package]: Updated dependencies.
- [package]: Updated package to Automator v. 2.0.5.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [1.2.1] - 2025-07-30

### Changed

- [package]: Updated package to Automator v. 2.0.3.
- [package]: Updated dependencies.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [1.2.0] - 2025-06-25

### Added

- [DevContainer]: Added support for the **Matterbridge Dev Container** with an optimized named volume for `node_modules`.
- [GitHub]: Added GitHub issue templates for bug reports and feature requests.
- [ESLint]: Refactored the flat config.
- [ESLint]: Added the plugins `eslint-plugin-promise`, `eslint-plugin-jsdoc`, and `@vitest/eslint-plugin`.
- [Jest]: Refactored the flat config.
- [Vitest]: Added Vitest for TypeScript project testing. It will replace Jest, which does not work correctly with ESM module mocks.
- [JSDoc]: Added missing JSDoc comments, including `@param` and `@returns` tags.
- [CodeQL]: Added CodeQL badge in the readme.
- [Codecov]: Added Codecov badge in the readme.

### Changed

- [package]: Updated package to Automator v. 2.0.1.
- [package]: Updated dependencies.
- [storage]: Bumped `node-storage-manager` to 2.0.0.
- [logger]: Bumped `node-ansi-logger` to 3.1.1.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [1.1.9] - 2025-04-30

### Changed

- [package]: Require matterbridge 3.0.0.
- [package]: Updated package.
- [package]: Updated dependencies.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [1.1.8] - 2025-04-07

### Changed

- [package]: Require matterbridge 2.2.7.
- [package]: Updated package.
- [package]: Updated dependencies.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [1.1.7] - 2025-03-05

### Changed

- [package]: Require matterbridge 2.2.0.
- [package]: Updated package.
- [package]: Updated dependencies.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [1.1.6] - 2025-02-02

### Changed

- [package]: Require matterbridge 2.1.0.
- [package]: Updated package.
- [package]: Updated dependencies.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [1.1.4] - 2025-01-21

### Changed

- [package]: Require matterbridge 2.0.0.
- [package]: Updated dependencies.
- [package]: Updated package.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [1.1.3] - 2024-12-21

### Added

- [platform]: Added call to super.OnConfigure() and super.OnShutDown() to check endpoints numbers.

### Changed

- [package]: Updated dependencies.
- [package]: Updated package.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [1.1.2] - 2024-12-12

### Changed

- [package]: Require matterbridge 1.6.6
- [package]: Updated package.
- [package]: Updated dependencies.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [1.1.0] - 2024-11-25

### Changed

- [package]: Verified to work with matterbridge edge (matter.js new API).
- [package]: Require matterbridge 1.6.2
- [package]: Updated dependencies.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

<!-- Commented out section
## [1.1.2] - 2024-03-08

### Added

- [Feature 1]: Description of the feature.
- [Feature 2]: Description of the feature.

### Changed

- [Feature 3]: Description of the change.
- [Feature 4]: Description of the change.

### Deprecated

- [Feature 5]: Description of the deprecation.

### Removed

- [Feature 6]: Description of the removal.

### Fixed

- [Bug 1]: Description of the bug fix.
- [Bug 2]: Description of the bug fix.

### Security

- [Security 1]: Description of the security improvement.
-->
