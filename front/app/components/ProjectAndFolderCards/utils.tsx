import { IStatusCountsAll } from 'api/admin_publications_status_counts/types';
import { PublicationStatus } from 'api/projects/types';

import { keys } from 'utils/helperUtils';

import { PublicationTab } from './';

export function getCurrentTab(statusCounts: IStatusCountsAll): PublicationTab {
  const { published, archived, draft, all } = statusCounts;

  if (published && published > 0) return 'published';
  if (archived && all > archived) return 'archived';
  if (draft && all > draft) return 'draft';
  return 'all';
}

export function getAvailableTabs(
  statusCounts: IStatusCountsAll
): PublicationTab[] {
  if (statusCounts.all === 0) {
    return ['all'];
  }

  const tabsWithCounts = keys(statusCounts).filter((tab) => {
    const count = statusCounts[tab];
    return count && count > 0;
  });

  return tabsWithCounts.length === 2
    ? tabsWithCounts.includes('published')
      ? ['published']
      : ['all']
    : sortInPreferredOrder(tabsWithCounts);
}

const PREFERRED_ORDER: PublicationTab[] = [
  'published',
  'archived',
  'draft',
  'all',
];

function sortInPreferredOrder(tabs: PublicationTab[]) {
  const tabsSet = new Set(tabs);
  return PREFERRED_ORDER.filter((tab) => tabsSet.has(tab));
}

export const getPublicationStatuses = (
  currentTab: PublicationTab
): PublicationStatus[] => {
  switch (currentTab) {
    case 'published':
      return ['published'];
    case 'archived':
      return ['archived'];
    case 'draft':
      return ['draft'];
    default:
      return ['published', 'archived'];
  }
};
