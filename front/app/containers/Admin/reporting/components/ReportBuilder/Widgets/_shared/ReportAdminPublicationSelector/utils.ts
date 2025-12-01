import { InfiniteData } from '@tanstack/react-query';
import { Multiloc } from 'typings';

import {
  IAdminPublicationData,
  IAdminPublications,
} from 'api/admin_publications/types';

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
  hasNextPage: boolean | undefined,
  localize: (multiloc: Multiloc) => string
): (IAdminPublicationData | LoadMore)[] => {
  if (!infiniteData) return [];

  const adminPublicationIdsSet = new Set(adminPublicationIds);

  const adminPublicationsFlat = infiniteData.pages
    .flatMap((page) => page.data)
    .filter(
      (adminPublication) => !adminPublicationIdsSet.has(adminPublication.id)
    )
    .sort((a, b) => {
      const aIsFolder = a.relationships.publication.data.type === 'folder';
      const bIsFolder = b.relationships.publication.data.type === 'folder';

      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;

      const aTitle = localize(a.attributes.publication_title_multiloc);
      const bTitle = localize(b.attributes.publication_title_multiloc);
      return aTitle.localeCompare(bTitle);
    });

  return hasNextPage
    ? [...adminPublicationsFlat, { value: 'loadMore' }]
    : adminPublicationsFlat;
};

export interface TreeNode extends IAdminPublicationData {
  children: TreeNode[];
}

export const buildTree = (
  adminPublications: IAdminPublicationData[]
): TreeNode[] => {
  const nodeById = new Map<string, TreeNode>();
  const rootNodes: TreeNode[] = [];

  // We must create all nodes first before we can reference them as parents
  adminPublications.forEach((publication) => {
    nodeById.set(publication.id, { ...publication, children: [] });
  });

  // Now that all nodes exist, we can safely look up any parent
  adminPublications.forEach((publication) => {
    const currentNode = nodeById.get(publication.id)!;
    const parentId =
      publication.attributes.parent_id ||
      publication.relationships.parent.data?.id;

    if (parentId && nodeById.has(parentId)) {
      const parentNode = nodeById.get(parentId)!;
      parentNode.children.push(currentNode);
    } else {
      rootNodes.push(currentNode);
    }
  });

  return rootNodes;
};

export const getAllDescendantIds = (
  folderId: string,
  adminPublications: IAdminPublicationData[]
): string[] => {
  const folder = adminPublications.find((pub) => pub.id === folderId);
  if (!folder) return [];

  const descendantIds: string[] = [];
  const directChildrenIds = folder.relationships.children.data.map(
    (child) => child.id
  );

  directChildrenIds.forEach((childId) => {
    // Add the direct child
    descendantIds.push(childId);

    // If this child is also a folder, recursively get its descendants
    const child = adminPublications.find((pub) => pub.id === childId);
    if (child?.relationships.publication.data.type === 'folder') {
      const grandchildrenIds = getAllDescendantIds(childId, adminPublications);
      descendantIds.push(...grandchildrenIds);
    }
  });

  return descendantIds;
};
