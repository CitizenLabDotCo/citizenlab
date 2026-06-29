import { useMemo } from 'react';

import { Multiloc } from 'typings';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { ICustomPageData, TCustomPageCode } from 'api/custom_pages/types';
import useCustomPages from 'api/custom_pages/useCustomPages';
import { INavbarItem } from 'api/navbar/types';
import useNavbarItems from 'api/navbar/useNavbarItems';

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
const isNotFixedPage = (page: ICustomPageData) =>
  !FIXED_PAGES_SET.has(page.attributes.code);

// Project/folder ids already used by the navbar, including dropdown children.
const getUsedPublicationIds = (navbarItems: INavbarItem[]): Set<string> => {
  const ids = new Set<string>();
  navbarItems.forEach((navbarItem) => {
    const projectId = navbarItem.relationships.project.data?.id;
    const folderId = navbarItem.relationships.project_folder.data?.id;
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

const toAvailableItem = (item: IItemNotInNavbar): AvailableItem => ({
  titleMultiloc: item.titleMultiloc,
  slug: item.slug,
  item,
});

// Builds the list of addable items for the given type, excluding anything
// already in the navbar (top-level or nested) and any extra excluded ids.
const buildAvailableItems = ({
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
      .filter(
        (item): item is Extract<IItemNotInNavbar, { type: 'page' }> =>
          item.type === 'page' && !excludeStaticPageIds?.has(item.pageId)
      )
      .map(toAvailableItem);
  }

  if (type === 'default_page') {
    return itemsNotInNavbar
      .filter((item) => item.type === 'default_item')
      .map(toAvailableItem);
  }

  // type is now narrowed to 'project' | 'folder'.
  return adminPublications.flatMap((publication) => {
    const { id: itemId, type: publicationType } =
      publication.relationships.publication.data;
    if (
      publicationType !== type ||
      usedPublicationIds.has(itemId) ||
      excludePublicationIds?.has(itemId)
    ) {
      return [];
    }
    const titleMultiloc = publication.attributes.publication_title_multiloc;
    const slug = publication.attributes.publication_slug;
    return [
      { titleMultiloc, slug, item: { type, itemId, titleMultiloc, slug } },
    ];
  });
};

interface UseAvailableItemsParams {
  type: MenuItemType;
  // When editing a dropdown, ignore its own children so that removing one
  // locally makes it addable again.
  editItem?: INavbarItem;
  // Extra targets to hide (e.g. items already added to a dropdown locally).
  excludeStaticPageIds?: Set<string>;
  excludePublicationIds?: Set<string>;
}

// Fetches the data backing the item picker and builds the addable-items list for
// the given type. Shared by the single-item and dropdown forms.
const useAvailableItems = ({
  type,
  editItem,
  excludeStaticPageIds,
  excludePublicationIds,
}: UseAvailableItemsParams): AvailableItem[] => {
  const { data: navbarItems } = useNavbarItems();
  const { data: removedDefaultItems } = useNavbarItems({
    onlyRemovedDefaultItems: true,
  });
  const { data: pages } = useCustomPages();
  const { data: adminPublications } = useAdminPublications({
    remove_all_unlisted: true,
    sort: 'title_multiloc',
  });

  return useMemo(() => {
    if (!navbarItems || !removedDefaultItems || !pages) return [];

    const navbarItemsForExclusion = navbarItems.data.map((item) =>
      item.id === editItem?.id
        ? { ...item, attributes: { ...item.attributes, children: [] } }
        : item
    );

    return buildAvailableItems({
      type,
      navbarItems: navbarItemsForExclusion,
      removedDefaultItems: removedDefaultItems.data,
      pages: pages.data,
      adminPublications:
        adminPublications?.pages.flatMap((page) => page.data) ?? [],
      usedPublicationIds: getUsedPublicationIds(navbarItemsForExclusion),
      excludeStaticPageIds,
      excludePublicationIds,
    });
  }, [
    type,
    editItem,
    navbarItems,
    removedDefaultItems,
    pages,
    adminPublications,
    excludeStaticPageIds,
    excludePublicationIds,
  ]);
};

export default useAvailableItems;
