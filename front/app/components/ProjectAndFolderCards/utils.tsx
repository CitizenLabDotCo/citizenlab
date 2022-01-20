import { IStatusCounts } from 'services/adminPublications';
import { PublicationTab } from './';

export function getCurrentTab(
  statusCounts: IStatusCounts,
  currentTab?: PublicationTab
): PublicationTab {
  if (currentTab) {
    return statusCounts[currentTab] > 0 ? currentTab : 'all';
  }

  return statusCounts.published > 0 ? 'published' : 'all';
}
