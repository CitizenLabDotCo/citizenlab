import { useState, useEffect, useCallback } from 'react';
import { combineLatest } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { listProjectHolderOrderings } from 'services/projectHolderOrderings';
import { projectsStream, IProjectData } from 'services/projects';
import { projectFoldersStream, IProjectFolderData } from 'services/projectFolders';
import { isNilOrError } from 'utils/helperUtils';
import { unionBy, isString } from 'lodash-es';

export interface InputProps {
  pageSize?: number;
  areaFilter?: string[];
}

export type IProjectHolderOrderingContent = {
  id: string;
  projectHolderType: 'project';
  attributes: {
    ordering: number;
  };
  projectHolder: IProjectData;
} | {
  id: string;
  projectHolderType: 'project_folder';
  attributes: {
    ordering: number;
  };
  projectHolder: IProjectFolderData;
};

export interface IOutput {
  list: IProjectHolderOrderingContent[] | undefined | null;
  hasMore: boolean;
  loadingInitial: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onChangeAreas: (areas: string[] | null) => void;
}

export default function useProjectHolderOrderings({ pageSize = 1000, areaFilter }: InputProps) {
  const [list, setList] = useState<IProjectHolderOrderingContent[] | undefined | null>(undefined);
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

        return combineLatest(
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
        ).pipe(
          map((projects) => ({ projectHolderOrderings, projects: projects[0].data, projectFolders: projects[1].data }))
        );
      })
    ).subscribe(({ projectHolderOrderings, projects, projectFolders }) => {
      setLoadingInitial(false);
      setLoadingMore(false);

      if (isNilOrError(projectHolderOrderings)) {
        setList(null);
        setHasMore(false);
      } else {
        const selfLink = projectHolderOrderings ?.links ?.self;
        const lastLink = projectHolderOrderings ?.links ?.last;

        const receivedItems = projectHolderOrderings.data.map(ordering => {
          const holderType = ordering.relationships.project_holder.data.type;
          const holderId = ordering.relationships.project_holder.data.id;
          const holder = holderType === 'project'
            ? projects.find(project => project.id === holderId)
            : projectFolders.find(projectFolder => projectFolder.id === holderId);
            if (!holder) {
              console.log('filtered project', holderId);
            }

          return {
            id: ordering.id,
            projectHolderType: holderType,
            attributes: {
              ordering: ordering.attributes.ordering,
            },
            projectHolder: holder
          };
        }).filter(item => item.projectHolder) as IProjectHolderOrderingContent[];

        const hasMore = !!(isString(selfLink) && isString(lastLink) && selfLink !== lastLink);
        setList(prevList => !isNilOrError(prevList) && loadingMore ? unionBy(prevList, receivedItems, 'id') : receivedItems);
        setHasMore(hasMore);
      }
    });

    return () => subscription.unsubscribe();
  }, [pageNumber, pageSize, areas, loadingMore]);

  return {
    list,
    hasMore,
    loadingInitial,
    loadingMore,
    onLoadMore,
    onChangeAreas,
  };
}
