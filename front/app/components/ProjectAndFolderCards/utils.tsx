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

  const { published, archived, draft } = statusCounts;

  if (published && published > 0) return 'published';
  if (archived && archived > 0) return 'archived';
  if (draft && draft > 0) return 'draft';
  return 'all';
}
