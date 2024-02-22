import { Matterbridge } from '../../matterbridge/dist/MatterBridge.js'; 
import { AnsiLogger, REVERSE, REVERSEOFF } from 'node-ansi-logger';

/**
 * This is the standard interface for MatterBridge plugins.
 * Each plugin should export a default function that follows this signature.
 * 
 * @param bridge - An instance of MatterBridge
 */
export default function initializePlugin(bridge: Matterbridge, log: AnsiLogger) {
  // Log it's loading
  log.info('My Plugin is loading...');

  bridge.on('start', (reason: string) => {
    log.info(`Received ${REVERSE}start${REVERSEOFF} reason: ${reason}`);
    // Plugin initialization logic here
  });

  bridge.on('shutdown', (reason: string) => {
    log.info(`Received ${REVERSE}shutdown${REVERSEOFF} reason: ${reason}`);
    // Plugin cleanup or other logic
  });

  // Log or perform other setup tasks
  log.info('My Plugin initialized successfully!');
}