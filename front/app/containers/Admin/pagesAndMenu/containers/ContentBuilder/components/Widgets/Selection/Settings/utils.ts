import { IAdminPublicationData } from 'api/admin_publications/types';

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
