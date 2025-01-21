/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { bridge, Descriptor, Identify, Matterbridge, MatterbridgeEndpoint, PlatformConfig, PowerSource, WindowCovering } from 'matterbridge';
import { AnsiLogger, LogLevel, TimestampFormat } from 'matterbridge/logger';
import { StorageContext, ServerNode, Endpoint, AggregatorEndpoint, LogLevel as Level, LogFormat as Format, DeviceTypeId, VendorId, MdnsService } from 'matterbridge/matter';
import { ExampleMatterbridgeAccessoryPlatform } from './platform';
import { jest } from '@jest/globals';
import { wait } from 'matterbridge/utils';

describe('TestPlatform', () => {
  let matterbridge: Matterbridge;
  let context: StorageContext;
  let server: ServerNode<ServerNode.RootEndpoint>;
  let aggregator: Endpoint<AggregatorEndpoint>;
  let device: MatterbridgeEndpoint;
  const deviceType = bridge;

  let accessoryPlatform: ExampleMatterbridgeAccessoryPlatform;

  const mockLog = {
    fatal: jest.fn((message: string, ...parameters: any[]) => {
      // console.log('mockLog.fatal', message, parameters);
    }),
    error: jest.fn((message: string, ...parameters: any[]) => {
      // console.log('mockLog.error', message, parameters);
    }),
    warn: jest.fn((message: string, ...parameters: any[]) => {
      // console.log('mockLog.warn', message, parameters);
    }),
    notice: jest.fn((message: string, ...parameters: any[]) => {
      // console.log('mockLog.notice', message, parameters);
    }),
    info: jest.fn((message: string, ...parameters: any[]) => {
      // console.log('mockLog.info', message, parameters);
    }),
    debug: jest.fn((message: string, ...parameters: any[]) => {
      // console.log('mockLog.debug', message, parameters);
    }),
  } as unknown as AnsiLogger;

  const mockMatterbridge = {
    matterbridgeDirectory: './jest/matterbridge',
    matterbridgePluginDirectory: './jest/plugins',
    systemInformation: { ipv4Address: undefined, ipv6Address: undefined, osRelease: 'xx.xx.xx.xx.xx.xx', nodeVersion: '22.1.10' },
    matterbridgeVersion: '2.0.0',
    edge: true,
    log: mockLog,
    getDevices: jest.fn(() => {
      // console.log('getDevices called');
      return [];
    }),
    getPlugins: jest.fn(() => {
      // console.log('getDevices called');
      return [];
    }),
    addBridgedEndpoint: jest.fn(async (pluginName: string, device: MatterbridgeEndpoint) => {
      // console.log('addBridgedEndpoint called');
    }),
    removeBridgedEndpoint: jest.fn(async (pluginName: string, device: MatterbridgeEndpoint) => {
      // console.log('removeBridgedEndpoint called');
    }),
    removeAllBridgedEndpoints: jest.fn(async (pluginName: string) => {
      // console.log('removeAllBridgedEndpoints called');
    }),
  } as unknown as Matterbridge;

  const mockConfig = {
    'name': 'matterbridge-example-accessory-platform',
    'type': 'AccessoryPlatform',
    'unregisterOnShutdown': false,
    'debug': true,
  } as PlatformConfig;

  // Spy on and mock AnsiLogger.log
  const loggerLogSpy = jest.spyOn(AnsiLogger.prototype, 'log').mockImplementation((level: string, message: string, ...parameters: any[]) => {
    //
  });
  // Spy on and mock console.log
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation((...args: any[]) => {
    //
  });
  // Spy on and mock console.log
  const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation((...args: any[]) => {
    //
  });
  // Spy on and mock console.log
  const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation((...args: any[]) => {
    //
  });
  // Spy on and mock console.log
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation((...args: any[]) => {
    //
  });
  // Spy on and mock console.log
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
    //
  });

  beforeAll(async () => {
    // Create a MatterbridgeEdge instance
    matterbridge = await Matterbridge.loadInstance(false);
    matterbridge.log = new AnsiLogger({ logName: 'Matterbridge', logTimestampFormat: TimestampFormat.TIME_MILLIS, logLevel: LogLevel.DEBUG });

    // Setup matter environment
    matterbridge.environment.vars.set('log.level', Level.DEBUG);
    matterbridge.environment.vars.set('log.format', Format.ANSI);
    matterbridge.environment.vars.set('path.root', 'matterstorage');
    matterbridge.environment.vars.set('runtime.signals', true);
    matterbridge.environment.vars.set('runtime.exitcode', true);
    if (matterbridge.mdnsInterface) matterbridge.environment.vars.set('mdns.networkInterface', matterbridge.mdnsInterface);
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
    await (matterbridge as any).startMatterStorage();
    context = await (matterbridge as any).createServerNodeContext(
      'Jest',
      deviceType.name,
      DeviceTypeId(deviceType.code),
      VendorId(0xfff1),
      'Matterbridge',
      0x8000,
      'Matterbridge ' + deviceType.name.replace('MA-', ''),
    );
    expect(context).toBeDefined();
  });

  it('should create the server', async () => {
    server = await (matterbridge as any).createServerNode(context);
    expect(server).toBeDefined();
  });

  it('should create the aggregator', async () => {
    aggregator = await (matterbridge as any).createAggregatorNode(context);
    expect(aggregator).toBeDefined();
    await server.add(aggregator);
    await server.start();
  });

  it('should add the aggregator to the server', async () => {
    expect(await server.add(aggregator)).toBeDefined();
    await server.start();
  });

  it('should start the server', async () => {
    await server.start();
    expect(server.lifecycle.isOnline).toBe(true);
  });

  it('should throw error in load when version is not valid', () => {
    mockMatterbridge.matterbridgeVersion = '1.5.0';
    expect(() => new ExampleMatterbridgeAccessoryPlatform(mockMatterbridge, mockLog, mockConfig)).toThrow(
      'This plugin requires Matterbridge version >= "2.0.0". Please update Matterbridge from 1.5.0 to the latest version in the frontend.',
    );
    mockMatterbridge.matterbridgeVersion = '2.0.0';
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

    if (accessoryPlatform.cover) await aggregator.add(accessoryPlatform.cover);

    expect(accessoryPlatform.cover?.hasClusterServer(Identify.Cluster)).toBeTruthy();
    expect(accessoryPlatform.cover?.hasClusterServer(WindowCovering.Cluster.with(WindowCovering.Feature.Lift, WindowCovering.Feature.PositionAwareLift))).toBeTruthy();
    expect(accessoryPlatform.cover?.hasClusterServer(PowerSource.Cluster)).toBeTruthy();

    // Invoke command handlers
    await accessoryPlatform.cover?.commandHandler.executeHandler('identify', { request: { identifyTime: 1 } } as any);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Command identify called'));
    await accessoryPlatform.cover?.commandHandler.executeHandler('stopMotion', {} as any);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Command stopMotion called'));
    await accessoryPlatform.cover?.commandHandler.executeHandler('upOrOpen', {} as any);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Command upOrOpen called'));
    await accessoryPlatform.cover?.commandHandler.executeHandler('downOrClose', {} as any);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Command downOrClose called'));
    await accessoryPlatform.cover?.commandHandler.executeHandler('goToLiftPercentage', { request: { liftPercent100thsValue: 100 } } as any);
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Command goToLiftPercentage called'));

    loggerLogSpy.mockClear();
    // Trigger subscribe attribute handler
    await accessoryPlatform.cover?.setAttribute(
      WindowCovering.Cluster.id,
      'mode',
      {
        motorDirectionReversed: false,
        calibrationMode: false,
        maintenanceMode: false,
        ledFeedback: false,
      },
      accessoryPlatform.cover?.log,
    );
    // expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Attribute mode changed'));
  }, 30000);

  it('should call onConfigure', async () => {
    jest.useFakeTimers();

    await accessoryPlatform.onConfigure();
    expect(mockLog.info).toHaveBeenCalledWith('onConfigure called');
    expect(mockLog.info).toHaveBeenCalledWith('Set cover initial targetPositionLiftPercent100ths = currentPositionLiftPercent100ths and operationalStatus to Stopped.');

    for (let i = 0; i < 10; i++) {
      jest.advanceTimersByTime(30 * 1000);
      await Promise.resolve();
    }

    // expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.ERROR, expect.anything());
    // expect(mockLog.info).toHaveBeenCalledWith(expect.stringContaining('Set liftPercent100thsValue to'));

    jest.useRealTimers();
  });

  it('should call onShutdown with reason', async () => {
    await accessoryPlatform.onShutdown('Test reason');
    expect(mockLog.info).toHaveBeenCalledWith('onShutdown called with reason:', 'Test reason');
  });

  it('should stop the server', async () => {
    await server.close();
    expect(server.lifecycle.isOnline).toBe(false);
  }, 30000);
});
