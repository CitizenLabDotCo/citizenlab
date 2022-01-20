import { IStatusCounts, PublicationTab } from 'services/adminPublications';

export function getCurrentTab(
  statusCounts: IStatusCounts,
  currentTab?: PublicationTab
): PublicationTab {
  if (currentTab) {
    return statusCounts[currentTab] > 0 ? currentTab : 'all';
  }

  return statusCounts.published > 0 ? 'published' : 'all';
}
