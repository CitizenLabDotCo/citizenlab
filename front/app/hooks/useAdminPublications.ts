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
import { useDeepCompareEffect } from 'react-use';

export interface BaseProps {
  // to rename
  topicFilter?: string[] | null;
  areaFilter?: string[] | null;
  publicationStatusFilter: PublicationStatus[];
  // to be clarified
  rootLevelOnly?: boolean;
  // to be clarified
  removeNotAllowedParents?: boolean;
}

export interface InputProps extends BaseProps {
  pageSize?: number;
  /**
   * childrenOfId is an id of a folder that we want
   * child admin publications of.
   * Folders are the only admin publication type that can have
   * children at the moment.
   * Their children can only be projects at the moment.
   */
  childrenOfId?: string;
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

export interface IUseAdminPublicationsOutput {
  list: IAdminPublicationContent[] | undefined | null | Error;
  hasMore: boolean;
  loadingInitial: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onChangeTopics: (topics: string[]) => void;
  onChangeSearch: (string: string | null) => void;
  onChangeAreas: (areas: string[]) => void;
  onChangePublicationStatus: (publicationStatuses: PublicationStatus[]) => void;
}

export default function useAdminPublications({
  pageSize = 1000,
  topicFilter,
  areaFilter,
  publicationStatusFilter,
  rootLevelOnly = false,
  removeNotAllowedParents = false,
  childrenOfId,
}: InputProps): IUseAdminPublicationsOutput {
  const [list, setList] = useState<
    IAdminPublicationContent[] | undefined | null | Error
  >(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [search, setSearch] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[] | null>(null);
  const [areas, setAreas] = useState<string[] | null>(null);
  const [publicationStatuses, setPublicationStatuses] = useState<
    PublicationStatus[]
  >(publicationStatusFilter);

  // topicFilter and areaFilter are usually based of other
  // requests, and will initially be null/undefined.
  // Without the useEffect, they don't get updated
  // (or useDeepCompareEffect because we are comparing arrays here).
  useDeepCompareEffect(() => {
    if (topicFilter !== undefined) {
      setTopics(topicFilter);
    }
  }, [topicFilter]);
  useDeepCompareEffect(() => {
    if (areaFilter !== undefined) {
      setAreas(areaFilter);
    }
  }, [areaFilter]);

  const onLoadMore = useCallback(() => {
    if (hasMore) {
      setLoadingMore(true);
      setPageNumber((prevPageNumber) => prevPageNumber + 1);
    }
  }, [hasMore]);

  const onChangeTopics = useCallback((topics) => {
    setTopics(topics);
    setPageNumber(1);
  }, []);

  const onChangeAreas = useCallback((areas) => {
    setAreas(areas);
    setPageNumber(1);
  }, []);

  const onChangeSearch = useCallback((search: string | null) => {
    setSearch(search);
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
      'page[number]': pageNumber,
      'page[size]': pageSize,
      search,
      depth: rootLevelOnly ? 0 : undefined,
      ...(topics && { topics }),
      ...(areas && { areas }),
      publication_statuses: publicationStatuses,
      remove_not_allowed_parents: removeNotAllowedParents,
      folder: childrenOfId,
    };

    const subscription = listAdminPublications({
      queryParameters,
    })
      .observable.pipe(distinctUntilChanged())
      .subscribe((adminPublications) => {
        if (isNilOrError(adminPublications)) {
          setList(adminPublications);
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
            .filter((item) => item);

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
    search,
    topics,
    areas,
    publicationStatuses,
    rootLevelOnly,
    removeNotAllowedParents,
    childrenOfId,
  ]);

  return {
    list,
    hasMore,
    loadingInitial,
    loadingMore,
    onLoadMore,
    onChangeTopics,
    onChangeAreas,
    onChangeSearch,
    onChangePublicationStatus,
  };
}
