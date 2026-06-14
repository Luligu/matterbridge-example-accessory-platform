# <img src="https://matterbridge.io/assets/matterbridge.svg" alt="Matterbridge Logo" width="64px" height="64px">&nbsp;&nbsp;&nbsp;Matterbridge accessory platform example plugin

[![npm version](https://img.shields.io/npm/v/matterbridge-example-accessory-platform.svg)](https://www.npmjs.com/package/matterbridge-example-accessory-platform)
[![npm downloads](https://img.shields.io/npm/dt/matterbridge-example-accessory-platform.svg)](https://www.npmjs.com/package/matterbridge-example-accessory-platform)
[![Docker Version](https://img.shields.io/docker/v/luligu/matterbridge/latest?label=docker%20version)](https://hub.docker.com/r/luligu/matterbridge)
[![Docker Pulls](https://img.shields.io/docker/pulls/luligu/matterbridge?label=docker%20pulls)](https://hub.docker.com/r/luligu/matterbridge)
![Node.js CI](https://github.com/Luligu/matterbridge-example-accessory-platform/actions/workflows/build.yml/badge.svg)
![CodeQL](https://github.com/Luligu/matterbridge-example-accessory-platform/actions/workflows/codeql.yml/badge.svg)
[![codecov](https://codecov.io/gh/Luligu/matterbridge-example-accessory-platform/branch/main/graph/badge.svg)](https://codecov.io/gh/Luligu/matterbridge-example-accessory-platform)
[![tested with Vitest](https://img.shields.io/badge/tested_with-Vitest-6E9F18.svg?logo=vitest&logoColor=white)](https://vitest.dev)
[![styled with Oxc](https://img.shields.io/badge/styled_with-Oxc-9BE4E0.svg?logo=oxc&logoColor=white)](https://oxc.rs/docs/guide/usage/formatter.html)
[![linted with Oxc](https://img.shields.io/badge/linted_with-Oxc-9BE4E0.svg?logo=oxc&logoColor=white)](https://oxc.rs/docs/guide/usage/linter.html)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TypeScript Native](https://img.shields.io/badge/TypeScript_Native-3178C6?logo=typescript&logoColor=white)](https://github.com/microsoft/typescript-go)
[![ESM](https://img.shields.io/badge/ESM-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![matterbridge.io](https://img.shields.io/badge/matterbridge.io-online-brightgreen)](https://matterbridge.io)

[![powered by](https://img.shields.io/badge/powered%20by-matterbridge-blue)](https://www.npmjs.com/package/matterbridge)
[![powered by](https://img.shields.io/badge/powered%20by-matter--history-blue)](https://www.npmjs.com/package/matter-history)
[![powered by](https://img.shields.io/badge/powered%20by-node--ansi--logger-blue)](https://www.npmjs.com/package/node-ansi-logger)
[![powered by](https://img.shields.io/badge/powered%20by-node--persist--manager-blue)](https://www.npmjs.com/package/node-persist-manager)

---

Matterbridge accessory platform example plugin is a template to develop your own plugin using the accessory platform.

It exposes a cover device that continuously moves position and shows how to use the command handlers (you can control the device).

If you want to write your plugin, the easiest way to start create a new plugin is to clone the [Matterbridge Plugin Template](https://github.com/Luligu/matterbridge-plugin-template) which has **Dev Container support for instant development environment** and all tools and extensions (like Node.js, npm, TypeScript, ESLint, Prettier, Jest and Vitest) already loaded and configured.

If you like this project and find it useful, please consider giving it a star on [GitHub](https://github.com/Luligu/matterbridge-example-accessory-platform) and sponsoring it.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="120"></a>

## Prerequisites

### Matterbridge

See the guidelines on [Matterbridge](https://matterbridge.io) for more information.

## Repository setup

> **Note:** This repository uses a new toolchain. It replaces the traditional TypeScript / ESLint / Prettier / Jest stack with a faster, lighter setup.

- **No `typescript` package** — replaced by [TypeScript Native](https://github.com/microsoft/typescript-go). The `typescript` package is kept only as a publish-time dependency while tsgo is still in preview.
- **No ESLint, no Prettier** — replaced by the [oxc](https://oxc.rs) stack: [oxlint](https://oxc.rs/docs/guide/usage/linter.html) for linting and [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) for formatting.
- **No Jest** — replaced by [Vitest](https://vitest.dev), which is much faster and natively supports ESM without extra configuration.
- **Far fewer development dependencies** — the number of installed packages drops from **~600** to **~100**. A clean install is much faster.
- **Much faster linting and formatting** — oxlint and oxfmt run in a fraction of the time required by the ESLint / Prettier pipeline.
- **Much faster builds** — tsgo compiles the project in a fraction of the time required by the standard `tsc` build.
- **Editor support** — use the VS Code extensions for tsgo and oxc to get the same experience in the editor.

## Style guide

See also the [Style Guide](./STYLEGUIDE.md) for JSDoc, naming, and logging conventions used in this repository.
