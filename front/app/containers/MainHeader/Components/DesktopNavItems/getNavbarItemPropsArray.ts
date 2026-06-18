import { INavbarItem } from 'api/navbar/types';
import { getNavbarItemSlug } from 'api/navbar/util';

export default function getNavbarItemPropsArray(navbarItems: INavbarItem[]) {
  return navbarItems.map((navbarItem) => {
    // Dropdown ('menu') items aren't links themselves; they render as a
    // dropdown grouping their children, so they carry the navbar item instead
    // of a linkTo.
    const isMenu = navbarItem.attributes.code === 'menu';
    const linkTo = isMenu ? null : getNavbarItemSlug(navbarItem);

    const navigationItemTitle = navbarItem.attributes.title_multiloc;

    const onlyActiveOnIndex = linkTo === '/';

    return {
      linkTo,
      onlyActiveOnIndex,
      navigationItemTitle,
      navbarItem: isMenu ? navbarItem : undefined,
    };
  });
}
