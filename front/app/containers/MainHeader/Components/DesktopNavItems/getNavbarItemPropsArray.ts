import { INavbarItem } from 'api/navbar/types';
import { getNavbarItemSlug } from 'api/navbar/util';

export default function getNavbarItemPropsArray(navbarItems: INavbarItem[]) {
  return navbarItems.map((navbarItem) => {
    const linkTo = getNavbarItemSlug(navbarItem);

    const navigationItemTitle = navbarItem.attributes.title_multiloc;

    const onlyActiveOnIndex = linkTo === '/';

    return { linkTo, onlyActiveOnIndex, navigationItemTitle };
  });
}
