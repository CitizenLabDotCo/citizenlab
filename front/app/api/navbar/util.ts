import { RouteType } from 'routes';

import { TDefaultNavbarItemCode, INavbarItem } from './types';

export const DEFAULT_PAGE_SLUGS: Record<TDefaultNavbarItemCode, RouteType> = {
  home: '/',
  projects: '/projects',
  all_input: '/ideas',
  events: '/events',
};

// utility function to get slug associated with navbar item
export function getNavbarItemSlug({
  attributes: { code, slug },
  relationships,
}: INavbarItem): RouteType | null {
  const hasCorrespondingPage = !!relationships.static_page.data?.id;
  const hasCorrespondingProject = !!relationships.project.data?.id;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const hasCorrespondingFolder = !!relationships.project_folder?.data?.id;

  // Default navbar item
  if (code !== 'custom' && !hasCorrespondingPage) {
    return DEFAULT_PAGE_SLUGS[code];
  }

  // Page navbar item
  if (code === 'custom' && hasCorrespondingPage && slug) {
    return `/pages/${slug}`;
  }

  // Project navbar item
  if (code === 'custom' && hasCorrespondingProject && slug) {
    return `/projects/${slug}`;
  }

  // Folder navbar item
  if (code === 'custom' && hasCorrespondingFolder && slug) {
    return `/folders/${slug}`;
  }

  // This is impossible, but I can't seem to make typescript understand
  // that. So just returning null here
  return null;
}

export const MAX_TITLE_LENGTH = 25;
export const MAX_NAVBAR_ITEMS = 7;
