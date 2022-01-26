import { keys } from 'utils/helperUtils';
import { IStatusCounts } from 'hooks/useAdminPublicationsStatusCounts';
import { PublicationTab } from '../../';

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
