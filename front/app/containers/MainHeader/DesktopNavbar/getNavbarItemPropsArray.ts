import { TPageSlugById } from 'hooks/useCustomPageSlugById';
import { INavbarItem, getNavbarItemSlug } from 'services/navbar';

export default function getNavbarItemPropsArray(
  navbarItems: INavbarItem[],
  pageSlugById: TPageSlugById
) {
  return navbarItems.map((navbarItem) => {
    const linkTo =
      getNavbarItemSlug(
        navbarItem.attributes.code,
        pageSlugById,
        navbarItem.relationships.static_page.data?.id
      ) || '/';

    const navigationItemTitle = navbarItem.attributes.title_multiloc;

    const onlyActiveOnIndex = linkTo === '/';

    return { linkTo, onlyActiveOnIndex, navigationItemTitle };
  });
}
