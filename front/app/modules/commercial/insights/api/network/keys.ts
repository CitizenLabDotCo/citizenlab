const networkKeys = {
  network: (viewId: string) => [{ type: 'network', operation: 'item', viewId }],
  tasks: (viewId: string) => [
    { type: 'text_network_analysis_task', operation: 'list', viewId },
  ],
} as const;

export default networkKeys;
