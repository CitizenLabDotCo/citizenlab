const initiativeAllowedTransitionsKeys = {
  all: () => [{ type: 'allowed_transitions', variant: 'initiative' }],
  items: () => [
    { ...initiativeAllowedTransitionsKeys.all()[0], operation: 'item' },
  ],
  item: (id: string) => [
    { ...initiativeAllowedTransitionsKeys.items()[0], id },
  ],
} as const;

export default initiativeAllowedTransitionsKeys;
