import { useState, useEffect, useCallback } from 'react';
import { distinctUntilChanged } from 'rxjs/operators';

// services
import {
  adminPublicationsStatusCounts,
  IStatusCountsBase,
} from 'services/adminPublications';

// typings
import { BaseProps } from 'hooks/useAdminPublications';
import { PublicationStatus } from 'api/projects/types';

// utils
import { isNilOrError, keys } from 'utils/helperUtils';

export interface IStatusCounts extends IStatusCountsBase {
  all: number;
}

export default function useAdminPublicationsStatusCounts({
  topicIds,
  areaIds,
  publicationStatusFilter,
  rootLevelOnly = false,
  removeNotAllowedParents = false,
  onlyProjects = false,
}: BaseProps) {
  const [counts, setCounts] = useState<
    IStatusCounts | undefined | null | Error
  >(undefined);
  const [topics, setTopics] = useState<string[] | null>(null);
  const [areas, setAreas] = useState<string[] | null>(null);
  const [search, setSearch] = useState<string | null>(null);
  const [publicationStatuses, setPublicationStatuses] = useState<
    PublicationStatus[]
  >(publicationStatusFilter);

  // topicIds and areaIds are usually based off other
  // requests, and will initially be null/undefined.
  // Without the useEffect, they don't get updated
  const stringifiedTopicIds = JSON.stringify(topicIds);
  useEffect(() => {
    if (topicIds !== undefined) {
      setTopics(topicIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringifiedTopicIds]);

  const stringifiedAreaIds = JSON.stringify(areaIds);
  useEffect(() => {
    if (areaIds !== undefined) {
      setAreas(areaIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringifiedAreaIds]);

  const onChangeTopics = useCallback((topics: string[]) => {
    topics.length === 0 ? setTopics(null) : setTopics(topics);
  }, []);

  const onChangeAreas = useCallback((areas: string[]) => {
    areas.length === 0 ? setAreas(null) : setAreas(areas);
  }, []);

  const onChangeSearch = useCallback((search: string | null) => {
    search && search.length === 0 ? setSearch(null) : setSearch(search);
  }, []);

  useEffect(() => {
    const queryParameters = {
      depth: rootLevelOnly ? 0 : undefined,
      ...(topics && { topics }),
      ...(areas && { areas }),
      publication_statuses: publicationStatuses,
      remove_not_allowed_parents: removeNotAllowedParents,
      only_projects: onlyProjects,
      search,
    };

    const subscription = adminPublicationsStatusCounts({
      queryParameters,
    })
      .observable.pipe(distinctUntilChanged())
      .subscribe((statusCounts) => {
        isNilOrError(statusCounts)
          ? setCounts(statusCounts)
          : setCounts(computeTotalStatusCounts(statusCounts.status_counts));
      });

    return () => subscription.unsubscribe();
  }, [
    topics,
    areas,
    publicationStatuses,
    rootLevelOnly,
    removeNotAllowedParents,
    onlyProjects,
    search,
  ]);

  return {
    counts,
    onChangeTopics,
    onChangeAreas,
    onChangePublicationStatus: setPublicationStatuses,
    onChangeSearch,
  };
}

function computeTotalStatusCounts(
  statusCounts: IStatusCountsBase
): IStatusCounts {
  const all = keys(statusCounts).reduce((statusCountTotal, status) => {
    const statusCount = statusCounts[status];
    return statusCount ? statusCountTotal + statusCount : statusCountTotal;
  }, 0);

  return {
    ...statusCounts,
    all,
  };
}
