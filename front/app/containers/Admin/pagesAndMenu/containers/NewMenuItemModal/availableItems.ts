import { Multiloc } from 'typings';

import { IAdminPublicationData } from 'api/admin_publications/types';
import { ICustomPageData, TCustomPageCode } from 'api/custom_pages/types';
import { INavbarItem } from 'api/navbar/types';

import getItemsNotInNavbar, { IItemNotInNavbar } from 'utils/navbar';

export type MenuItemType =
  | 'custom_page'
  | 'default_page'
  | 'folder'
  | 'project';

// Types selectable as children of a dropdown ('menu') item.
export const DROPDOWN_CHILD_TYPES: MenuItemType[] = [
  'custom_page',
  'folder',
  'project',
];

// An option selectable in the item dropdown, paired with the IItemNotInNavbar
// payload used to create the navbar item.
export interface AvailableItem {
  titleMultiloc: Multiloc;
  slug: string | null;
  item: IItemNotInNavbar;
}

// Policy pages (terms, privacy, cookie) are managed in Settings, not here.
const FIXED_PAGES_SET = new Set<TCustomPageCode>([
  'terms-and-conditions',
  'privacy-policy',
  'cookie-policy',
]);
export const isNotFixedPage = (page: ICustomPageData) =>
  !FIXED_PAGES_SET.has(page.attributes.code);

// Project/folder ids already used by the navbar, including dropdown children.
export const getUsedPublicationIds = (
  navbarItems: INavbarItem[]
): Set<string> => {
  const ids = new Set<string>();
  navbarItems.forEach((navbarItem) => {
    const projectId = navbarItem.relationships.project.data?.id;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const folderId = navbarItem.relationships.project_folder?.data?.id;
    if (projectId) ids.add(projectId);
    if (folderId) ids.add(folderId);
    navbarItem.attributes.children?.forEach((child) => {
      if (child.project_id) ids.add(child.project_id);
      if (child.project_folder_id) ids.add(child.project_folder_id);
    });
  });
  return ids;
};

interface BuildParams {
  type: MenuItemType;
  navbarItems: INavbarItem[];
  removedDefaultItems: INavbarItem[];
  pages: ICustomPageData[];
  adminPublications: IAdminPublicationData[];
  usedPublicationIds: Set<string>;
  // Additional targets to hide (e.g. items already added to a dropdown locally).
  excludeStaticPageIds?: Set<string>;
  excludePublicationIds?: Set<string>;
}

// Builds the list of addable items for the given type, excluding anything
// already in the navbar (top-level or nested) and any extra excluded ids.
export const buildAvailableItems = ({
  type,
  navbarItems,
  removedDefaultItems,
  pages,
  adminPublications,
  usedPublicationIds,
  excludeStaticPageIds,
  excludePublicationIds,
}: BuildParams): AvailableItem[] => {
  const itemsNotInNavbar = getItemsNotInNavbar(
    navbarItems,
    removedDefaultItems,
    pages.filter(isNotFixedPage)
  );

  if (type === 'custom_page') {
    return itemsNotInNavbar
      .filter((item) => item.type === 'page')
      .filter(
        (item) => !('pageId' in item) || !excludeStaticPageIds?.has(item.pageId)
      )
      .map((item) => ({
        titleMultiloc: item.titleMultiloc,
        slug: item.slug,
        item,
      }));
  }

  if (type === 'default_page') {
    return itemsNotInNavbar
      .filter((item) => item.type === 'default_item')
      .map((item) => ({
        titleMultiloc: item.titleMultiloc,
        slug: item.slug,
        item,
      }));
  }

  const publicationType = type === 'project' ? 'project' : 'folder';
  return adminPublications
    .filter((publication) => {
      const publicationId = publication.relationships.publication.data.id;
      return (
        publication.relationships.publication.data.type === publicationType &&
        !usedPublicationIds.has(publicationId) &&
        !excludePublicationIds?.has(publicationId)
      );
    })
    .map((publication) => {
      const publicationId = publication.relationships.publication.data.id;
      const titleMultiloc = publication.attributes.publication_title_multiloc;
      return {
        titleMultiloc,
        slug: publication.attributes.publication_slug,
        item: {
          type: publicationType,
          itemId: publicationId,
          titleMultiloc,
          slug: publication.attributes.publication_slug,
        } as IItemNotInNavbar,
      };
    });
};
