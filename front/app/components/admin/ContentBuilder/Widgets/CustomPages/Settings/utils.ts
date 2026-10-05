import { ICustomPageData } from 'api/custom_pages/types';

export const getNewIdsOnDrop = (
  ids: string[],
  draggedItemId: string,
  targetIndex: number
) => {
  const idsWithoutDraggedItem = ids.filter((id) => id !== draggedItemId);

  return [
    ...idsWithoutDraggedItem.slice(0, targetIndex),
    draggedItemId,
    ...idsWithoutDraggedItem.slice(targetIndex),
  ];
};

export const getOptionId = (option: ICustomPageData) => option.id;

export const getOptions = (
  customPages: ICustomPageData[] | undefined,
  selectedIds: string[]
): ICustomPageData[] => {
  if (!customPages) return [];

  const selectedIdsSet = new Set(selectedIds);

  return customPages
    .filter((page) => page.attributes.code === 'custom')
    .filter((page) => !selectedIdsSet.has(page.id));
};

export const getSelectedPages = (
  customPages: ICustomPageData[] | undefined,
  selectedIds: string[]
): ICustomPageData[] => {
  if (!customPages) return [];

  const pagesById = new Map(customPages.map((page) => [page.id, page]));

  return selectedIds
    .map((id) => pagesById.get(id))
    .filter((page): page is ICustomPageData => page !== undefined);
};
