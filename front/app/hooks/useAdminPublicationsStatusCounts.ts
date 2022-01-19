import { useState, useCallback, useEffect } from 'react';
import { distinctUntilChanged } from 'rxjs/operators';

// services
import {
  adminPublicationsStatusCounts,
  IStatusCounts,
} from 'services/adminPublications';

// typings
import { BaseProps } from 'hooks/useAdminPublications';
import { PublicationStatus } from 'services/projects';
import { isNilOrError } from 'utils/helperUtils';

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

  const onChangeAreas = useCallback(setAreas, []);
  const onChangePublicationStatus = useCallback(setPublicationStatuses, []);

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
          : setCounts(statusCounts.status_counts);
      });

    return () => subscription.unsubscribe();
  }, []);

  return {
    counts,
    onChangeAreas,
    onChangePublicationStatus,
  };
}
