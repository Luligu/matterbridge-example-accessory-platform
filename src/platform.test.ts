import path from 'node:path';
import { rmSync } from 'node:fs';

import { bridge, Matterbridge, MatterbridgeEndpoint, PlatformConfig } from 'matterbridge';
import { AnsiLogger, LogLevel, TimestampFormat } from 'matterbridge/logger';
import { ServerNode, Endpoint, LogLevel as Level, LogFormat as Format, MdnsService } from 'matterbridge/matter';
import { AggregatorEndpoint } from 'matterbridge/matter/endpoints';
import { Identify, PowerSource, WindowCovering } from 'matterbridge/matter/clusters';
import { jest } from '@jest/globals';

import { ExampleMatterbridgeAccessoryPlatform } from './platform.js';
import { createTestEnvironment, loggerLogSpy, setupTest } from './jestHelpers.ts';

// Setup the test environment
setupTest('Platform', false);

describe('TestPlatform', () => {
  let matterbridge: Matterbridge;
  let server: ServerNode<ServerNode.RootEndpoint>;
  let aggregator: Endpoint<AggregatorEndpoint>;
  let device: MatterbridgeEndpoint;
  const deviceType = bridge;

  let accessoryPlatform: ExampleMatterbridgeAccessoryPlatform;
  const log = new AnsiLogger({ logName: 'JestAccessory', logTimestampFormat: TimestampFormat.TIME_MILLIS, logLevel: LogLevel.DEBUG });

  const mockLog = {
    fatal: jest.fn((message: string, ...parameters: any[]) => {
      log.fatal(message, ...parameters);
    }),
    error: jest.fn((message: string, ...parameters: any[]) => {
      log.error(message, ...parameters);
    }),
    warn: jest.fn((message: string, ...parameters: any[]) => {
      log.warn(message, ...parameters);
    }),
    notice: jest.fn((message: string, ...parameters: any[]) => {
      log.notice(message, ...parameters);
    }),
    info: jest.fn((message: string, ...parameters: any[]) => {
      log.info(message, ...parameters);
    }),
    debug: jest.fn((message: string, ...parameters: any[]) => {
      log.debug(message, ...parameters);
    }),
  } as unknown as AnsiLogger;

  const mockMatterbridge = {
    homeDirectory: path.join('jest', 'platform'),
    matterbridgeDirectory: path.join('jest', 'platform', '.matterbridge'),
    matterbridgePluginDirectory: path.join('jest', 'platform', 'Matterbridge'),
    systemInformation: { ipv4Address: undefined, ipv6Address: undefined, osRelease: 'xx.xx.xx.xx.xx.xx', nodeVersion: '22.1.10' },
    matterbridgeVersion: '3.3.0',
    log: mockLog,
    getDevices: jest.fn(() => {
      return [];
    }),
    getPlugins: jest.fn(() => {
      return [];
    }),
    addBridgedEndpoint: jest.fn(async (pluginName: string, device: MatterbridgeEndpoint) => {
      await aggregator.add(device);
    }),
    removeBridgedEndpoint: jest.fn(async (pluginName: string, device: MatterbridgeEndpoint) => {}),
    removeAllBridgedEndpoints: jest.fn(async (pluginName: string) => {}),
  } as unknown as Matterbridge;

  const mockConfig: PlatformConfig = {
    name: 'matterbridge-example-accessory-platform',
    type: 'AccessoryPlatform',
    version: '1.0.0',
    unregisterOnShutdown: false,
    debug: true,
  };

  beforeAll(async () => {
    // Create a MatterbridgeEdge instance
    matterbridge = await Matterbridge.loadInstance(false);

    // Setup matter environment
    // @ts-expect-error - access to private member for testing
    matterbridge.environment = createTestEnvironment(path.join('jest', 'Platform'));
  });

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    //
  });

  afterAll(async () => {
    // Close the Matterbridge instance
    await matterbridge.destroyInstance();

    // Restore all mocks
    jest.restoreAllMocks();
  });

  it('should create the context', async () => {
    // @ts-expect-error - access to private member for testing
    await matterbridge.startMatterStorage();
    expect(matterbridge.matterStorageService).toBeDefined();
    expect(matterbridge.matterStorageManager).toBeDefined();
    expect(matterbridge.matterbridgeContext).toBeDefined();
  });

  it('should create the server', async () => {
    // @ts-expect-error - access to private member for testing
    server = await matterbridge.createServerNode(matterbridge.matterbridgeContext);
    expect(server).toBeDefined();
  });

  it('should create the aggregator', async () => {
    // @ts-expect-error - access to private member for testing
    aggregator = await matterbridge.createAggregatorNode(matterbridge.matterbridgeContext);
    expect(aggregator).toBeDefined();
  });

  it('should add the aggregator to the server', async () => {
    expect(await server.add(aggregator)).toBeDefined();
  });

  it('should start the server', async () => {
    // @ts-expect-error - access to private member for testing
    await matterbridge.startServerNode(server);
    expect(server.lifecycle.isOnline).toBe(true);
  });

  it('should throw error in load when version is not valid', () => {
    mockMatterbridge.matterbridgeVersion = '1.5.0';
    expect(() => new ExampleMatterbridgeAccessoryPlatform(mockMatterbridge, mockLog, mockConfig)).toThrow(
      'This plugin requires Matterbridge version >= "3.3.0". Please update Matterbridge from 1.5.0 to the latest version in the frontend.',
    );
    mockMatterbridge.matterbridgeVersion = '3.3.0';
  });

  it('should initialize platform with config name', () => {
    accessoryPlatform = new ExampleMatterbridgeAccessoryPlatform(mockMatterbridge, mockLog, mockConfig);
    expect(mockLog.info).toHaveBeenCalledWith('Initializing platform:', mockConfig.name);
  });

  it('should call onStart with reason', async () => {
    accessoryPlatform.version = '1.6.6';
    await accessoryPlatform.onStart('Test reason');
    expect(mockLog.info).toHaveBeenCalledWith('onStart called with reason:', 'Test reason');

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
    expect(mockLog.info).toHaveBeenCalledWith('onConfigure called');
    expect(mockLog.info).toHaveBeenCalledWith('Set cover initial targetPositionLiftPercent100ths = currentPositionLiftPercent100ths and operationalStatus to Stopped.');

    for (let i = 0; i < 50; i++) {
      // Flush microtasks
      for (let i = 0; i < 10; i++) await Promise.resolve();
      jest.advanceTimersByTimeAsync(60 * 1000);
      // Flush microtasks
      for (let i = 0; i < 10; i++) await Promise.resolve();
    }

    expect(loggerLogSpy).toHaveBeenCalledTimes(13);
    expect(mockLog.info).toHaveBeenCalledTimes(2);
    // expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.ERROR, expect.anything());
    // expect(mockLog.info).toHaveBeenCalledWith(expect.stringContaining('Set liftPercent100thsValue to'));

    jest.useRealTimers();

    // Log all calls to loggerLogSpy
    /*
    consoleLogSpy.mockRestore();
    loggerLogSpy.mock.calls.forEach((call, index) => {
      console.log(`Call ${index + 1}:`, call);
    });
    */
  });

  it('should call onShutdown with reason', async () => {
    await accessoryPlatform.onShutdown('Test reason');
    expect(mockLog.info).toHaveBeenCalledWith('onShutdown called with reason:', 'Test reason');
  });

  it('should stop the server', async () => {
    // @ts-expect-error - access to private member for testing
    await matterbridge.stopServerNode(server);
    expect(server.lifecycle.isOnline).toBe(false);
    await server.env.get(MdnsService)[Symbol.asyncDispose]();
  });

  it('should stop the storage', async () => {
    // @ts-expect-error - access to private member for testing
    await matterbridge.stopMatterStorage();
    expect(matterbridge.matterStorageService).not.toBeDefined();
    expect(matterbridge.matterStorageManager).not.toBeDefined();
    expect(matterbridge.matterbridgeContext).not.toBeDefined();
  });
});
