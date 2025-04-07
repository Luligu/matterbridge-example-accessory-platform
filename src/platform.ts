import { Matterbridge, MatterbridgeAccessoryPlatform, PlatformConfig, powerSource, MatterbridgeEndpoint, coverDevice } from 'matterbridge';
import { isValidNumber } from 'matterbridge/utils';
import { AnsiLogger } from 'matterbridge/logger';
import { WindowCovering } from 'matterbridge/matter/clusters';

export class ExampleMatterbridgeAccessoryPlatform extends MatterbridgeAccessoryPlatform {
  cover?: MatterbridgeEndpoint;
  coverInterval?: NodeJS.Timeout;

  constructor(matterbridge: Matterbridge, log: AnsiLogger, config: PlatformConfig) {
    super(matterbridge, log, config);

    // Verify that Matterbridge is the correct version
    if (this.verifyMatterbridgeVersion === undefined || typeof this.verifyMatterbridgeVersion !== 'function' || !this.verifyMatterbridgeVersion('2.2.7')) {
      throw new Error(
        `This plugin requires Matterbridge version >= "2.2.7". Please update Matterbridge from ${this.matterbridge.matterbridgeVersion} to the latest version in the frontend.`,
      );
    }

    this.log.info('Initializing platform:', this.config.name);
  }

  override async onStart(reason?: string) {
    this.log.info('onStart called with reason:', reason ?? 'none');

    this.cover = new MatterbridgeEndpoint([coverDevice, powerSource], { uniqueStorageKey: 'Cover example device' }, this.config.debug as boolean);
    this.cover.log.logName = 'Cover example device';
    this.cover.createDefaultIdentifyClusterServer();
    this.cover.createDefaultBasicInformationClusterServer(
      'Cover example device',
      `0x59108853594`,
      0xfff1,
      'Matterbridge',
      0x0001,
      'Matterbridge Cover',
      parseInt(this.version.replace(/\D/g, '')),
      this.version,
      parseInt(this.matterbridge.matterbridgeVersion.replace(/\D/g, '')),
      this.matterbridge.matterbridgeVersion,
    );
    this.cover.createDefaultWindowCoveringClusterServer(10000);

    this.cover.createDefaultPowerSourceWiredClusterServer();

    await this.registerDevice(this.cover);

    this.cover.addCommandHandler('identify', async ({ request: { identifyTime } }) => {
      this.cover?.log.info(`Command identify called identifyTime: ${identifyTime}`);
    });

    this.cover.addCommandHandler('stopMotion', async () => {
      this.cover?.log.info(`Command stopMotion called`);
      await this.cover?.setWindowCoveringTargetAsCurrentAndStopped();
    });

    this.cover.addCommandHandler('upOrOpen', async () => {
      this.cover?.log.info(`Command upOrOpen called`);
      await this.cover?.setWindowCoveringCurrentTargetStatus(0, 0, WindowCovering.MovementStatus.Stopped);
    });

    this.cover.addCommandHandler('downOrClose', async () => {
      this.cover?.log.info(`Command downOrClose called`);
      await this.cover?.setWindowCoveringCurrentTargetStatus(10000, 10000, WindowCovering.MovementStatus.Stopped);
    });

    this.cover.addCommandHandler('goToLiftPercentage', async ({ request: { liftPercent100thsValue } }) => {
      this.cover?.log.info(`Command goToLiftPercentage called request ${liftPercent100thsValue}`);
      await this.cover?.setWindowCoveringCurrentTargetStatus(liftPercent100thsValue, liftPercent100thsValue, WindowCovering.MovementStatus.Stopped);
    });
  }

  override async onConfigure() {
    await super.onConfigure();
    this.log.info('onConfigure called');

    await this.cover?.setWindowCoveringTargetAsCurrentAndStopped();
    this.log.info('Set cover initial targetPositionLiftPercent100ths = currentPositionLiftPercent100ths and operationalStatus to Stopped.');

    // Matter: 0 Fully open 10000 fully closed
    this.coverInterval = setInterval(async () => {
      if (!this.cover) return;
      let position = this.cover.getAttribute(WindowCovering.Cluster.id, 'currentPositionLiftPercent100ths', this.log);
      if (!isValidNumber(position, 0, 10000)) return;
      position = position + 1000;
      position = position > 10000 ? 0 : position;
      await this.cover.setWindowCoveringCurrentTargetStatus(position, position, WindowCovering.MovementStatus.Stopped);
      this.log.info(`Set liftPercent100thsValue to ${position}`);
    }, 60 * 1000);
  }

  override async onShutdown(reason?: string) {
    clearInterval(this.coverInterval);
    this.coverInterval = undefined;
    await super.onShutdown(reason);
    this.log.info('onShutdown called with reason:', reason ?? 'none');
    if (this.config.unregisterOnShutdown === true) await this.unregisterAllDevices();
  }
}
