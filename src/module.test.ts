const MATTER_PORT = 6000;
const NAME = 'Platform';
const HOMEDIR = path.join('jest', NAME);

import path from 'node:path';

import { Matterbridge, MatterbridgeEndpoint, PlatformConfig } from 'matterbridge';
import { AnsiLogger, LogLevel, TimestampFormat } from 'matterbridge/logger';
import { ServerNode, Endpoint, LogLevel as Level, LogFormat as Format, MdnsService } from 'matterbridge/matter';
import { AggregatorEndpoint } from 'matterbridge/matter/endpoints';
import { Identify, PowerSource, WindowCovering } from 'matterbridge/matter/clusters';
import { jest } from '@jest/globals';

import initializePlugin, { ExampleMatterbridgeAccessoryPlatform } from './module.js';
import {
  createMatterbridgeEnvironment,
  createTestEnvironment,
  destroyMatterbridgeEnvironment,
  loggerLogSpy,
  setDebug,
  setupTest,
  startMatterbridgeEnvironment,
  stopMatterbridgeEnvironment,
} from './jestHelpers.ts';

// Setup the test environment
setupTest(NAME, false);

describe('TestPlatform', () => {
  let matterbridge: Matterbridge;
  let server: ServerNode<ServerNode.RootEndpoint>;
  let aggregator: Endpoint<AggregatorEndpoint>;
  let accessoryPlatform: ExampleMatterbridgeAccessoryPlatform;
  let log: AnsiLogger;

  const config: PlatformConfig = {
    name: 'matterbridge-example-accessory-platform',
    type: 'AccessoryPlatform',
    version: '1.0.0',
    unregisterOnShutdown: false,
    debug: true,
  };

  beforeAll(async () => {
    matterbridge = await createMatterbridgeEnvironment(NAME);
    [server, aggregator] = await startMatterbridgeEnvironment(matterbridge, MATTER_PORT);
    log = new AnsiLogger({ logName: NAME, logTimestampFormat: TimestampFormat.TIME_MILLIS, logLevel: LogLevel.DEBUG });
  });

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    //
  });

  afterAll(async () => {
    await stopMatterbridgeEnvironment(matterbridge, server, aggregator);
    await destroyMatterbridgeEnvironment(matterbridge);
    // Restore all mocks
    jest.restoreAllMocks();
  });

  it('should return an instance of TestPlatform', async () => {
    const platform = initializePlugin(matterbridge, log, config);
    expect(platform).toBeInstanceOf(ExampleMatterbridgeAccessoryPlatform);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, 'Initializing platform:', config.name);
    await platform.onShutdown('Test reason');
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, 'onShutdown called with reason:', 'Test reason');
  });

  it('should throw error in load when version is not valid', () => {
    matterbridge.matterbridgeVersion = '1.5.0';
    expect(() => new ExampleMatterbridgeAccessoryPlatform(matterbridge, log, config)).toThrow(
      'This plugin requires Matterbridge version >= "3.3.0". Please update Matterbridge from 1.5.0 to the latest version in the frontend.',
    );
    matterbridge.matterbridgeVersion = '3.3.0';
  });

  it('should initialize platform with config name', () => {
    // @ts-expect-error accessing private member for testing
    matterbridge.plugins._plugins.set('matterbridge-jest', {});
    accessoryPlatform = new ExampleMatterbridgeAccessoryPlatform(matterbridge, log, config);
    accessoryPlatform['name'] = 'matterbridge-jest';
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, 'Initializing platform:', config.name);
  });

  it('should call onStart without reason', async () => {
    accessoryPlatform.version = '1.6.6';
    await accessoryPlatform.onStart();
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, 'onStart called with reason:', 'none');

    expect(accessoryPlatform.cover).toBeDefined();

    expect(accessoryPlatform.cover?.hasClusterServer(Identify.Cluster)).toBeTruthy();
    expect(accessoryPlatform.cover?.hasClusterServer(WindowCovering.Cluster.with(WindowCovering.Feature.Lift, WindowCovering.Feature.PositionAwareLift))).toBeTruthy();
    expect(accessoryPlatform.cover?.hasClusterServer(PowerSource.Cluster.id)).toBeTruthy();

    // Invoke command handlers
    await accessoryPlatform.cover?.executeCommandHandler('identify', { identifyTime: 1 });
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining(`Command identify called identifyTime: 1`));

    await accessoryPlatform.cover?.executeCommandHandler('stopMotion', {} as any);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Command stopMotion called'));

    await accessoryPlatform.cover?.executeCommandHandler('upOrOpen', {} as any);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Command upOrOpen called'));

    await accessoryPlatform.cover?.executeCommandHandler('downOrClose', {} as any);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Command downOrClose called'));

    await accessoryPlatform.cover?.executeCommandHandler('goToLiftPercentage', { liftPercent100thsValue: 100 });
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Command goToLiftPercentage called request 100'));
  });

  it('should call onConfigure', async () => {
    jest.useFakeTimers();

    await accessoryPlatform.onConfigure();
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('onConfigure called'));
    expect(loggerLogSpy).toHaveBeenCalledWith(
      LogLevel.INFO,
      expect.stringContaining('Set cover initial targetPositionLiftPercent100ths = currentPositionLiftPercent100ths and operationalStatus to Stopped.'),
    );

    for (let i = 0; i < 50; i++) {
      // Flush microtasks
      for (let i = 0; i < 10; i++) await Promise.resolve();
      jest.advanceTimersByTimeAsync(60 * 1000);
      // Flush microtasks
      for (let i = 0; i < 10; i++) await Promise.resolve();
    }

    expect(loggerLogSpy).toHaveBeenCalledTimes(13);
    expect(loggerLogSpy).not.toHaveBeenCalledWith(LogLevel.ERROR, expect.anything());

    jest.useRealTimers();
  });

  it('should call onShutdown without reason', async () => {
    accessoryPlatform.config.unregisterOnShutdown = true;
    await accessoryPlatform.onShutdown();
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, 'onShutdown called with reason:', 'none');
  });
});
