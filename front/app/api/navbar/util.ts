import { RouteType } from 'routes';

import { TPageSlugById } from 'api/custom_pages/useCustomPageSlugById';
import { TProjectSlugById } from 'api/projects/useProjectSlugById';

import { TDefaultNavbarItemCode, TNavbarItemCode } from './types';

export const DEFAULT_PAGE_SLUGS: Record<TDefaultNavbarItemCode, RouteType> = {
  home: '/',
  projects: '/projects',
  all_input: '/ideas',
  proposals: '/initiatives',
  events: '/events',
};

// utility function to get slug associated with navbar item
export function getNavbarItemSlug(
  navbarItemCode: TNavbarItemCode,
  pageBySlugId?: TPageSlugById,
  pageId?: string,
  projectBySlugId?: TProjectSlugById,
  projectId?: string
): RouteType | null {
  // Default navbar item
  if (navbarItemCode !== 'custom' && !pageId) {
    return DEFAULT_PAGE_SLUGS[navbarItemCode];
  }

  // Page navbar item
  if (navbarItemCode === 'custom' && pageBySlugId && pageId) {
    return pageBySlugId[pageId];
  }

  // Project navbar item
  if (navbarItemCode === 'custom' && projectBySlugId && projectId) {
    return projectBySlugId[projectId];
  }

  // This is impossible, but I can't seem to make typescript understand
  // that. So just returning null here
  return null;
}

export const MAX_TITLE_LENGTH = 25;
