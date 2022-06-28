import clHistory from 'utils/cl-router/history';
import { NAVIGATION_PATH } from 'containers/Admin/flexible-pages';
import { getNavbarItemSlug, INavbarItem } from 'services/navbar';
import { TPageSlugById } from 'hooks/usePageSlugById';

export const handleClickEdit = (navbarItem: INavbarItem) => () => {
  const pageData = navbarItem.relationships.static_page.data;

  pageData
    ? clHistory.push(`${NAVIGATION_PATH}/pages/edit/${pageData.id}`)
    : clHistory.push(`${NAVIGATION_PATH}/navbar-items/edit/${navbarItem.id}`);
};

export const getViewButtonLink = (
  navbarItem: INavbarItem,
  pageSlugById: TPageSlugById
) => {
  return (
    getNavbarItemSlug(
      navbarItem.attributes.code,
      pageSlugById,
      navbarItem.relationships.static_page.data?.id
    ) || '/'
  );
};
