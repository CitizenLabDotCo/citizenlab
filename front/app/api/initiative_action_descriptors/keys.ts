const initiativeActionDescriptorsKeys = {
  all: () => [{ type: 'initiatives', variant: 'action_descriptor' }],
  items: () => [
    { ...initiativeActionDescriptorsKeys.all()[0], operation: 'item' },
  ],
};

export default initiativeActionDescriptorsKeys;
