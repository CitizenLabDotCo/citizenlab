import { TPageSlugById } from 'api/custom_pages/useCustomPageSlugById';
import { INavbarItem } from 'api/navbar/types';
import { getNavbarItemSlug } from 'api/navbar/util';
import { TProjectSlugById } from 'api/projects/useProjectSlugById';

export default function getNavbarItemPropsArray(
  navbarItems: INavbarItem[],
  pageSlugById: TPageSlugById,
  projectSlugById?: TProjectSlugById
) {
  return navbarItems.map((navbarItem) => {
    const linkTo =
      getNavbarItemSlug(
        navbarItem.attributes.code,
        pageSlugById,
        navbarItem.relationships.static_page.data?.id,
        projectSlugById,
        navbarItem.relationships.project.data?.id
      ) || '/';

    const navigationItemTitle = navbarItem.attributes.title_multiloc;

    const onlyActiveOnIndex = linkTo === '/';

    return { linkTo, onlyActiveOnIndex, navigationItemTitle };
  });
}
