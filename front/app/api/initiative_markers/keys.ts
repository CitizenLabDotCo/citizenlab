const initiativeMarkersKeys = {
  all: () => [{ type: 'post_marker', postType: 'initiative' }] as const,
  lists: () =>
    [{ ...initiativeMarkersKeys.all()[0], operation: 'list' }] as const,
};

export default initiativeMarkersKeys;
