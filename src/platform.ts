import { DeviceTypes, WindowCovering, WindowCoveringCluster } from 'matterbridge';

import { Matterbridge, MatterbridgeDevice, MatterbridgeAccessoryPlatform } from 'matterbridge';
import { AnsiLogger } from 'node-ansi-logger';

export class ExampleMatterbridgeAccessoryPlatform extends MatterbridgeAccessoryPlatform {
  constructor(matterbridge: Matterbridge, log: AnsiLogger) {
    super(matterbridge, log);
  }

  override async onStart(reason?: string) {
    this.log.info('onStart called with reason:', reason ?? 'none');

    const cover = new MatterbridgeDevice(DeviceTypes.WINDOW_COVERING);
    cover.createDefaultIdentifyClusterServer();
    cover.createDefaultBasicInformationClusterServer('Accessory device', '0x59108853', 0xfff1, 'Luligu', 0x0001, 'Accessory device');
    cover.createDefaultPowerSourceWiredClusterServer();
    cover.createDefaultWindowCoveringClusterServer(10000);
    await this.registerDevice(cover);

    cover.addCommandHandler('identify', async ({ request: { identifyTime } }) => {
      this.log.info(`Command identify called identifyTime:${identifyTime}`);
    });

    cover.addCommandHandler('goToLiftPercentage', async ({ request: { liftPercent100thsValue } }) => {
      this.log.info(`Command goToLiftPercentage called liftPercent100thsValue:${liftPercent100thsValue}`);
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
        this.log.info(`Set liftPercent100thsValue to ${position}`);
      }
    }, 60 * 1000);
  }

  override async onShutdown(reason?: string) {
    this.log.info('onShutdown called with reason:', reason ?? 'none');
  }
}
