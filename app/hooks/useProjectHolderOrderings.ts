import { useState, useEffect, useCallback } from 'react';
import { combineLatest } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { listProjectHolderOrderings, IProjectHolderOrderingData } from 'services/projectHolderOrderings';
import { projectsStream } from 'services/projects';
import { projectFoldersStream } from 'services/projectFolders';
import { isNilOrError } from 'utils/helperUtils';
import { unionBy, isString } from 'lodash-es';

export interface InputProps {
  pageSize?: number;
  areaFilter?: string[];
}

export interface IOutput {
  list: IProjectHolderOrderingData[] | undefined | null;
  hasMore: boolean;
  loadingInitial: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onChangeAreas: (areas: string[] | null) => void;
}

// interface IQueryParameters {
//   'page[number]': number;
//   'page[size]': number;
//   areas?: string[];
//   // TODO 3 publication_statuses?: PublicationStatus[];
//   filter_can_moderate?: boolean;
// }

export default function useProjectHolderOrderings({ pageSize = 1000, areaFilter }: InputProps) {
  const [list, setList] = useState<IProjectHolderOrderingData[] | undefined | null>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [areas, setAreas] = useState<string[] | undefined>(areaFilter);

  const onLoadMore = useCallback(() => {
    if (hasMore) {
      setLoadingMore(true);
      setPageNumber(prevPageNumber => prevPageNumber + 1);
    }
  }, [hasMore]);

  const onChangeAreas = useCallback((areas) => {
    setAreas(areas);
    setPageNumber(1);
  }, []);

  useEffect(() => {
    // reset pageNumber on pageSize change
    setPageNumber(1);
  }, [pageSize]);

  useEffect(() => {
    const subscription = listProjectHolderOrderings({
      queryParameters: {
        'page[number]': pageNumber,
        'page[size]': pageSize
      }
    }).observable.pipe(
      switchMap((projectHolderOrderings) => {
        const projectIds = projectHolderOrderings.data
          .filter(holder => holder.relationships.project_holder.data.type === 'project')
          .map(holder => holder.relationships.project_holder.data.id);

        const projectFoldersIds = projectHolderOrderings.data
          .filter(holder => holder.relationships.project_holder.data.type === 'project_folder')
          .map(holder => holder.relationships.project_holder.data.id);

        return combineLatest([
          projectsStream({
            queryParameters: {
              areas,
              filter_ids: projectIds
            }
          }).observable,
          projectFoldersStream({
            queryParameters: {
              filter_ids: projectFoldersIds
            }
          }).observable
        ]).pipe(
          map(projects => ({ projectHolderOrderings, projects }))
        );
      })
    ).subscribe(({ projectHolderOrderings }) => {
      console.log(projectHolderOrderings);
      setLoadingInitial(false);
      setLoadingMore(false);

      if (isNilOrError(projectHolderOrderings)) {
        setList(null);
        setHasMore(false);
      } else {
        const selfLink = projectHolderOrderings ?.links ?.self;
        const lastLink = projectHolderOrderings ?.links ?.last;
        const hasMore = !!(isString(selfLink) && isString(lastLink) && selfLink !== lastLink);
        setList(prevList => !isNilOrError(prevList) ? unionBy(prevList, projectHolderOrderings.data, 'id') : projectHolderOrderings.data);
        setHasMore(hasMore);
      }
    });

    return () => subscription.unsubscribe();
  }, [pageNumber, pageSize, areas]);

  return {
    list,
    hasMore,
    loadingInitial,
    loadingMore,
    onLoadMore,
    onChangeAreas,
    queryParameters: {
      areas,
      'page[number]': pageNumber,
      'page[size]': pageSize
    }
  };
}
