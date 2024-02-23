/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommissioningController, CommissioningServer, MatterServer, NodeCommissioningOptions } from '@project-chip/matter-node.js';
import { EndpointNumber, NodeId, VendorId } from '@project-chip/matter-node.js/datatype';
import { Aggregator, ComposedDevice, Device, DeviceClasses, DeviceTypeDefinition, DeviceTypes, Endpoint, NodeStateInformation, 
  OnOffPluginUnitDevice, PairedNode, getDeviceTypeDefinitionByCode } from '@project-chip/matter-node.js/device';
import { Format, Level, Logger } from '@project-chip/matter-node.js/log';
import { ManualPairingCodeCodec, QrCodeSchema } from '@project-chip/matter-node.js/schema';
import { StorageBackendDisk, StorageBackendJsonFile, StorageContext, StorageManager } from '@project-chip/matter-node.js/storage';
import { requireMinNodeVersion, getParameter, getIntParameter, hasParameter, singleton, ByteArray } from '@project-chip/matter-node.js/util';
import { logEndpoint } from '@project-chip/matter-node.js/device';
import { Crypto, CryptoNode } from '@project-chip/matter-node.js/crypto';
import { CommissioningOptions } from '@project-chip/matter.js/protocol';
import {
  AllClustersMap, AttributeInitialValues, BasicInformationCluster, BooleanState, ClusterServer, GeneralCommissioning,
  Identify, IdentifyCluster,
  IlluminanceMeasurement, IlluminanceMeasurementCluster,
  OccupancySensing, OccupancySensingCluster, OnOff,
  PowerSource, PowerSourceCluster, PressureMeasurement, RelativeHumidityMeasurement,
  TemperatureMeasurement, getClusterNameById, EventPriority, ActionsCluster, Actions, WindowCovering, WindowCoveringCluster
} from '@project-chip/matter-node.js/cluster';

import { Matterbridge } from '../../matterbridge/dist/matterbridge.js'; 
import { 
  MatterbridgeDevice,
  MatterbridgeDynamicPlatform,
  MatterbridgePlatform,
  createDefaultBasicInformationClusterServer,
  createDefaultBooleanStateClusterServer,
  createDefaultBridgedDeviceBasicInformationClusterServer, 
  createDefaultIdentifyClusterServer, 
  createDefaultWindowCoveringClusterServer
} from '../../matterbridge/dist/index.js'; 
import { AnsiLogger, REVERSE, REVERSEOFF } from 'node-ansi-logger';
import { Time, TimeNode } from '@project-chip/matter-node.js/time';
import { Network, NetworkNode } from '@project-chip/matter-node.js/net';

/**
 * This is the standard interface for MatterBridge plugins.
 * Each plugin should export a default function that follows this signature.
 * 
 * @param matterbridge - An instance of MatterBridge
 */
export default function initializePlugin(matterbridge: Matterbridge, log: AnsiLogger) { 

  // Do nothing just load @project-chip/matter-node.js
  const storageJson = new StorageBackendJsonFile('matterbridge-example');
  const storageManager = new StorageManager(storageJson);
  const matterServer = new MatterServer(storageManager);

  // Log it's loading
  log.info('My Plugin is loading...');

  new ExampleMatterbridgePlatform(matterbridge, log);
  //new ExampleMatterbridgeDynamicPlatform(matterbridge, log);

  log.info('My Plugin initialized successfully!');
}

class ExampleMatterbridgePlatform extends MatterbridgePlatform {
  constructor(matterbridge: Matterbridge, log: AnsiLogger) {
    super(matterbridge, log);
    log.debug(`ExampleMatterbridgePlatform loaded (matterbridge is running on node v${matterbridge.nodeVersion})`);
  }

