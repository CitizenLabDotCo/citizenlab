import { IStatusCounts } from 'hooks/useAdminPublicationsStatusCounts';
import { PublicationTab } from './';

export function getCurrentTab(
  statusCounts: IStatusCounts,
  currentTab?: PublicationTab
): PublicationTab {
  if (currentTab) {
    const count = statusCounts[currentTab];

    if (count && count > 0) {
      return currentTab;
    }
  }

  const { published, archived, draft, all } = statusCounts;

  if (published && published > 0) return 'published';
  if (archived && all > archived) return 'archived';
  if (draft && all > draft) return 'draft';
  return 'all';
}
