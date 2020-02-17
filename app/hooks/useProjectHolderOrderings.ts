import { useState, useEffect, useCallback } from 'react';
import { combineLatest } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { listProjectHolderOrderings, IProjectHolderOrderingData } from 'services/projectHolderOrderings';
import { projectByIdStream } from 'services/projects';
import { projectFolderByIdStream } from 'services/projectFolders';
import { isNilOrError } from 'utils/helperUtils';
import { unionBy, isString } from 'lodash-es';

export interface InputProps {
  pageSize?: number;
}

export interface IOutput {
  list: IProjectHolderOrderingData[] | undefined | null;
  hasMore: boolean;
  loadingInitial: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export default function useProjectHolderOrderings({ pageSize = 1000 }: InputProps) {
  const [list, setList] = useState<IProjectHolderOrderingData[] | undefined | null>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);

  const onLoadMore = useCallback(() => {
    if (hasMore) {
      setLoadingMore(true);
      setPageNumber(prevPageNumber => prevPageNumber + 1);
    }
  }, [hasMore]);

  // reset pageNumber on pageSize change
  useEffect(() => {
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
        return combineLatest(
          projectHolderOrderings.data.map((projectHolderOrdering) => {
            if (projectHolderOrdering.relationships.project_holder.data.type === 'project') {
              return projectByIdStream(projectHolderOrdering.relationships.project_holder.data.id).observable;
            }

            return projectFolderByIdStream(projectHolderOrdering.relationships.project_holder.data.id).observable;
          })
        ).pipe(
          map(projects => ({ projectHolderOrderings, projects }))
        );
      })
    ).subscribe(({ projectHolderOrderings }) => {
      if (isNilOrError(projectHolderOrderings)) {
        setList(null);
        setHasMore(false);
      } else {
        const selfLink = projectHolderOrderings?.links?.self;
        const lastLink = projectHolderOrderings?.links?.last;
        const hasMore = !!(isString(selfLink) && isString(lastLink) && selfLink !== lastLink);
        setList(prevList => !isNilOrError(prevList) && loadingMore ? unionBy(prevList, projectHolderOrderings.data, 'id') : projectHolderOrderings.data);
        setHasMore(hasMore);
      }

      setLoadingInitial(false);
      setLoadingMore(false);
    });

    return () => subscription.unsubscribe();
  }, [pageNumber, pageSize, loadingMore]);

  return {
    list,
    hasMore,
    loadingInitial,
    loadingMore,
    onLoadMore
  };
}
