const NAME = 'Platform';
const MATTER_PORT = 6000;
const MATTER_CREATE_ONLY = true;

import type { PlatformConfig, PlatformMatterbridge } from 'matterbridge';
import { LogLevel } from 'matterbridge/logger';
import { Identify, PowerSource, WindowCovering } from 'matterbridge/matter/clusters';
import { log, loggerErrorSpy, loggerFatalSpy, loggerLogSpy, loggerWarnSpy, setDebug, setupTest } from 'matterbridge/vitest-utils';
import {
  addMatterbridge,
  createServerNode,
  createTestEnvironment,
  destroyTestEnvironment,
  flushServerNode,
  getMatterbridge,
  startServerNode,
  stopServerNode,
} from 'matterbridge/vitest-utils/matter';

import initializePlugin, { ExampleMatterbridgeAccessoryPlatform } from '../src/module.js';

// Setup the test environment
await setupTest(NAME, false);

describe('TestPlatform', () => {
  let matterbridge: PlatformMatterbridge;
  let accessoryPlatform: ExampleMatterbridgeAccessoryPlatform;

  const config: PlatformConfig = {
    name: 'matterbridge-example-accessory-platform',
    type: 'AccessoryPlatform',
    version: '1.0.0',
    unregisterOnShutdown: false,
    debug: true,
  };

  beforeAll(async () => {
    // Create Matterbridge environment
    await createTestEnvironment();
    // Create the server node and aggregator
    await createServerNode(MATTER_PORT);
    // Start the server node if not in create-only mode
    if (!MATTER_CREATE_ONLY) await startServerNode();
    matterbridge = getMatterbridge();
  });

  beforeEach(() => {
    // Reset the mock calls before each test
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clear debug
    await setDebug(false);
    // No errors should be logged
    expect(loggerWarnSpy).not.toHaveBeenCalled();
    expect(loggerErrorSpy).not.toHaveBeenCalled();
    expect(loggerFatalSpy).not.toHaveBeenCalled();
  });

  afterAll(async () => {
    // Stop or flush the server node depending on the create-only mode
    if (MATTER_CREATE_ONLY) await flushServerNode();
    else await stopServerNode();
    await destroyTestEnvironment();
    // Restore all mocks
    vi.restoreAllMocks();
  });

  it('should return an instance of TestPlatform', async () => {
    const platform = initializePlugin(matterbridge, log, config);
    expect(platform).toBeInstanceOf(ExampleMatterbridgeAccessoryPlatform);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, 'Initializing platform:', config.name);
    platform.config.unregisterOnShutdown = true;
    await platform.onShutdown();
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, 'onShutdown called with reason:', 'none');
    platform.config.unregisterOnShutdown = false;
  });

  it('should throw error in load when version is not valid', () => {
    expect(() => new ExampleMatterbridgeAccessoryPlatform({ ...matterbridge, matterbridgeVersion: '1.5.0' }, log, config)).toThrow(
      'This plugin requires Matterbridge version >= "3.8.0". Please update Matterbridge from 1.5.0 to the latest version in the frontend.',
    );
  });

  it('should initialize platform with config name', () => {
    accessoryPlatform = new ExampleMatterbridgeAccessoryPlatform(matterbridge, log, config);
    addMatterbridge(accessoryPlatform);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, 'Initializing platform:', config.name);
  });

  it('should call onStart without reason', async () => {
    accessoryPlatform.version = '1.6.6';
    await accessoryPlatform.onStart();
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, 'onStart called with reason:', 'none');

    expect(accessoryPlatform.cover).toBeDefined();

    expect(accessoryPlatform.cover?.hasClusterServer(Identify)).toBeTruthy();
    expect(accessoryPlatform.cover?.hasClusterServer(WindowCovering)).toBeTruthy();
    expect(accessoryPlatform.cover?.hasClusterServer(PowerSource)).toBeTruthy();

    // Invoke command handlers
    await accessoryPlatform.cover?.executeCommandHandler('identify', { identifyTime: 1 }, 'identify', {} as any, accessoryPlatform.cover);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining(`Command identify called identifyTime: 1`));

    await accessoryPlatform.cover?.executeCommandHandler('stopMotion', {} as any, 'windowCovering', {} as any, accessoryPlatform.cover);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Command stopMotion called'));

    await accessoryPlatform.cover?.executeCommandHandler('upOrOpen', {} as any, 'windowCovering', {} as any, accessoryPlatform.cover);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Command upOrOpen called'));

    await accessoryPlatform.cover?.executeCommandHandler('downOrClose', {} as any, 'windowCovering', {} as any, accessoryPlatform.cover);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Command downOrClose called'));

    await accessoryPlatform.cover?.executeCommandHandler('goToLiftPercentage', { liftPercent100thsValue: 100 }, 'windowCovering', {} as any, accessoryPlatform.cover);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Command goToLiftPercentage called request 100'));
  });

  it('should call onConfigure', async () => {
    await accessoryPlatform.onConfigure();
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('onConfigure called'));
    expect(loggerLogSpy).toHaveBeenCalledWith(
      LogLevel.INFO,
      expect.stringContaining('Set cover initial targetPositionLiftPercent100ths = currentPositionLiftPercent100ths and operationalStatus to Stopped.'),
    );

    // Simulate multiple interval executions
    for (let i = 0; i < 20; i += 1) {
      await accessoryPlatform.intervalHandler();
    }

    expect(loggerLogSpy).toHaveBeenCalled();
    // expect(loggerLogSpy).not.toHaveBeenCalledWith(LogLevel.ERROR, expect.anything());
    // expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Set liftPercent100thsValue to'));
  });

  it('should call onShutdown without reason', async () => {
    accessoryPlatform.config.unregisterOnShutdown = false;
    await accessoryPlatform.onShutdown();
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, 'onShutdown called with reason:', 'none');
  });
});
