import { TNavbarItemCode, DEFAULT_PAGE_SLUGS } from 'services/navbar';
import { IPageData } from 'services/pages';

export const getDefaultPageSlug = (navbarItemCode: TNavbarItemCode) => {
  return DEFAULT_PAGE_SLUGS[navbarItemCode];
};

export const getCustomPageSlug = (pages: IPageData[], pageId: string) => {
  const slug = pages.find((page) => pageId === page.id)?.attributes.slug;

  return `/pages/${slug}`;
};
