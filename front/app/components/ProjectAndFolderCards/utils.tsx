import { IStatusCounts, PublicationTab } from 'services/adminPublications';
import { keys } from 'utils/helperUtils';

export function getCurrentTab(
  statusCounts: IStatusCounts,
  currentTab?: PublicationTab
): PublicationTab {
  if (currentTab) {
    return statusCounts[currentTab] > 0 ? currentTab : 'all';
  }

  return statusCounts.published > 0 ? 'published' : 'all';
}

export function getAvailableTabs(
  statusCounts: IStatusCounts
): PublicationTab[] {
  if (statusCounts.all === 0) {
    return ['all'];
  }

  return keys(statusCounts).filter((tab) => statusCounts[tab] > 0);
}
