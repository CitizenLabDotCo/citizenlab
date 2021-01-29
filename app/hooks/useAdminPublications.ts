import { useState, useEffect, useCallback, useMemo } from 'react';
import { distinctUntilChanged } from 'rxjs/operators';
import {
  listAdminPublications,
  IAdminPublicationData,
  AdminPublicationType,
} from 'services/adminPublications';
import { PublicationStatus } from 'services/projects';
import { isNilOrError } from 'utils/helperUtils';
import { unionBy, isString } from 'lodash-es';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { IRelationship } from 'typings';

export interface InputProps {
  pageSize?: number;
  areaFilter?: string[];
  publicationStatusFilter: PublicationStatus[];
  noEmptyFolder?: boolean;
  // TODO: remove folder id
  folderId?: string | null;
}

export type IAdminPublicationContent = {
  id: string;
  publicationType: AdminPublicationType;
  publicationId: string;
  attributes: IAdminPublicationData['attributes'];
  relationships: {
    children: {
      data: IRelationship[];
    };
    parent: {
      data?: IRelationship;
    };
    publication: {
      data: IRelationship;
    };
  };
};

export interface ChildrenOfProps {
  id?: string;
}
export interface IOutput {
  list: IAdminPublicationContent[] | undefined | null;
  topLevel: IAdminPublicationContent[];
  hasMore: boolean;
  loadingInitial: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  childrenOf: ({ id }: ChildrenOfProps) => IAdminPublicationContent[];
  onChangeAreas: (areas: string[] | null) => void;
  onChangePublicationStatus: (publicationStatuses: PublicationStatus[]) => void;
}

export default function useAdminPublications({
  pageSize = 1000,
  areaFilter,
  publicationStatusFilter,
  noEmptyFolder,
}: InputProps) {
  const [list, setList] = useState<
    IAdminPublicationContent[] | undefined | null
  >(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [areas, setAreas] = useState<string[] | undefined>(areaFilter);
  const [publicationStatuses, setPublicationStatuses] = useState<
    PublicationStatus[]
  >(publicationStatusFilter);
  const isProjectFoldersEnabled = useFeatureFlag('project_folders');

  const onLoadMore = useCallback(() => {
    if (hasMore) {
      setLoadingMore(true);
      setPageNumber((prevPageNumber) => prevPageNumber + 1);
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
        areas,
        publication_statuses: publicationStatuses,
        'page[number]': pageNumber,
        'page[size]': pageSize,
        filter_empty_folders: noEmptyFolder,
      },
    })
      .observable.pipe(distinctUntilChanged())
      .subscribe((adminPublications) => {
        if (isNilOrError(adminPublications)) {
          setList(null);
          setHasMore(false);
        } else {
          const selfLink = adminPublications?.links?.self;
          const lastLink = adminPublications?.links?.last;

          const receivedItems = adminPublications.data
            .map((adminPublication) => {
              const publicationType =
                adminPublication.relationships.publication.data.type;
              const publicationId =
                adminPublication.relationships.publication.data.id;

              return {
                publicationId,
                publicationType,
                id: adminPublication.id,
                relationships: adminPublication.relationships,
                attributes: {
                  ...adminPublication.attributes,
                },
              };
            })
            .filter((item) => item) as IAdminPublicationContent[];

          const hasMore = !!(
            isString(selfLink) &&
            isString(lastLink) &&
            selfLink !== lastLink
          );
          setHasMore(hasMore);
          setList((prevList) =>
            !isNilOrError(prevList) && loadingMore
              ? unionBy(prevList, receivedItems, 'id')
              : receivedItems
          );
        }
        setLoadingInitial(false);
        setLoadingMore(false);
      });

    return () => subscription.unsubscribe();
  }, [pageNumber, pageSize, areas, publicationStatuses]);

  const topLevel = useMemo<IAdminPublicationContent[]>(() => {
    if (isNilOrError(list)) return [];

    if (isProjectFoldersEnabled) {
      return list.filter(({ relationships }) => !relationships.parent.data);
    }

    return list;
  }, [list, isProjectFoldersEnabled]);

  const childrenOf = useCallback(
    ({ id: publicationId }: ChildrenOfProps) => {
      if (isNilOrError(list)) return [];

      const publication = list.find(({ id }) => id === publicationId);
      if (isNilOrError(publication)) return [];

      const childPublicationIds = publication.relationships.children.data.map(
        ({ id }) => id
      );

      return list.filter(({ id }) => childPublicationIds.includes(id));
    },
    [list]
  );

  return {
    topLevel,
    list,
    hasMore,
    loadingInitial,
    loadingMore,
    childrenOf,
    onLoadMore,
    onChangeAreas,
    onChangePublicationStatus,
  };
}
