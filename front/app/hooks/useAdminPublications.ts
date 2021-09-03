import { useState, useEffect, useCallback } from 'react';
import { distinctUntilChanged } from 'rxjs/operators';
import {
  listAdminPublications,
  IAdminPublicationData,
  AdminPublicationType,
} from 'services/adminPublications';
import { PublicationStatus } from 'services/projects';
import { isNilOrError } from 'utils/helperUtils';
import { unionBy, isString } from 'lodash-es';
import { IRelationship } from 'typings';

export interface InputProps {
  pageSize?: number;
  areaFilter?: string[];
  publicationStatusFilter: PublicationStatus[];
  rootLevelOnly?: boolean;
  removeNotAllowedParents?: boolean;
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
export interface IUseAdminPublicationsOutput {
  list: IAdminPublicationContent[] | undefined | null;
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
  rootLevelOnly = false,
  removeNotAllowedParents = false,
}: InputProps) {
  const [all, setAll] = useState<IAdminPublicationContent[] | undefined | null>(
    undefined
  );
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
    const queryParameters = {
      areas,
      publication_statuses: publicationStatuses,
      'page[number]': pageNumber,
      'page[size]': pageSize,
      remove_not_allowed_parents: removeNotAllowedParents,
      depth: rootLevelOnly && 0,
    };

    const subscription = listAdminPublications({
      queryParameters,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pageNumber,
    pageSize,
    areas,
    publicationStatuses,
    rootLevelOnly,
    removeNotAllowedParents,
  ]);

  useEffect(() => {
    const queryParameters = {
      areas,
      publication_statuses: publicationStatuses,
    };

    const subscription = listAdminPublications({ queryParameters })
      .observable.pipe(distinctUntilChanged())
      .subscribe((adminPublications) => {
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

        setAll(receivedItems);
      });

    return () => subscription.unsubscribe();
  }, [areas, publicationStatuses]);

  const childrenOf = useCallback(
    ({ id: publicationId }: ChildrenOfProps) => {
      if (isNilOrError(all)) {
        return [];
      }

      return all.filter(
        (publication) =>
          !isNilOrError(publication.relationships.parent.data) &&
          publication.relationships.parent.data.id === publicationId
      );
    },
    [all]
  );

  return {
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
