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

export default function createUseAdminPublicationsStatusCounts({
  areaFilter,
  publicationStatusFilter,
  rootLevelOnly = false,
  removeChildlessParents = false,
  removeNotAllowedParents = false,
}: BaseProps) {
  const [counts, setCounts] = useState<
    IStatusCounts | undefined | null | Error
  >(undefined);
  const [areas, setAreas] = useState<string[] | undefined>(areaFilter);
  const [publicationStatuses, setPublicationStatuses] = useState<
    PublicationStatus[]
  >(publicationStatusFilter);

  const onChangeAreas = useCallback((areas: string[]) => {
    areas.length === 0 ? setAreas(undefined) : setAreas(areas);
  }, []);

  useEffect(() => {
    const queryParameters = {
      depth: rootLevelOnly ? 0 : undefined,
      areas,
      publication_statuses: publicationStatuses,
      remove_childless_parents: removeChildlessParents,
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
    areas,
    publicationStatuses,
    rootLevelOnly,
    removeChildlessParents,
    removeNotAllowedParents,
  ]);

  return {
    counts,
    onChangeAreas,
    onChangePublicationStatus: setPublicationStatuses,
  };
}

function computeTotalStatusCounts(
  statusCounts: IStatusCountsBase
): IStatusCounts {
  const all = keys(statusCounts).reduce((acc, curr) => {
    const count = statusCounts[curr];
    return count ? acc + count : acc;
  }, 0);

  return {
    ...statusCounts,
    all,
  };
}
