import { useState, useEffect, useCallback } from 'react';
import {
  moderationsStream,
  IModerationData,
  TModerationStatus,
  TModeratableTypes,
} from '../services/moderations';
import { isNilOrError } from 'utils/helperUtils';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

interface InputProps {
  pageNumber?: number;
  pageSize?: number;
  moderationStatus?: TModerationStatus;
  moderatableTypes?: TModeratableTypes[];
  projectIds?: string[];
  searchTerm?: string;
  isFlagged?: boolean;
}

export default function useModerations(props: InputProps) {
  const [pageNumber, setPageNumber] = useState(props.pageNumber || 1);
  const [pageSize, setPageSize] = useState(props.pageSize || 12);
  const [
    moderationStatus,
    setModerationStatus,
  ] = useState<TModerationStatus | null>(props.moderationStatus || null);
  const [list, setList] = useState<
    IModerationData[] | undefined | null | Error
  >(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [moderatableTypes, setModeratableTypes] = useState(
    props.moderatableTypes || []
  );
  const [projectIds, setProjectIds] = useState(props.projectIds || []);
  const [searchTerm, setSearchTerm] = useState(props.searchTerm || '');
  const [isFlagged, setIsFlagged] = useState(props.isFlagged || false);

  const onPageNumberChange = useCallback((newPageNumber: number) => {
    setPageNumber(newPageNumber);
  }, []);

  const onPageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPageNumber(1);
  }, []);

  const onModerationStatusChange = useCallback(
    (newModerationStatus: TModerationStatus | null) => {
      setModerationStatus(newModerationStatus);
    },
    []
  );

  const onModeratableTypesChange = useCallback(
    (newModeratableTypes: TModeratableTypes[]) => {
      setModeratableTypes([...newModeratableTypes]);
    },
    []
  );

  const onProjectIdsChange = useCallback((projectIds: string[]) => {
    setProjectIds([...projectIds]);
  }, []);

  const onSearchTermChange = useCallback((searchTerm: string) => {
    setSearchTerm(searchTerm);
  }, []);

  const onIsFlaggedChange = useCallback((isFlagged: boolean) => {
    setIsFlagged(isFlagged);
  }, []);

  useEffect(() => {
    const subscription = moderationsStream({
      queryParameters: {
        'page[number]': pageNumber,
        'page[size]': pageSize,
        moderation_status: moderationStatus,
        moderatable_types: moderatableTypes,
        project_ids: projectIds,
        search: searchTerm,
        is_flagged: isFlagged,
      },
    }).observable.subscribe((response) => {
      const list = !isNilOrError(response) ? response.data : response;
      const currentPage = getPageNumberFromUrl(response?.links?.self) || 1;
      const lastPage = getPageNumberFromUrl(response?.links?.last) || 1;
      setList(list);
      setCurrentPage(currentPage);
      setLastPage(lastPage);
    });

    return () => subscription.unsubscribe();
  }, [
    pageNumber,
    pageSize,
    moderationStatus,
    moderatableTypes,
    projectIds,
    searchTerm,
  ]);

  return {
    list,
    currentPage,
    lastPage,
    pageSize,
    moderationStatus,
    onPageNumberChange,
    onPageSizeChange,
    onModerationStatusChange,
    onModeratableTypesChange,
    onProjectIdsChange,
    onSearchTermChange,
    onIsFlaggedChange,
  };
}
