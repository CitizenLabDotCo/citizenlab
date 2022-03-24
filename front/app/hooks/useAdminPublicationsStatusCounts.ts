import { useState, useEffect, useCallback } from 'react';
import { distinctUntilChanged } from 'rxjs/operators';

// services
import {
  adminPublicationsStatusCounts,
  IStatusCountsBase,
} from 'services/adminPublications';

// typings
import { BaseProps } from 'hooks/useAdminPublications';
import { PublicationStatus } from 'services/projects';

// utils
import { isNilOrError, keys } from 'utils/helperUtils';

export interface IStatusCounts extends IStatusCountsBase {
  all: number;
}

export default function useAdminPublicationsStatusCounts({
  topicFilter,
  areaFilter,
  publicationStatusFilter,
  rootLevelOnly = false,
  removeNotAllowedParents = false,
}: BaseProps) {
  const [counts, setCounts] = useState<
    IStatusCounts | undefined | null | Error
  >(undefined);
  const [topics, setTopics] = useState<string[] | undefined>(topicFilter);
  const [areas, setAreas] = useState<string[] | undefined>(areaFilter);
  const [publicationStatuses, setPublicationStatuses] = useState<
    PublicationStatus[]
  >(publicationStatusFilter);

  const onChangeTopics = useCallback((topics: string[]) => {
    topics.length === 0 ? setTopics(undefined) : setTopics(topics);
  }, []);

  const onChangeAreas = useCallback((areas: string[]) => {
    areas.length === 0 ? setAreas(undefined) : setAreas(areas);
  }, []);

  useEffect(() => {
    const queryParameters = {
      depth: rootLevelOnly ? 0 : undefined,
      topics,
      areas,
      publication_statuses: publicationStatuses,
      remove_not_allowed_parents: removeNotAllowedParents,
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
  ]);

  return {
    counts,
    onChangeTopics,
    onChangeAreas,
    onChangePublicationStatus: setPublicationStatuses,
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
