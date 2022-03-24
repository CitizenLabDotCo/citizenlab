import React, { useState, useEffect } from 'react';

// hooks
import useAdminPublicationsStatusCount from 'hooks/useAdminPublicationsStatusCounts';

// components
import ProjectAndFolderCardsInner from './ProjectAndFolderCardsInner';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getCurrentTab } from './utils';

// typings
import { PublicationStatus } from 'services/projects';

export type PublicationTab = PublicationStatus | 'all';

export type TLayout = 'dynamic' | 'threecolumns' | 'twocolumns';

export interface Props {
  showTitle: boolean;
  layout: TLayout;
  publicationStatusFilter: PublicationStatus[];
}

const ProjectAndFolderCards = ({
  publicationStatusFilter,
  ...otherProps
}: Props) => {
  const { counts, onChangeTopics, onChangeAreas } =
    useAdminPublicationsStatusCount({
      publicationStatusFilter,
      rootLevelOnly: true,
      removeNotAllowedParents: true,
    });

  const [currentTab, setCurrentTab] = useState<PublicationTab | undefined>(
    undefined
  );

  useEffect(() => {
    if (isNilOrError(counts) || currentTab) return;
    setCurrentTab((currentTab) => getCurrentTab(counts, currentTab));
  }, [counts, currentTab]);

  const onChangeTab = (tab: PublicationTab) => {
    setCurrentTab(tab);
  };

  if (isNilOrError(counts) || !currentTab) {
    return null;
  }

  return (
    <ProjectAndFolderCardsInner
      currentTab={currentTab}
      statusCounts={counts}
      publicationStatusFilter={publicationStatusFilter}
      onChangeTopics={onChangeTopics}
      onChangeAreas={onChangeAreas}
      onChangeTab={onChangeTab}
      {...otherProps}
    />
  );
};

export default ProjectAndFolderCards;
