const initiativeMarkersKeys = {
  all: () => [{ type: 'post_marker', variant: 'initiative' }] as const,
  lists: () =>
    [{ ...initiativeMarkersKeys.all()[0], operation: 'list' }] as const,
};

export default initiativeMarkersKeys;
