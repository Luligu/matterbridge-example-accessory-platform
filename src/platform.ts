import { Matterbridge, MatterbridgeDevice, MatterbridgeAccessoryPlatform, DeviceTypes, PlatformConfig, WindowCovering, powerSource } from 'matterbridge';
import { AnsiLogger } from 'matterbridge/logger';
import os from 'os';

export class ExampleMatterbridgeAccessoryPlatform extends MatterbridgeAccessoryPlatform {
  cover: MatterbridgeDevice | undefined;
  coverInterval: NodeJS.Timeout | undefined;

  constructor(matterbridge: Matterbridge, log: AnsiLogger, config: PlatformConfig) {
    super(matterbridge, log, config);

    // Verify that Matterbridge is the correct version
    if (this.verifyMatterbridgeVersion === undefined || typeof this.verifyMatterbridgeVersion !== 'function' || !this.verifyMatterbridgeVersion('1.6.0')) {
      throw new Error(`This plugin requires Matterbridge version >= "1.6.0". Please update Matterbridge to the latest version in the frontend."`);
    }

    this.log.info('Initializing platform:', this.config.name);
  }

  override async onStart(reason?: string) {
    this.log.info('onStart called with reason:', reason ?? 'none');

    this.cover = new MatterbridgeDevice(DeviceTypes.WINDOW_COVERING);
    this.cover.createDefaultIdentifyClusterServer();
    this.cover.createDefaultBasicInformationClusterServer('Cover device', `0x59108853_${os.hostname()}`, 0xfff1, 'Matterbridge', 0x0001, 'Matterbridge Cover');
    this.cover.createDefaultWindowCoveringClusterServer(10000);

    this.cover.addDeviceType(powerSource);
    this.cover.createDefaultPowerSourceWiredClusterServer();

    await this.registerDevice(this.cover);

    this.cover.addCommandHandler('identify', async ({ request: { identifyTime } }) => {
      this.log.info(`Command identify called identifyTime:${identifyTime}`);
    });

    this.cover.addCommandHandler('stopMotion', async ({ attributes: { currentPositionLiftPercent100ths, targetPositionLiftPercent100ths, operationalStatus } }) => {
      this.cover?.setWindowCoveringTargetAsCurrentAndStopped();
      this.cover?.log.info(
        `Command stopMotion called: current ${currentPositionLiftPercent100ths?.getLocal()} target ${targetPositionLiftPercent100ths?.getLocal()} status ${operationalStatus?.getLocal().lift}`,
      );
    });

    this.cover.addCommandHandler('upOrOpen', async ({ attributes: { currentPositionLiftPercent100ths, targetPositionLiftPercent100ths, operationalStatus } }) => {
      this.cover?.setWindowCoveringCurrentTargetStatus(0, 0, WindowCovering.MovementStatus.Stopped);
      this.cover?.log.info(
        `Command upOrOpen called: current ${currentPositionLiftPercent100ths?.getLocal()} target ${targetPositionLiftPercent100ths?.getLocal()} status ${operationalStatus?.getLocal().lift}`,
      );
    });

    this.cover.addCommandHandler('downOrClose', async ({ attributes: { currentPositionLiftPercent100ths, targetPositionLiftPercent100ths, operationalStatus } }) => {
      this.cover?.setWindowCoveringCurrentTargetStatus(10000, 10000, WindowCovering.MovementStatus.Stopped);
      this.cover?.log.info(
        `Command downOrClose called: current ${currentPositionLiftPercent100ths?.getLocal()} target ${targetPositionLiftPercent100ths?.getLocal()} status ${operationalStatus?.getLocal().lift}`,
      );
    });

    this.cover.addCommandHandler(
      'goToLiftPercentage',
      async ({ request: { liftPercent100thsValue }, attributes: { currentPositionLiftPercent100ths, targetPositionLiftPercent100ths, operationalStatus } }) => {
        this.cover?.setWindowCoveringCurrentTargetStatus(liftPercent100thsValue, liftPercent100thsValue, WindowCovering.MovementStatus.Stopped);
        this.cover?.log.info(
          `Command goToLiftPercentage ${liftPercent100thsValue} called: current ${currentPositionLiftPercent100ths?.getLocal()} target ${targetPositionLiftPercent100ths?.getLocal()} status ${operationalStatus?.getLocal().lift}`,
        );
      },
    );
  }

  override async onConfigure() {
    this.log.info('onConfigure called');

    // Set cover to target = current position and status to stopped (current position is persisted in the cluster)
    this.cover?.setWindowCoveringTargetAsCurrentAndStopped();
    this.log.info('Set cover initial targetPositionLiftPercent100ths = currentPositionLiftPercent100ths and operationalStatus to Stopped.');

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
    if (this.config.unregisterOnShutdown === true) await this.unregisterAllDevices();
  }
}
