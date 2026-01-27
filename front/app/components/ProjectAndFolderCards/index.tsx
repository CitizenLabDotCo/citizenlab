import React, { useState } from 'react';

import { omitBy } from 'lodash-es';
import { Multiloc } from 'typings';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { IStatusCounts } from 'api/admin_publications_status_counts/types';
import useAdminPublicationsStatusCounts from 'api/admin_publications_status_counts/useAdminPublicationsStatusCounts';
import getStatusCounts from 'api/admin_publications_status_counts/util/getAdminPublicationsStatusCount';
import { PublicationStatus } from 'api/projects/types';

import { trackEventByName } from 'utils/analytics';
import { isNil } from 'utils/helperUtils';

import ProjectAndFolderCardsInner from './ProjectAndFolderCardsInner';
import tracks from './tracks';
import { getCurrentTab, getPublicationStatuses } from './utils';

export type PublicationTab = PublicationStatus | 'all';

export type TLayout = 'dynamic' | 'threecolumns';

export interface Props {
  showTitle: boolean;
  layout: TLayout;
  showSearch?: boolean;
  currentlyWorkingOnText?: Multiloc;
}

interface InnerProps extends Props {
  statusCountsWithoutFilters: IStatusCounts;
}

export const PUBLICATION_STATUSES: PublicationStatus[] = [
  'published',
  'archived',
];

const ProjectAndFolderCards = ({
  showSearch = false,
  statusCountsWithoutFilters,
  ...otherProps
}: InnerProps) => {
  const allStatusCountsWithoutFilters = getStatusCounts(
    statusCountsWithoutFilters
  );

  // used locally to keep track of the depth of the search
  const [search, setSearch] = useState<string | null>(null);
  const [topicIds, setTopicsIds] = useState<string[] | null>(null);
  const [areaIds, setAreasIds] = useState<string[] | null>(null);
  const [currentTab, setCurrentTab] = useState<PublicationTab>(
    getCurrentTab(allStatusCountsWithoutFilters)
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
        publicationStatusFilter: PUBLICATION_STATUSES,
        rootLevelOnly,
        removeNotAllowedParents: true,
        remove_all_unlisted: true,
        topicIds,
        areaIds,
        search,
      },
      isNil
    )
  );

  const {
    data,
    isInitialLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useAdminPublications({
    pageSize: 6,
    publicationStatusFilter: getPublicationStatuses(currentTab),
    rootLevelOnly,
    removeNotAllowedParents: true,
    globalTopicIds: topicIds,
    areaIds,
    search,
    include_publications: true,
    remove_all_unlisted: true,
  });

  const adminPublications = data?.pages.map((page) => page.data).flat();

  const handleSearchChange = React.useCallback((search: string | null) => {
    // set search term locally to calculate depth
    setSearch(search);
    // pass search term to useAdminPublicationsStatusCount hook

    // event for the updated search term
    trackEventByName(tracks.searchTermChanged, { searchTerm: search });
  }, []);

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!counts || !statusCountsWithoutFilters) {
    return null;
  }

  return (
    <ProjectAndFolderCardsInner
      currentTab={currentTab}
      statusCounts={getStatusCounts(counts)}
      showSearch={showSearch}
      showFilters={true}
      adminPublications={adminPublications || []}
      statusCountsWithoutFilters={allStatusCountsWithoutFilters}
      loadingInitial={isInitialLoading}
      hasMore={hasNextPage}
      loadingMore={isFetchingNextPage}
      searchTerm={search}
      {...otherProps}
      onChangeTopics={setTopicsIds}
      onChangeAreas={setAreasIds}
      onChangeSearch={handleSearchChange}
      onLoadMore={fetchNextPage}
      onChangeCurrentTab={setCurrentTab}
    />
  );
};

const ProjectAndFolderCardsWrapper = (props: Props) => {
  const { data: statusCountsWithoutFilters } = useAdminPublicationsStatusCounts(
    {
      publicationStatusFilter: PUBLICATION_STATUSES,
      rootLevelOnly: true,
      removeNotAllowedParents: true,
      remove_all_unlisted: true,
    }
  );

  if (!statusCountsWithoutFilters) {
    return null;
  }

  return (
    <ProjectAndFolderCards
      {...props}
      statusCountsWithoutFilters={statusCountsWithoutFilters}
    />
  );
};

export default ProjectAndFolderCardsWrapper;
