import { TDefaultNavbarItemCode, INavbarItem, INavbarChild } from './types';

export const DEFAULT_PAGE_SLUGS: Record<TDefaultNavbarItemCode, string> = {
  home: '/',
  projects: '/projects',
  all_input: '/ideas',
  events: '/events',
};

// utility function to get slug associated with navbar item
export function getNavbarItemSlug({
  attributes: { code, slug },
  relationships,
}: INavbarItem): string | null {
  if (code === 'menu') return null;

  const hasCorrespondingPage = !!relationships.static_page.data?.id;
  const hasCorrespondingProject = !!relationships.project.data?.id;
  const hasCorrespondingFolder = !!relationships.project_folder.data?.id;

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

export function getNavbarChildLink(
  child: INavbarChild
): { to: string; params: { slug: string } } | null {
  if (!child.slug) return null;
  if (child.static_page_id) {
    return { to: '/pages/$slug', params: { slug: child.slug } };
  }
  if (child.project_id) {
    return { to: '/projects/$slug', params: { slug: child.slug } };
  }
  if (child.project_folder_id) {
    return { to: '/folders/$slug', params: { slug: child.slug } };
  }
  return null;
}

export const MAX_TITLE_LENGTH = 25;
export const MAX_NAVBAR_ITEMS = 7;
