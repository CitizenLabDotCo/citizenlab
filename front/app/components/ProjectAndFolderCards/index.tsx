import React, { useState, useEffect, useMemo, useCallback } from 'react';

// hooks
import useAdminPublicationsStatusCount from 'hooks/useAdminPublicationsStatusCounts';

// components
import ProjectAndFolderCards, { BaseProps } from './ProjectAndFolderCards';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getCurrentTab } from './utils';

// typings
import { PublicationStatus } from 'services/projects';

export type PublicationTab = PublicationStatus | 'all';

  allowedPublicationStatuses: BaseProps['publicationStatusFilters'];
export default ({ allowedPublicationStatuses, ...props }: Props) => {
  const { counts, onChangeAreas } = useAdminPublicationsStatusCount({
    publicationStatusFilters: allowedPublicationStatuses,
    rootLevelOnly: true,
    removeNotAllowedParents: true,
  });

  const [currentTab, setCurrentTab] = useState<PublicationTab | undefined>(
    undefined
  );

  useEffect(() => {
    if (isNilOrError(counts)) return;
    setCurrentTab((currentTab) => getCurrentTab(counts, currentTab));
  }, [counts]);

  const publicationStatusesStringified = JSON.stringify(
    publicationStatusFilter
  );

  const publicationStatuses = useMemo(() => {
    if (!currentTab) return;

    return currentTab === 'all' ? publicationStatusFilter : [currentTab];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, publicationStatusesStringified]);

  const onChangeTab = useCallback((tab: PublicationTab) => {
    setCurrentTab(tab);
  }, []);

  if (isNilOrError(counts) || !currentTab || !publicationStatuses) {
    return null;
  }

  return (
    <ProjectAndFolderCards
      currentTab={currentTab}
      statusCounts={counts}
      publicationStatusFilter={publicationStatuses}
      onChangeAreas={onChangeAreas}
      onChangeTab={onChangeTab}
      {...otherProps}
    />
  );
};
