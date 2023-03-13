const initiativeFilesKeys = {
  all: () => [{ type: 'initiative_files' }] as const,
  lists: () =>
    [{ ...initiativeFilesKeys.all()[0], operation: 'list' }] as const,
  list: (initiativeId: string) =>
    [{ ...initiativeFilesKeys.lists()[0], initiativeId }] as const,
  items: () =>
    [{ ...initiativeFilesKeys.all()[0], operation: 'item' }] as const,
  item: (initiativeId: string, fileId: string) =>
    [
      {
        ...initiativeFilesKeys.items()[0],
        initiativeId,
        fileId,
      },
    ] as const,
};

export default initiativeFilesKeys;
