/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ClusterServerObj, IdentifyCluster, Matterbridge, MatterbridgeDevice, MatterbridgeEndpoint, PlatformConfig, WindowCovering, WindowCoveringCluster } from 'matterbridge';
import { AnsiLogger, LogLevel, TimestampFormat } from 'matterbridge/logger';
import { ExampleMatterbridgeAccessoryPlatform } from './platform';
import { jest } from '@jest/globals';

describe('TestPlatform', () => {
  let mockMatterbridge: Matterbridge;
  let mockLog: AnsiLogger;
  let mockConfig: PlatformConfig;
  let accessoryPlatform: ExampleMatterbridgeAccessoryPlatform;

  const log = new AnsiLogger({ logName: 'Jest', logTimestampFormat: TimestampFormat.TIME_MILLIS, logLevel: LogLevel.DEBUG });
  log.logLevel = LogLevel.DEBUG;

  let loggerLogSpy: jest.SpiedFunction<(level: LogLevel, message: string, ...parameters: any[]) => void>;
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;

  async function invokeCommands(cluster: ClusterServerObj): Promise<void> {
    const commands = (cluster as any).commands as object;
    for (const [key, value] of Object.entries(commands)) {
      if (typeof value.handler === 'function') await value.handler({});
    }
  }

  async function invokeCommand(cluster: ClusterServerObj, command: string, data?: Record<string, boolean | number | bigint | string | object | null | undefined>): Promise<void> {
    const commands = (cluster as any).commands as object;
    for (const [key, value] of Object.entries(commands)) {
      if (key === command && typeof value.handler === 'function') await value.handler(data ?? {});
    }
  }

  beforeAll(async () => {
    mockMatterbridge = {
      matterbridgeDirectory: './jest/matterbridge',
      matterbridgePluginDirectory: './jest/plugins',
      systemInformation: { ipv4Address: undefined },
      matterbridgeVersion: '1.6.7',
      getDevices: jest.fn(() => {
        // console.log('getDevices called');
        return [];
      }),
      addBridgedDevice: jest.fn(async (pluginName: string, device: MatterbridgeDevice) => {
        // console.log('addBridgedDevice called');
      }),
      addBridgedEndpoint: jest.fn(async (pluginName: string, device: MatterbridgeEndpoint) => {
        // console.log('addBridgedEndpoint called');
        // await aggregator.add(device);
      }),
      removeBridgedDevice: jest.fn(async (pluginName: string, device: MatterbridgeDevice) => {
        // console.log('removeBridgedDevice called');
      }),
      removeBridgedEndpoint: jest.fn(async (pluginName: string, device: MatterbridgeEndpoint) => {
        // console.log('removeBridgedEndpoint called');
      }),
      removeAllBridgedDevices: jest.fn(async (pluginName: string) => {
        // console.log('removeAllBridgedDevices called');
      }),
      removeAllBridgedEndpoints: jest.fn(async (pluginName: string) => {
        // console.log('removeAllBridgedEndpoints called');
      }),
    } as unknown as Matterbridge;
    mockLog = {
      fatal: jest.fn((message: string, ...parameters: any[]) => {
        // console.error('mockLog.fatal', message, parameters);
      }),
      error: jest.fn((message: string, ...parameters: any[]) => {
        // console.error('mockLog.error', message, parameters);
      }),
      warn: jest.fn((message: string, ...parameters: any[]) => {
        // console.error('mockLog.warn', message, parameters);
      }),
      notice: jest.fn((message: string, ...parameters: any[]) => {
        // console.error('mockLog.notice', message, parameters);
      }),
      info: jest.fn((message: string, ...parameters: any[]) => {
        // console.error('mockLog.info', message, parameters);
      }),
      debug: jest.fn((message: string, ...parameters: any[]) => {
        // console.error('mockLog.debug', message, parameters);
      }),
    } as unknown as AnsiLogger;
    mockConfig = {
      'name': 'matterbridge-example-accessory-platform',
      'type': 'AccessoryPlatform',
      'unregisterOnShutdown': false,
      'debug': false,
    } as PlatformConfig;

    // Spy on and mock the AnsiLogger.log method
    loggerLogSpy = jest.spyOn(AnsiLogger.prototype, 'log').mockImplementation((level: string, message: string, ...parameters: any[]) => {
      // console.error(`Mocked AnsiLogger.log: ${level} - ${message}`, ...parameters);
    });

    // Spy on and mock console.log
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation((...args: any[]) => {
      // console.error('Mocked console.log', args);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    loggerLogSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  afterEach(async () => {
    if (accessoryPlatform) await accessoryPlatform.onShutdown('Test reason');
    jest.clearAllTimers();
  });

  it('should initialize platform with config name', () => {
    accessoryPlatform = new ExampleMatterbridgeAccessoryPlatform(mockMatterbridge, mockLog, mockConfig);
    expect(mockLog.info).toHaveBeenCalledWith('Initializing platform:', mockConfig.name);
  });

  it('should throw error in load when version is not valid', () => {
    mockMatterbridge.matterbridgeVersion = '1.5.0';
    expect(() => new ExampleMatterbridgeAccessoryPlatform(mockMatterbridge, mockLog, mockConfig)).toThrow(
      'This plugin requires Matterbridge version >= "1.6.6". Please update Matterbridge from 1.5.0 to the latest version in the frontend.',
    );
    mockMatterbridge.matterbridgeVersion = '1.6.6';
  });

  it('should call onStart in edge mode', async () => {
    mockMatterbridge.edge = true;
    accessoryPlatform.version = '1.6.6';
    await accessoryPlatform.onStart('Test reason');
    expect(mockLog.info).toHaveBeenCalledWith('onStart called with reason:', 'Test reason');
  }, 60000);

  it('should call onConfigure in edge mode', async () => {
    jest.useFakeTimers();

    await accessoryPlatform.onConfigure();
    expect(mockLog.info).toHaveBeenCalledWith('onConfigure called');

    jest.advanceTimersByTime(60 * 1000);
    jest.useRealTimers();
  });

  it('should call onShutdown  in edge mode', async () => {
    await accessoryPlatform.onShutdown('Test reason');
    expect(mockLog.info).toHaveBeenCalledWith('onShutdown called with reason:', 'Test reason');
    mockMatterbridge.edge = false;
  });

  it('should call onStart with reason', async () => {
    accessoryPlatform.version = '1.6.6';
    await accessoryPlatform.onStart('Test reason');
    expect(mockLog.info).toHaveBeenCalledWith('onStart called with reason:', 'Test reason');

    // Invoke command handlers
    const identify = accessoryPlatform.cover?.getClusterServer(IdentifyCluster);
    expect(identify).toBeDefined();
    if (identify) await invokeCommands(identify as unknown as ClusterServerObj);

    const cover = accessoryPlatform.cover?.getClusterServer(WindowCoveringCluster.with(WindowCovering.Feature.Lift, WindowCovering.Feature.PositionAwareLift));
    expect(cover).toBeDefined();
    if (!cover) return;

    await invokeCommand(cover as unknown as ClusterServerObj, 'stopMotion');
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, 'Command stopMotion called');

    await invokeCommand(cover as unknown as ClusterServerObj, 'upOrOpen');
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, 'Command upOrOpen called');

    await invokeCommand(cover as unknown as ClusterServerObj, 'downOrClose');
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, 'Command downOrClose called');

    await invokeCommand(cover as unknown as ClusterServerObj, 'goToLiftPercentage', { liftPercent100thsValue: 5000 });
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, 'Command goToLiftPercentage 5000 called');

    cover.setModeAttribute({ motorDirectionReversed: false, calibrationMode: false, maintenanceMode: false, ledFeedback: false });
    expect(loggerLogSpy).toHaveBeenCalledWith(LogLevel.INFO, expect.stringContaining('Attribute mode changed'));
  });

  it('should call onConfigure', async () => {
    jest.useFakeTimers();

    await accessoryPlatform.onConfigure();
    expect(mockLog.info).toHaveBeenCalledWith('onConfigure called');

    jest.advanceTimersByTime(60 * 1000);
    jest.useRealTimers();
  });

  it('should call onShutdown with reason', async () => {
    await accessoryPlatform.onShutdown('Test reason');
    expect(mockLog.info).toHaveBeenCalledWith('onShutdown called with reason:', 'Test reason');
  });
});
