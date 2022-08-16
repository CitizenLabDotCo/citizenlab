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
  showSearch?: boolean;
}

const ProjectAndFolderCards = ({
  publicationStatusFilter,
  showSearch = false,
  ...otherProps
}: Props) => {
  // used locally to keep track of the depth of the search
  const [search, setSearch] = useState<string | null>(null);
  const rootLevelOnly = search && search.length > 0 ? false : true;

  const { counts, onChangeTopics, onChangeAreas, onChangeSearch } =
    useAdminPublicationsStatusCount({
      publicationStatusFilter,
      rootLevelOnly,
      removeNotAllowedParents: true,
    });

  const [currentTab, setCurrentTab] = useState<PublicationTab | undefined>(
    undefined
  );

  useEffect(() => {
    if (isNilOrError(counts) || currentTab) return;
    setCurrentTab((currentTab) => getCurrentTab(counts, currentTab));
  }, [counts, currentTab]);

  const handleSearchChange = (search: string | null) => {
    // set search term locally to calculate depth
    setSearch(search);
    // pass search term to useAdminPublicationsStatusCount hook
    onChangeSearch(search);
  }

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
      onChangeSearch={handleSearchChange}
      showSearch={showSearch}
      rootLevelOnly={rootLevelOnly}
      {...otherProps}
    />
  );
};

export default ProjectAndFolderCards;
