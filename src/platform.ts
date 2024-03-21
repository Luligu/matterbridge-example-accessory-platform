import { DeviceTypes, WindowCovering } from 'matterbridge';

import { Matterbridge, MatterbridgeDevice, MatterbridgeAccessoryPlatform } from 'matterbridge';
import { AnsiLogger } from 'node-ansi-logger';

export class ExampleMatterbridgeAccessoryPlatform extends MatterbridgeAccessoryPlatform {
  cover: MatterbridgeDevice | undefined;
  coverInterval: NodeJS.Timeout | undefined;

  constructor(matterbridge: Matterbridge, log: AnsiLogger) {
    super(matterbridge, log);
  }

  override async onStart(reason?: string) {
    this.log.info('onStart called with reason:', reason ?? 'none');

    this.cover = new MatterbridgeDevice(DeviceTypes.WINDOW_COVERING);
    this.cover.createDefaultIdentifyClusterServer();
    this.cover.createDefaultBasicInformationClusterServer('Accessory device', '0x59108853', 0xfff1, 'Luligu', 0x0001, 'Accessory device');
    this.cover.createDefaultPowerSourceWiredClusterServer();
    this.cover.createDefaultWindowCoveringClusterServer(10000);
    await this.registerDevice(this.cover);

    this.cover.addCommandHandler('identify', async ({ request: { identifyTime } }) => {
      this.log.info(`Command identify called identifyTime:${identifyTime}`);
    });

    this.cover.addCommandHandler('stopMotion', async ({ attributes: { currentPositionLiftPercent100ths, targetPositionLiftPercent100ths, operationalStatus } }) => {
      const position = currentPositionLiftPercent100ths?.getLocal();
      if (position !== null && position !== undefined) targetPositionLiftPercent100ths?.setLocal(position);
      operationalStatus.setLocal({
        global: WindowCovering.MovementStatus.Stopped,
        lift: WindowCovering.MovementStatus.Stopped,
        tilt: WindowCovering.MovementStatus.Stopped,
      });
      this.log.debug(`Command stopMotion called. Attributes: currentPositionLiftPercent100ths: ${currentPositionLiftPercent100ths?.getLocal()}`);
      this.log.debug(`Command stopMotion called. Attributes: targetPositionLiftPercent100ths: ${targetPositionLiftPercent100ths?.getLocal()}`);
      this.log.debug(`Command stopMotion called. Attributes: operationalStatus: ${operationalStatus?.getLocal().lift}`);
    });

    this.cover.addCommandHandler(
      'goToLiftPercentage',
      async ({ request: { liftPercent100thsValue }, attributes: { currentPositionLiftPercent100ths, targetPositionLiftPercent100ths, operationalStatus } }) => {
        currentPositionLiftPercent100ths?.setLocal(liftPercent100thsValue);
        targetPositionLiftPercent100ths?.setLocal(liftPercent100thsValue);
        operationalStatus.setLocal({
          global: WindowCovering.MovementStatus.Stopped,
          lift: WindowCovering.MovementStatus.Stopped,
          tilt: WindowCovering.MovementStatus.Stopped,
        });
        this.log.info(`Command goToLiftPercentage called. Request: liftPercent100thsValue: ${liftPercent100thsValue} `);
        this.log.debug(`Command goToLiftPercentage called. Attributes: currentPositionLiftPercent100ths: ${currentPositionLiftPercent100ths?.getLocal()}`);
        this.log.debug(`Command goToLiftPercentage called. Attributes: targetPositionLiftPercent100ths: ${targetPositionLiftPercent100ths?.getLocal()}`);
        this.log.debug(`Command goToLiftPercentage called. Attributes: operationalStatus: ${operationalStatus?.getLocal().lift}`);
      },
    );
  }

  override async onConfigure() {
    this.log.info('onConfigure called');

    // Set cover to target = current position and status to stopped (current position is persisted in the cluster)
    this.cover?.setWindowCoveringTargetAsCurrentAndStopped();
    this.log.debug('Set cover initial targetPositionLiftPercent100ths = currentPositionLiftPercent100ths and operationalStatus to Stopped.');

    this.coverInterval = setInterval(() => {
      if (!this.cover) return;
      const coverCluster = this.cover.getClusterServer(WindowCovering.Complete);
      if (coverCluster && coverCluster.getCurrentPositionLiftPercent100thsAttribute) {
        let position = coverCluster.getCurrentPositionLiftPercent100thsAttribute();
        if (position === null || position === undefined) return;
        position = position + 1000;
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
    clearInterval(this.coverInterval);
    await this.unregisterAllDevices();
  }
}
