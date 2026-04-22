export const indexById = <T extends { id: string }>(
  items: T[]
): Record<string, T> => {
  return items.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, T>);
};
