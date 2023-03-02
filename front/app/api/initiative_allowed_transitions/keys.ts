const initiativeAllowedTransitionsKeys = {
  all: () => [{ type: 'allowed_transitions', postType: 'initiative' }],
  lists: () => [
    { ...initiativeAllowedTransitionsKeys.all()[0], operation: 'list' },
  ],
  list: (id: string) => [
    { ...initiativeAllowedTransitionsKeys.lists()[0], id },
  ],
} as const;

export default initiativeAllowedTransitionsKeys;
