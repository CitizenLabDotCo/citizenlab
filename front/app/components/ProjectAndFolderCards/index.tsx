import React, { useState } from 'react';

// hooks
import useAdminPublicationsStatusCounts from 'api/admin_publications_status_counts/useAdminPublicationsStatusCounts';

// components
import ProjectAndFolderCardsInner from './ProjectAndFolderCardsInner';

// utils
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// typings
import { PublicationStatus } from 'api/projects/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import getStatusCounts from 'api/admin_publications_status_counts/util/getAdminPublicationsStatusCount';

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
  const [topicIds, setTopicsIds] = useState<string[] | null>(null);
  const [areaIds, setAreasIds] = useState<string[] | null>(null);
  const [publicationStatus, setPublicationStatus] = useState<
    PublicationStatus[]
  >(publicationStatusFilter);

  // with a search string, return projects within folders
  // if no search string exists, do not return projects in folders
  const rootLevelOnly = !search || search.length === 0;

  const { data: counts } = useAdminPublicationsStatusCounts({
    publicationStatusFilter,
    rootLevelOnly,
    removeNotAllowedParents: true,
    topicIds,
    areaIds,
    search,
  });

  const { data: statusCountsWithoutFilters } = useAdminPublicationsStatusCounts(
    {
      publicationStatusFilter,
      rootLevelOnly: true,
      removeNotAllowedParents: true,
    }
  );

  const {
    data,
    isInitialLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useAdminPublications({
    pageSize: 6,
    publicationStatusFilter: publicationStatus,
    rootLevelOnly,
    removeNotAllowedParents: true,
    topicIds,
    areaIds,
    search,
  });

  const onChangeTopics = (topics: string[]) => {
    setTopicsIds(topics);
  };

  const onChangeAreas = (areas: string[]) => {
    setAreasIds(areas);
  };

  const onChangePublicationStatus = React.useCallback(
    (publicationStatus: PublicationStatus[]) => {
      setPublicationStatus(publicationStatus);
    },
    []
  );

  const adminPublications = data?.pages.map((page) => page.data).flat();

  const handleSearchChange = React.useCallback((search: string | null) => {
    // set search term locally to calculate depth
    setSearch(search);
    // pass search term to useAdminPublicationsStatusCount hook

    // analytics event for the updated search term
    trackEventByName(tracks.searchTermChanged, { searchTerm: search });
  }, []);

  if (!counts || !statusCountsWithoutFilters) {
    return null;
  }

  return (
    <ProjectAndFolderCardsInner
      statusCounts={getStatusCounts(counts)}
      publicationStatusFilter={publicationStatusFilter}
      onChangeTopics={onChangeTopics}
      onChangeAreas={onChangeAreas}
      search={search}
      onChangeSearch={handleSearchChange}
      showSearch={showSearch}
      showFilters={true}
      adminPublications={adminPublications || []}
      statusCountsWithoutFilters={getStatusCounts(statusCountsWithoutFilters)}
      loadingInitial={isInitialLoading}
      hasMore={hasNextPage}
      onLoadMore={fetchNextPage}
      onChangePublicationStatus={onChangePublicationStatus}
      loadingMore={isFetchingNextPage}
      {...otherProps}
    />
  );
};

export default ProjectAndFolderCards;
