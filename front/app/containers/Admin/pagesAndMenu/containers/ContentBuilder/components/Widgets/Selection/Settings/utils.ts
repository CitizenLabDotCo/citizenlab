import { InfiniteData } from '@tanstack/react-query';

import {
  IAdminPublicationData,
  IAdminPublications,
} from 'api/admin_publications/types';

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

// TODO remove when BE fixed
export const stabilizeOrdering = (
  adminPublications: IAdminPublicationData[],
  adminPublicationIds: string[]
) => {
  if (adminPublications.length === 0) return [];
  if (adminPublicationIds.length === 0) return [];

  const adminPublicationsById = adminPublications.reduce(
    (acc, adminPublication) => {
      return {
        ...acc,
        [adminPublication.id]: adminPublication,
      };
    },
    {} as Record<string, IAdminPublicationData>
  );

  return adminPublicationIds
    .map((id) => adminPublicationsById[id])
    .filter(Boolean);
};

export type LoadMore = { value: 'loadMore' };
export const isAdminPublication = (
  option: IAdminPublicationData | LoadMore
): option is IAdminPublicationData => {
  return 'id' in option;
};

export const getOptionId = (option: IAdminPublicationData | LoadMore) =>
  isAdminPublication(option) ? option.id : 'loadMore';

export const getOptions = (
  infiniteData: InfiniteData<IAdminPublications> | undefined,
  adminPublicationIds: string[],
  hasNextPage: boolean | undefined
): (IAdminPublicationData | LoadMore)[] => {
  if (!infiniteData) return [];
  const adminPublicationIdsSet = new Set(adminPublicationIds);

  const adminPublicationsFlat = infiniteData.pages
    .flatMap((page) => page.data)
    // Remove already selected admin publications
    .filter(
      (adminPublication) => !adminPublicationIdsSet.has(adminPublication.id)
    );

  return hasNextPage
    ? [...adminPublicationsFlat, { value: 'loadMore' }]
    : adminPublicationsFlat;
};
