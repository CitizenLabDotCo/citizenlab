import { INavbarItem, TDefaultNavbarItemCode } from 'services/navbar';
import { IPageData } from 'services/pages';

const CODE_TO_LINK_MAP: Record<TDefaultNavbarItemCode, string> = {
  home: '/',
  projects: '/projects',
  all_input: '/ideas',
  proposals: '/initiatives',
  events: '/events',
};

const getPageSlug = (pagesById: Record<string, IPageData>, pageId: string) => {
  const page = pagesById[pageId];
  return `/pages/${page.attributes.slug}`;
};

export default function getNavbarItemPropsArray(
  navbarItems: INavbarItem[],
  pages: IPageData[]
) {
  const pagesById = pages.reduce((acc, curr) => {
    acc[curr.id] = curr;
    return acc;
  }, {});

  return navbarItems.map((navbarItem) => {
    const linkTo: string = navbarItem.relationships.page
      ? getPageSlug(pagesById, navbarItem.relationships.page.data.id)
      : CODE_TO_LINK_MAP[navbarItem.attributes.code];

    const navigationItemTitle = navbarItem.attributes.title_multiloc;

    const onlyActiveOnIndex = linkTo === '/';

    return { linkTo, onlyActiveOnIndex, navigationItemTitle };
  });
}
