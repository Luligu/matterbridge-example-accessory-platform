import { rmSync } from 'node:fs';
import path from 'node:path';

import { Matterbridge, MatterbridgeEndpoint, PlatformConfig } from 'matterbridge';
import { AnsiLogger } from 'matterbridge/logger';
import { jest } from '@jest/globals';

import { ExampleMatterbridgeAccessoryPlatform } from './platform.ts';
import initializePlugin from './index.ts';
import { setupTest } from './jestHelpers.ts';

// Setup the test environment
setupTest('Index', false);

describe('initializePlugin', () => {
  const mockLog = {
    fatal: jest.fn((message: string, ...parameters: any[]) => {}),
    error: jest.fn((message: string, ...parameters: any[]) => {}),
    warn: jest.fn((message: string, ...parameters: any[]) => {}),
    notice: jest.fn((message: string, ...parameters: any[]) => {}),
    info: jest.fn((message: string, ...parameters: any[]) => {}),
    debug: jest.fn((message: string, ...parameters: any[]) => {}),
  } as unknown as AnsiLogger;

  const mockMatterbridge = {
    homeDirectory: path.join('jest', 'index'),
    matterbridgeDirectory: path.join('jest', 'index', '.matterbridge'),
    matterbridgePluginDirectory: path.join('jest', 'index', 'Matterbridge'),
    systemInformation: { ipv4Address: undefined, ipv6Address: undefined, osRelease: 'xx.xx.xx.xx.xx.xx', nodeVersion: '22.1.10' },
    matterbridgeVersion: '3.3.0',
    edge: true,
    log: mockLog,
    getDevices: jest.fn(() => {
      return [];
    }),
    getPlugins: jest.fn(() => {
      return [];
    }),
    addBridgedEndpoint: jest.fn(async (pluginName: string, device: MatterbridgeEndpoint) => {}),
    removeBridgedEndpoint: jest.fn(async (pluginName: string, device: MatterbridgeEndpoint) => {}),
    removeAllBridgedEndpoints: jest.fn(async (pluginName: string) => {}),
  } as unknown as Matterbridge;

  const mockConfig: PlatformConfig = {
    name: 'matterbridge-example-accessory-platform',
    type: 'AccessoryPlatform',
    version: '1.0.0',
    unregisterOnShutdown: false,
    debug: false,
  };

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Restore all mocks
    jest.restoreAllMocks();
  }, 30000);

  it('should return an instance of TestPlatform', async () => {
    const platform = initializePlugin(mockMatterbridge, mockLog, mockConfig);
    expect(mockLog.info).toHaveBeenCalledWith('Initializing platform:', mockConfig.name);
    expect(platform).toBeInstanceOf(ExampleMatterbridgeAccessoryPlatform);
    await platform.onShutdown('Test reason');
    expect(mockLog.info).toHaveBeenCalledWith('onShutdown called with reason:', 'Test reason');
  });
});
