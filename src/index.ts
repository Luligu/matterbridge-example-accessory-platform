import { MatterBridge } from '../matterbridge/src/MatterBridge.ts'; 

/**
 * This is the standard interface for MatterBridge plugins.
 * Each plugin should export a default function that follows this signature.
 * 
 * @param bridge - An instance of MatterBridge
 */
export default function initializePlugin(bridge: MatterBridge) {

  // Plugin initialization logic here
  bridge.on('shutdown', (reason: string) => {
    console.log(`Shutdown reason: ${reason}`);
    // Plugin cleanup or other logic
  });

  // Log or perform other setup tasks
  bridge.log.info('My Plugin initialized successfully');
}