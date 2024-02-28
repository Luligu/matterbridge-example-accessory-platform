import { DeviceTypes } from '@project-chip/matter-node.js/device';

import { Matterbridge, MatterbridgeDevice, MatterbridgeAccessoryPlatform } from '../../matterbridge/dist/index.js';
import { AnsiLogger } from 'node-ansi-logger';
import { WindowCovering, WindowCoveringCluster } from '@project-chip/matter-node.js/cluster';

export class ExampleMatterbridgeAccessoryPlatform extends MatterbridgeAccessoryPlatform {
  constructor(matterbridge: Matterbridge, log: AnsiLogger) {
    super(matterbridge, log);
  }

  override onStartAccessoryPlatform(): void {
    this.log.info('onStartAccessoryPlatform called');

    const cover = new MatterbridgeDevice(DeviceTypes.WINDOW_COVERING);
    cover.createDefaultIdentifyClusterServer();
    cover.createDefaultBasicInformationClusterServer('Device1', 'Device1 0x9010880304', 0xfff1, 'Luligu', 0x0001, 'Device1');
    cover.createDefaultWindowCoveringClusterServer(10000);
    this.registerDevice(cover);

    cover.addCommandHandler('identify', async ({ request: { identifyTime } }) => {
      this.log.warn(`Command identify called identifyTime:${identifyTime}`);
    });

    cover.addCommandHandler('goToLiftPercentage', async ({ request: { liftPercent100thsValue } }) => {
      this.log.warn(`Command goToLiftPercentage called liftPercent100thsValue:${liftPercent100thsValue}`);
    });

    setInterval(() => {
      const coverCluster = cover.getClusterServer(WindowCoveringCluster.with(WindowCovering.Feature.Lift, WindowCovering.Feature.PositionAwareLift));
      if (coverCluster && coverCluster.getCurrentPositionLiftPercent100thsAttribute) {
        let position = coverCluster.getCurrentPositionLiftPercent100thsAttribute()! + 1000;
        position = position > 10000 ? 0 : position;
        coverCluster.setTargetPositionLiftPercent100thsAttribute(position);
        coverCluster.setCurrentPositionLiftPercent100thsAttribute(position);
        coverCluster.setOperationalStatusAttribute({
          global: WindowCovering.MovementStatus.Stopped,
          lift: WindowCovering.MovementStatus.Stopped,
          tilt: WindowCovering.MovementStatus.Stopped,
        });
        this.log.warn(`Set liftPercent100thsValue to ${position}`);
      }
    }, 10 * 1000);
  }

  override onShutdown(): void {
    this.log.info('onShutdown called');
  }
}
