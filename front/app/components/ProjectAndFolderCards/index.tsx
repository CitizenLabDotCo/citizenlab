import React, { useState, useEffect, useMemo, useCallback } from 'react';

// hooks
import useAdminPublicationsStatusCount from 'hooks/useAdminPublicationsStatusCounts';

// components
import ProjectAndFolderCards, { BaseProps } from './ProjectAndFolderCards';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getCurrentTab, getAvailableTabs } from './utils';

// typings
import { PublicationTab } from 'services/adminPublications';

export default ({ publicationStatusFilter, ...otherProps }: BaseProps) => {
  const { counts, onChangeAreas } = useAdminPublicationsStatusCount({
    publicationStatusFilter,
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

  const publicationStatuses = useMemo(() => {
    if (!currentTab) return;

    return currentTab === 'all' ? publicationStatusFilter : [currentTab];
  }, [currentTab]);

  const availableTabs = useMemo(() => {
    if (isNilOrError(counts)) return;
    return getAvailableTabs(counts);
  }, [counts]);

  const onChangeTab = useCallback((tab: PublicationTab) => {
    setCurrentTab(tab);
  }, []);

  if (
    isNilOrError(counts) ||
    !currentTab ||
    !publicationStatuses ||
    !availableTabs
  ) {
    return null;
  }

  return (
    <ProjectAndFolderCards
      currentTab={currentTab}
      availableTabs={availableTabs}
      publicationStatusFilter={publicationStatuses}
      onChangeAreas={onChangeAreas}
      onChangeTab={onChangeTab}
      {...otherProps}
    />
  );
};
