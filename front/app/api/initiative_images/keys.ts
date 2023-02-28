const initiativeImagesKeys = {
  all: () => [{ type: 'initiative_images' }] as const,
  items: (initiativeId: string) =>
    [
      { ...initiativeImagesKeys.all()[0], operation: 'items', initiativeId },
    ] as const,
  item: (initiativeId: string, imageId: string) =>
    [
      {
        ...initiativeImagesKeys.all()[0],
        operation: 'item',
        initiativeId,
        imageId,
      },
    ] as const,
};

export default initiativeImagesKeys;
