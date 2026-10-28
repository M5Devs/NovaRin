import type { NovaRinPlugin } from './types';

class PluginManager {
  private plugins: Map<string, NovaRinPlugin> = new Map();

  register(plugin: NovaRinPlugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  unregister(pluginId: string): void {
    this.plugins.delete(pluginId);
  }

  getPlugin(pluginId: string): NovaRinPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAllPlugins(): NovaRinPlugin[] {
    return Array.from(this.plugins.values());
  }

  async processBeforeSend(message: string, activePluginIds: string[]): Promise<string> {
    let processedMessage = message;
    for (const id of activePluginIds) {
      const plugin = this.plugins.get(id);
      if (plugin?.onBeforeMessageSend) {
        try {
          processedMessage = await plugin.onBeforeMessageSend(processedMessage);
        } catch (err) {
          console.error(`Error executing onBeforeMessageSend in plugin ${id}:`, err);
        }
      }
    }
    return processedMessage;
  }

  processMessageReceived(response: string, activePluginIds: string[]): void {
    for (const id of activePluginIds) {
      const plugin = this.plugins.get(id);
      if (plugin?.onMessageReceived) {
        try {
          plugin.onMessageReceived(response);
        } catch (err) {
          console.error(`Error executing onMessageReceived in plugin ${id}:`, err);
        }
      }
    }
  }
}

export const pluginManager = new PluginManager();
