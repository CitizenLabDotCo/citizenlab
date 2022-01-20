import { keys } from 'utils/helperUtils';
import { IStatusCounts } from 'services/adminPublications';
import { PublicationTab } from '../../';

export function getAvailableTabs(
  statusCounts: IStatusCounts
): PublicationTab[] {
  if (statusCounts.all === 0) {
    return ['all'];
  }

  return keys(statusCounts).filter((tab) => statusCounts[tab] > 0);
}

export function attachAllTab(statusCounts: IStatusCounts) {
  // TODO
}
