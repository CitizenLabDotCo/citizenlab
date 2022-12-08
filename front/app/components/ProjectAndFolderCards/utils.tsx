import { IStatusCounts } from 'hooks/useAdminPublicationsStatusCounts';
import { PublicationTab } from './';
import { keys } from 'utils/helperUtils';

export function getCurrentTab(
  statusCounts: IStatusCounts,
  currentTab: PublicationTab | null
): PublicationTab {
  const { published, archived, draft, all } = statusCounts;

  if (currentTab) {
    const count = statusCounts[currentTab];

    if (count && count > 0) {
      return currentTab;
    }
  }
  if (published && published > 0) return 'published';
  if (archived && all > archived) return 'archived';
  if (draft && all > draft) return 'draft';
  return 'all';
}

export function getAvailableTabs(
  statusCounts: IStatusCounts
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
