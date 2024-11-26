/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ClusterServerObj, IdentifyCluster, Matterbridge, PlatformConfig, WindowCovering, WindowCoveringCluster } from 'matterbridge';
import { AnsiLogger, LogLevel, TimestampFormat } from 'matterbridge/logger';
import { ExampleMatterbridgeAccessoryPlatform } from './platform';
import { jest } from '@jest/globals';
import { wait } from 'matterbridge/utils';
import exp from 'constants';

describe('TestPlatform', () => {
  let mockMatterbridge: Matterbridge;
  let mockLog: AnsiLogger;
  let mockConfig: PlatformConfig;
  let accessoryPlatform: ExampleMatterbridgeAccessoryPlatform;

  const log = new AnsiLogger({ logName: 'Jest', logTimestampFormat: TimestampFormat.TIME_MILLIS, logLevel: LogLevel.DEBUG });
  log.logLevel = LogLevel.DEBUG;

  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;

  function invokeCommands(cluster: ClusterServerObj): void {
    const commands = (cluster as any).commands as object;
    Object.entries(commands).forEach(([key, value]) => {
      if (typeof value.handler === 'function') value.handler({});
    });
  }

  beforeAll(() => {
    mockMatterbridge = {
      addBridgedDevice: jest.fn(),
      matterbridgeDirectory: '',
      matterbridgePluginDirectory: 'temp',
      systemInformation: { ipv4Address: undefined },
      matterbridgeVersion: '1.6.2',
      removeAllBridgedDevices: jest.fn(),
    } as unknown as Matterbridge;
    mockLog = { fatal: jest.fn(), error: jest.fn(), warn: jest.fn(), notice: jest.fn(), info: jest.fn(), debug: jest.fn() } as unknown as AnsiLogger;
    mockConfig = {
      'name': 'matterbridge-example-accessory-platform',
      'type': 'AccessoryPlatform',
      'unregisterOnShutdown': false,
      'debug': false,
    } as PlatformConfig;

    // Spy on and mock console.log
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation((...args: any[]) => {
      // console.error(args);
    });
  });

  it('should initialize platform with config name', () => {
    accessoryPlatform = new ExampleMatterbridgeAccessoryPlatform(mockMatterbridge, mockLog, mockConfig);
    expect(mockLog.info).toHaveBeenCalledWith('Initializing platform:', mockConfig.name);
  });

  it('should throw error in load when version is not valid', () => {
    mockMatterbridge.matterbridgeVersion = '1.5.0';
    expect(() => new ExampleMatterbridgeAccessoryPlatform(mockMatterbridge, mockLog, mockConfig)).toThrow(
      'This plugin requires Matterbridge version >= "1.6.2". Please update Matterbridge from 1.5.0 to the latest version in the frontend.',
    );
    mockMatterbridge.matterbridgeVersion = '1.6.2';
  });

  it('should call onStart with reason', async () => {
    await accessoryPlatform.onStart('Test reason');
    expect(mockLog.info).toHaveBeenCalledWith('onStart called with reason:', 'Test reason');

    // Invoke command handlers
    const identify = accessoryPlatform.cover?.getClusterServer(IdentifyCluster);
    expect(identify).toBeDefined();
    if (identify) invokeCommands(identify as unknown as ClusterServerObj);

    const cover = accessoryPlatform.cover?.getClusterServer(WindowCoveringCluster.with(WindowCovering.Feature.Lift, WindowCovering.Feature.PositionAwareLift));
    expect(cover).toBeDefined();
    if (cover) {
      invokeCommands(cover as unknown as ClusterServerObj);
      cover.setModeAttribute({ motorDirectionReversed: false, calibrationMode: false, maintenanceMode: false, ledFeedback: false });
      // eslint-disable-next-line jest/no-conditional-expect
      expect(mockLog.info).toHaveBeenCalledWith(expect.stringContaining('Attribute mode changed'));
    }
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
