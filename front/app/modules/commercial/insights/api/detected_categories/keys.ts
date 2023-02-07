const detectedCategoriesKeys = {
  all: () => [{ type: 'detected_category' }],
  lists: () => [{ ...detectedCategoriesKeys.all()[0], entity: 'list' }],
  list: (viewId: string) => [
    { ...detectedCategoriesKeys.all()[0], entity: 'list', viewId },
  ],
} as const;

export default detectedCategoriesKeys;
