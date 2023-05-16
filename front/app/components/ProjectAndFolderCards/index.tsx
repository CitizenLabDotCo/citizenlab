import React, { useState } from 'react';

// hooks
import useAdminPublicationsStatusCounts from 'hooks/useAdminPublicationsStatusCounts';

// components
import ProjectAndFolderCardsInner from './ProjectAndFolderCardsInner';

// utils
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// typings
import { PublicationStatus } from 'api/projects/types';
import useAdminPublications from 'hooks/useAdminPublications';

export type PublicationTab = PublicationStatus | 'all';

export type TLayout = 'dynamic' | 'threecolumns';

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
  // with a search string, return projects within folders
  // if no search string exists, do not return projects in folders
  const rootLevelOnly = !search || search.length === 0;

  const { counts, onChangeTopics, onChangeAreas, onChangeSearch } =
    useAdminPublicationsStatusCounts({
      publicationStatusFilter,
      rootLevelOnly,
      removeNotAllowedParents: true,
    });

  const adminPublications = useAdminPublications({
    pageSize: 6,
    publicationStatusFilter,
    rootLevelOnly,
    removeNotAllowedParents: true,
  });

  const { counts: statusCountsWithoutFilters } =
    useAdminPublicationsStatusCounts({
      publicationStatusFilter,
      rootLevelOnly: true,
      removeNotAllowedParents: true,
    });

  const handleSearchChange = React.useCallback(
    (search: string | null) => {
      // set search term locally to calculate depth
      setSearch(search);
      // pass search term to useAdminPublicationsStatusCount hook
      onChangeSearch(search);

      // analytics event for the updated search term
      trackEventByName(tracks.searchTermChanged, { searchTerm: search });
    },
    [onChangeSearch]
  );

  return (
    <ProjectAndFolderCardsInner
      statusCounts={counts}
      publicationStatusFilter={publicationStatusFilter}
      onChangeTopics={onChangeTopics}
      onChangeAreas={onChangeAreas}
      onChangeSearch={handleSearchChange}
      showSearch={showSearch}
      showFilters={true}
      adminPublications={adminPublications}
      statusCountsWithoutFilters={statusCountsWithoutFilters}
      {...otherProps}
    />
  );
};

export default ProjectAndFolderCards;
