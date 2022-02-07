import React, { useState, useEffect } from 'react';

// hooks
import useAdminPublicationsStatusCount from 'hooks/useAdminPublicationsStatusCounts';
import { BaseProps } from 'hooks/useAdminPublications';

// components
import ProjectAndFolderCards, { TLayout } from './ProjectAndFolderCards';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getCurrentTab } from './utils';

// typings
import { PublicationStatus } from 'services/projects';

export type PublicationTab = PublicationStatus | 'all';

export interface Props {
  showTitle: boolean;
  layout: TLayout;
  allowedPublicationStatuses: BaseProps['publicationStatusFilters'];
}

export default ({ allowedPublicationStatuses, ...props }: Props) => {
  const { counts, onChangeAreas } = useAdminPublicationsStatusCount({
    publicationStatusFilters: allowedPublicationStatuses,
    rootLevelOnly: true,
    removeNotAllowedParents: true,
  });

  const [currentTab, setCurrentTab] = useState<PublicationTab | undefined>(
    undefined
  );
  const [
    publicationStatusesForCurrentTab,
    setPublicationStatusesForCurrentTab,
  ] = useState<PublicationStatus[]>(allowedPublicationStatuses);

  useEffect(() => {
    if (isNilOrError(counts)) return;
    setCurrentTab((currentTab) => getCurrentTab(counts, currentTab));
  }, [counts]);

  useEffect(() => {
    if (!currentTab) return;

    setPublicationStatusesForCurrentTab(
      currentTab === 'all' ? allowedPublicationStatuses : [currentTab]
    );
  }, [currentTab]);

  const onChangeTab = (tab: PublicationTab) => {
    setCurrentTab(tab);
  };

  if (
    isNilOrError(counts) ||
    !currentTab ||
    !publicationStatusesForCurrentTab
  ) {
    return null;
  }

  if (!isNilOrError(publicationStatusesForCurrentTab)) {
    return (
      <ProjectAndFolderCards
        currentTab={currentTab}
        statusCounts={counts}
        onChangeAreas={onChangeAreas}
        onChangeTab={onChangeTab}
        publicationStatusFilters={publicationStatusesForCurrentTab}
        {...props}
      />
    );
  }

  return null;
};
