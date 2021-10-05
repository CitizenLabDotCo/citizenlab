import { INavbarItem } from 'services/navbar';

const UNHIDEABLE_PAGES = new Set(['home', 'projects']);

export function getDisplaySettingsVisibleItem(navbarItem: INavbarItem) {
  return {
    isDefaultPage: true,
    hadHideButton: !UNHIDEABLE_PAGES.has(navbarItem.attributes.type),
  };
}

export function getDisplaySettingsOtherItem(navbarItem: INavbarItem) {
  return {
    hasAddButton: !!navbarItem,
  };
}
