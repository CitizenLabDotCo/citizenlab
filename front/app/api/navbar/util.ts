import { TDefaultNavbarItemCode, INavbarItem, INavbarChild } from './types';

export const DEFAULT_PAGE_SLUGS: Record<TDefaultNavbarItemCode, string> = {
  home: '/',
  projects: '/projects',
  all_input: '/ideas',
  events: '/events',
};

// A dropdown is a custom navbar item that groups children instead of linking
// to a target (page, project or folder) of its own.
export function isNavbarDropdown({
  attributes: { code },
  relationships,
}: INavbarItem): boolean {
  const linksToTarget =
    !!relationships.static_page.data?.id ||
    !!relationships.project.data?.id ||
    !!relationships.project_folder.data?.id;
  return code === 'custom' && !linksToTarget;
}

// utility function to get slug associated with navbar item
export function getNavbarItemSlug({
  attributes: { code, slug },
  relationships,
}: INavbarItem): string | null {
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

  // Dropdown items (custom, no target of their own) have no slug and land here.
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
