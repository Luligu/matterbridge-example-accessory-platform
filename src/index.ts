/**
 * This file contains the entry point of the plugin ExampleMatterbridgeAccessoryPlatform.
 *
 * @file index.ts
 * @author Luca Liguori
 * @version 1.0.0
 * @license Apache-2.0
 *
 * Copyright 2023, 2024, 2025, 2026 Luca Liguori.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Matterbridge, PlatformConfig } from 'matterbridge';
import { AnsiLogger } from 'matterbridge/logger';

import { ExampleMatterbridgeAccessoryPlatform } from './platform.js';

/**
 * This is the standard interface for Matterbridge plugins.
 * Each plugin should export a default function that follows this signature.
 *
 * @param {Matterbridge} matterbridge - The Matterbridge instance.
 * @param {AnsiLogger} log - The logger instance.
 * @param {PlatformConfig} config - The platform configuration.
 * @returns {ExampleMatterbridgeAccessoryPlatform} The initialized platform.
 */
export default function initializePlugin(matterbridge: Matterbridge, log: AnsiLogger, config: PlatformConfig): ExampleMatterbridgeAccessoryPlatform {
  return new ExampleMatterbridgeAccessoryPlatform(matterbridge, log, config);
}
