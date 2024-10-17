import React, { useState } from 'react';

import { omitBy } from 'lodash-es';
import { Multiloc } from 'typings';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useAdminPublicationsStatusCounts from 'api/admin_publications_status_counts/useAdminPublicationsStatusCounts';
import getStatusCounts from 'api/admin_publications_status_counts/util/getAdminPublicationsStatusCount';
import { PublicationStatus } from 'api/projects/types';

import { trackEventByName } from 'utils/analytics';
import { isNil } from 'utils/helperUtils';

import ProjectAndFolderCardsInner from './ProjectAndFolderCardsInner';
import tracks from './tracks';

export type PublicationTab = PublicationStatus | 'all';

export type TLayout = 'dynamic' | 'threecolumns';

export interface Props {
  showTitle: boolean;
  layout: TLayout;
  showSearch?: boolean;
  currentlyWorkingOnText?: Multiloc;
}

const INITIAL_PUBLICATION_STATUSES: PublicationStatus[] = [
  'published',
  'archived',
];

const ProjectAndFolderCards = ({
  showSearch = false,
  ...otherProps
}: Props) => {
  // used locally to keep track of the depth of the search
  const [search, setSearch] = useState<string | null>(null);
  const [topicIds, setTopicsIds] = useState<string[] | null>(null);
  const [areaIds, setAreasIds] = useState<string[] | null>(null);
  const [publicationStatus, setPublicationStatus] = useState(
    INITIAL_PUBLICATION_STATUSES
  );

  // with a search string, return projects within folders
  // if no search string exists, do not return projects in folders
  const rootLevelOnly = !search || search.length === 0;

  // On initial load, the params for counts and statusCountsWithoutFilters
  // are functionally the same, but without omitting the nil parameters
  // the caching keys were not matching. As a result, we were making two
  // identical requests for no reason. With this nil omission logic, we
  // only make one request.
  const { data: counts } = useAdminPublicationsStatusCounts(
    omitBy(
      {
        publicationStatusFilter: INITIAL_PUBLICATION_STATUSES,
        rootLevelOnly,
        removeNotAllowedParents: true,
        topicIds,
        areaIds,
        search,
      },
      isNil
    )
  );

  const { data: statusCountsWithoutFilters } = useAdminPublicationsStatusCounts(
    {
      publicationStatusFilter: INITIAL_PUBLICATION_STATUSES,
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
    include_publications: true,
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

    // event for the updated search term
    trackEventByName(tracks.searchTermChanged, { searchTerm: search });
  }, []);

  if (!counts || !statusCountsWithoutFilters) {
    return null;
  }

  return (
    <ProjectAndFolderCardsInner
      statusCounts={getStatusCounts(counts)}
      onChangeTopics={onChangeTopics}
      onChangeAreas={onChangeAreas}
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
