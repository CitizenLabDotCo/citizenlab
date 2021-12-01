import { INavbarItem, DEFAULT_PAGE_SLUGS } from 'services/navbar';
import { IPageData } from 'services/pages';

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

  console.log(navbarItems);

  return navbarItems.map((navbarItem) => {
    const linkTo: string = navbarItem.relationships.static_page.data
      ? getPageSlug(pagesById, navbarItem.relationships.static_page.data.id)
      : DEFAULT_PAGE_SLUGS[navbarItem.attributes.code];

    const navigationItemTitle = navbarItem.attributes.title_multiloc;

    const onlyActiveOnIndex = linkTo === '/';

    return { linkTo, onlyActiveOnIndex, navigationItemTitle };
  });
}