  override onStartPlatform(matterbridge: Matterbridge, log: AnsiLogger): void {
    log.info(`onStartPlatform called (matterbridge is running on node v${matterbridge.nodeVersion})`);

    const matterDevice1 = new MatterbridgeDevice(DeviceTypes.WINDOW_COVERING);
    matterDevice1.createDefaultIdentifyClusterServer();
    matterDevice1.addClusterServer(matterDevice1.createDefaultBasicInformationClusterServer('Device1', 'Device1 0x01020304', 0xfff1, 'Luligu', 0x0001, 'Device1'));
    matterDevice1.addClusterServer(matterDevice1.createDefaultOnOffClusterServer());
    matterDevice1.addClusterServer(matterDevice1.createDefaultWindowCoveringClusterServer(0));
    matterbridge.addDevice(matterDevice1);

    matterDevice1.addCommandHandler('identify', async ({ request: { identifyTime } }) => {
      log.warn(`Command identify called identifyTime:${identifyTime}`);
    });

    matterDevice1.addCommandHandler('goToLiftPercentage', async ({ request: { liftPercent100thsValue } }) => {
      log.warn(`Command goToLiftPercentage called liftPercent100thsValue:${liftPercent100thsValue}`);
    });

    /*
    const matterDevice2: Device = new Device(DeviceTypes.CONTACT_SENSOR);
    matterDevice2.addClusterServer(createDefaultIdentifyClusterServer());
    matterDevice2.addClusterServer(createDefaultBasicInformationClusterServer('Device2', 'Device2 0x01450304', 0xfff1, 'Luligu', 0x0002, 'Device2 contact'));
    matterDevice2.addClusterServer(createDefaultBooleanStateClusterServer(true));
    //matterbridge.addDevice(matterDevice2);

    const composed1 = new ComposedDevice(DeviceTypes.WINDOW_COVERING, [matterDevice1]);
    matterbridge.addDevice(composed1 as unknown as Device);
    const composed2 = new ComposedDevice(DeviceTypes.CONTACT_SENSOR, [ matterDevice2]);
    matterbridge.addDevice(composed2 as unknown as Device);
    */
  }

  override onShutdown(matterbridge: Matterbridge, log: AnsiLogger): void {
    log.info(`onShutdown called (matterbridge is running on node v${matterbridge.nodeVersion})`);
  }
}

class ExampleMatterbridgeDynamicPlatform extends MatterbridgeDynamicPlatform {
  constructor(matterbridge: Matterbridge, log: AnsiLogger) {
    super(matterbridge, log);
    log.debug(`ExampleMatterbridgeDynamicPlatform loaded (matterbridge is running on node v${matterbridge.nodeVersion})`);
  }

  override onStartDynamicPlatform(matterbridge: Matterbridge, log: AnsiLogger): void {
    log.info(`onStartDynamicPlatform called (matterbridge is running on node v${matterbridge.nodeVersion})`);
    const matterDevice1: Device = new Device(DeviceTypes.WINDOW_COVERING);
    matterDevice1.addClusterServer(createDefaultIdentifyClusterServer());
    matterDevice1.addClusterServer(createDefaultBridgedDeviceBasicInformationClusterServer('BridgedDevice1', 'BridgedDevice1 0x01020304', 0xfff1, 'Luligu', 'BridgedDevice1'));
    matterDevice1.addClusterServer(createDefaultWindowCoveringClusterServer(undefined, 0));
    matterbridge.addBridgedDevice(matterDevice1);
    // eslint-disable-next-line max-len
    //matterDevice1?.getClusterServer(WindowCoveringCluster.with(WindowCovering.Feature.Lift, WindowCovering.Feature.PositionAwareLift))?.setCurrentPositionLiftPercent100thsAttribute(history.getFakeLevel(0, 10000, 0));
    // eslint-disable-next-line max-len
    //matterDevice1?.getClusterServer(WindowCoveringCluster.with(WindowCovering.Feature.Lift, WindowCovering.Feature.PositionAwareLift))?.setTargetPositionLiftPercent100thsAttribute(history.getFakeLevel(0, 10000, 0));
  }

  override onShutdown(matterbridge: Matterbridge, log: AnsiLogger): void {
    log.info(`onShutdown called (matterbridge is running on node v${matterbridge.nodeVersion})`);
  }
}

