import { INavbarItem } from 'api/navbar/types';
import { getNavbarItemSlug, isNavbarDropdown } from 'api/navbar/util';

export default function getNavbarItemPropsArray(navbarItems: INavbarItem[]) {
  return navbarItems.map((navbarItem) => {
    // Dropdown items aren't links themselves; they render as a dropdown
    // grouping their children, so they carry the navbar item instead of a
    // linkTo.
    const isDropdown = isNavbarDropdown(navbarItem);
    const linkTo = isDropdown ? null : getNavbarItemSlug(navbarItem);

    const navigationItemTitle = navbarItem.attributes.title_multiloc;

    const onlyActiveOnIndex = linkTo === '/';

    return {
      linkTo,
      onlyActiveOnIndex,
      navigationItemTitle,
      navbarItem: isDropdown ? navbarItem : undefined,
    };
  });
}
