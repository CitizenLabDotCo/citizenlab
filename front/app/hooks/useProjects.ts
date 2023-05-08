import { useState, useEffect } from 'react';

// services
import {
  projectsStream,
  IProjectData,
  IProjects,
  PublicationStatus,
} from 'services/projects';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { Sort } from 'resources/GetProjects';

export interface Props {
  pageNumber?: number;
  pageSize?: number;
  sort?: Sort;
  areas?: string[];
  publicationStatuses: PublicationStatus[];
  canModerate?: boolean;
  projectIds?: string[];
}

interface QueryParameters {
  'page[number]': number;
  'page[size]': number;
  sort?: Sort;
  areas?: string[];
  publication_statuses: PublicationStatus[];
  filter_can_moderate?: boolean;
  filter_ids?: string[];
}

function useProjects({
  pageNumber,
  pageSize,
  sort,
  areas,
  publicationStatuses,
  canModerate,
  projectIds,
}: Props) {
  const [projects, setProjects] = useState<IProjectData[] | NilOrError>();

  const strParams = JSON.stringify({
    areas,
    publication_statuses: publicationStatuses,
    filter_ids: projectIds,
  });

  useEffect(() => {
    const queryParameters: QueryParameters = {
      'page[number]': pageNumber ?? 1,
      'page[size]': pageSize ?? 250,
      sort,
      filter_can_moderate: canModerate,
      ...JSON.parse(strParams),
    };

    const { observable } = projectsStream({ queryParameters });

    const subscription = observable.subscribe(
      (response: IProjects | NilOrError) => {
        setProjects(isNilOrError(response) ? response : response.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [pageNumber, pageSize, sort, canModerate, strParams]);

  return projects;
}

export default useProjects;
