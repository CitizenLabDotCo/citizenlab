import { useState, useEffect, useCallback } from 'react';
import { combineLatest } from 'rxjs';
import { switchMap, map, distinctUntilChanged } from 'rxjs/operators';
import { listAdminPublications } from 'services/adminPublications';
import { projectsStream, IProjectData, PublicationStatus } from 'services/projects';
import { projectFoldersStream, IProjectFolderData } from 'services/projectFolders';
import { isNilOrError } from 'utils/helperUtils';
import { unionBy, isString } from 'lodash-es';

export interface InputProps {
  pageSize?: number;
  areaFilter?: string[];
  publicationStatusFilter: PublicationStatus[];
  noEmptyFolder?: boolean;
  folderId?: string | null;
}

export type IAdminPublicationContent = {
  id: string;
  adminPublicationType: 'project';
  attributes: {
    ordering: number;
  };
  adminPublication: IProjectData;
} | {
  id: string;
  adminPublicationType: 'project_folder';
  attributes: {
    ordering: number;
  };
  adminPublication: IProjectFolderData;
};

export interface IOutput {
  list: IAdminPublicationContent[] | undefined | null;
  hasMore: boolean;
  loadingInitial: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onChangeAreas: (areas: string[] | null) => void;
  onChangePublicationStatus: (publicationStatuses: PublicationStatus[]) => void;
}

export default function useAdminPublications({ pageSize = 1000, areaFilter, publicationStatusFilter, noEmptyFolder, folderId }: InputProps) {
  const [list, setList] = useState<IAdminPublicationContent[] | undefined | null>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [areas, setAreas] = useState<string[] | undefined>(areaFilter);
  const [publicationStatuses, setPublicationStatuses] = useState<PublicationStatus[]>(publicationStatusFilter);

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

  const onChangePublicationStatus = useCallback((publicationStatuses) => {
    setPublicationStatuses(publicationStatuses);
    setPageNumber(1);
  }, []);

  // reset pageNumber on pageSize change
  useEffect(() => {
    setPageNumber(1);
  }, [pageSize]);

  useEffect(() => {
    const subscription = listAdminPublications({
      queryParameters: {
        folder: folderId,
        areas,
        publication_statuses: publicationStatuses,
        'page[number]': pageNumber,
        'page[size]': pageSize
      }
    }).observable.pipe(
      distinctUntilChanged(),
      switchMap((adminPublications) => {
        const projectIds = adminPublications.data
          .filter(publication => publication.relationships.publication.data.type === 'project')
          .map(publication => publication.relationships.publication.data.id);

        const projectFoldersIds = adminPublications.data
          .filter(publication => publication.relationships.publication.data.type === 'project_folder')
          .map(publication => publication.relationships.publication.data.id);

        return combineLatest(
          projectsStream({
            queryParameters: {
              filter_ids: projectIds,
            }
          }).observable,
          projectFoldersStream({
            queryParameters: {
              filter_ids: projectFoldersIds
            }
          }).observable
        ).pipe(
          map((projects) => ({ adminPublications, projects: projects[0].data, projectFolders: projects[1].data }))
        );
      })
    ).subscribe(({ adminPublications, projects, projectFolders }) => {
      if (isNilOrError(adminPublications)) {
        setList(null);
        setHasMore(false);
      } else {
        const selfLink = adminPublications ?.links ?.self;
        const lastLink = adminPublications ?.links ?.last;

        const receivedItems = adminPublications.data.map(ordering => {
          const publicationType = ordering.relationships.publication.data.type;
          const publicationId = ordering.relationships.publication.data.id;
          const publication = publicationType === 'project'
            ? projects.find(project => project.id === publicationId)
            : projectFolders.find(projectFolder => projectFolder.id === publicationId);
          if (!publication) {
            return null;
          }

          return {
            id: ordering.id,
            adminPublicationType: publicationType,
            attributes: {
              ordering: ordering.attributes.ordering,
            },
            adminPublication: publication
          };
        }).filter(item => item) as IAdminPublicationContent[];

        const hasMore = !!(isString(selfLink) && isString(lastLink) && selfLink !== lastLink);
        setHasMore(hasMore);
        setList(prevList => !isNilOrError(prevList) && loadingMore ? unionBy(prevList, receivedItems, 'id') : receivedItems);
      }
      setLoadingInitial(false);
      setLoadingMore(false);
    });

    return () => subscription.unsubscribe();
  }, [pageNumber, pageSize, areas, publicationStatuses]);

// TODO noEmptyFolder filter
  return {
    list,
    hasMore,
    loadingInitial,
    loadingMore,
    onLoadMore,
    onChangeAreas,
    onChangePublicationStatus
  };
}
