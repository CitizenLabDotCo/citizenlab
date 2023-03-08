const initiativeActionDescriptorsKeys = {
  all: () => [{ type: 'action_descriptors', postType: 'initiative' }],
  items: () => [
    { ...initiativeActionDescriptorsKeys.all()[0], operation: 'item' },
  ],
};

export default initiativeActionDescriptorsKeys;
