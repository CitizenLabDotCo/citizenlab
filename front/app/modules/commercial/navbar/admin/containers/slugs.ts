import { TNavbarItemCode } from 'services/navbar';
import { IPageData } from 'services/pages';

export const DEFAULT_PAGE_SLUGS: Partial<Record<TNavbarItemCode, string>> = {
  home: '',
  projects: '/projects',
  all_input: '/ideas',
  proposals: '/initiatives',
  events: '/events',
};

export const getDefaultPageSlug = (navbarItemCode: TNavbarItemCode) => {
  return DEFAULT_PAGE_SLUGS[navbarItemCode];
};

export const getCustomPageSlug = (pages: IPageData[], pageId: string) => {
  const slug = pages.find((page) => pageId === page.id)?.attributes.slug;

  return `/pages/${slug}`;
};
