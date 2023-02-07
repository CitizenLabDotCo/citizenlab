const networkKeys = {
  network: (viewId: string) => [{ type: 'network', entity: 'detail', viewId }],
  tasks: (viewId: string) => [
    { type: 'text_network_analysis_task', entity: 'list', viewId },
  ],
} as const;

export default networkKeys;
