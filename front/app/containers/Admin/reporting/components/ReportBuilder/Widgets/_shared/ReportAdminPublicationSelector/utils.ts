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
  adminPublicationIds: string[] | undefined,
  hasNextPage: boolean | undefined,
  localize: (multiloc: Multiloc) => string
): (IAdminPublicationData | LoadMore)[] => {
  if (!infiniteData) return [];
  if (!adminPublicationIds) return [];

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
  const idToNodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  adminPublications.forEach((pub) => {
    idToNodeMap.set(pub.id, { ...pub, children: [] });
  });

  adminPublications.forEach((pub) => {
    const node = idToNodeMap.get(pub.id)!;
    const parentId =
      pub.attributes.parent_id || pub.relationships.parent.data?.id;

    if (parentId && idToNodeMap.has(parentId)) {
      idToNodeMap.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

export const getAllDescendantIds = (
  folderId: string,
  adminPublications: IAdminPublicationData[]
): string[] => {
  const folder = adminPublications.find((pub) => pub.id === folderId);
  if (!folder) return [];

  return folder.relationships.children.data.map((child) => child.id);
};
