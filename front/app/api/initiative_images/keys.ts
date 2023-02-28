const initiativeImagesKeys = {
  all: () => [{ type: 'initiative_images' }] as const,
  lists: () =>
    [{ ...initiativeImagesKeys.all()[0], operation: 'list' }] as const,
  list: (initiativeId: string) =>
    [
      { ...initiativeImagesKeys.all()[0], operation: 'list', initiativeId },
    ] as const,
  items: () =>
    [{ ...initiativeImagesKeys.all()[0], operation: 'item' }] as const,
  item: (initiativeId: string, id: string) =>
    [
      {
        ...initiativeImagesKeys.items()[0],
        initiativeId,
        id,
      },
    ] as const,
};

export default initiativeImagesKeys;
