import type React from 'react';

export interface NovaRinPlugin {
  id: string;
  name: string;
  description: string;
  version: string;

  /**
   * Called before a message is submitted to the AI model.
   * Can transform or augment the user prompt (e.g., inject timestamps, context, or word count limit).
   */
  onBeforeMessageSend?: (message: string) => Promise<string> | string;

  /**
   * Called after full assistant response stream is completed.
   */
  onMessageReceived?: (response: string) => void;

  /**
   * Renders a custom action / badge component in the main header UI if enabled.
   */
  renderHeaderAction?: () => React.ReactNode;
}
