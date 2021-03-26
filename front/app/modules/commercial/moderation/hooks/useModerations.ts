import { useState, useEffect, useCallback } from 'react';
import {
  moderationsStream,
  IModerationData,
  TModerationStatuses,
  TModeratableTypes,
} from '../services/moderations';
import { isNilOrError } from 'utils/helperUtils';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

interface InputProps {
  pageNumber?: number;
  pageSize?: number;
  moderationStatus?: TModerationStatuses;
  moderatableTypes: TModeratableTypes[];
  projectIds: string[];
  searchTerm: string;
}

export default function useModerations(props: InputProps) {
  const [pageNumber, setPageNumber] = useState(props.pageNumber);
  const [pageSize, setPageSize] = useState(props.pageSize);
  const [moderationStatus, setModerationStatus] = useState(
    props.moderationStatus
  );
  const [list, setList] = useState<
    IModerationData[] | undefined | null | Error
  >(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [moderatableTypes, setModeratableTypes] = useState(
    props.moderatableTypes
  );
  const [projectIds, setProjectIds] = useState(props.projectIds);
  const [searchTerm, setSearchTerm] = useState(props.searchTerm);

  const onPageNumberChange = useCallback((newPageNumber: number) => {
    setPageNumber(newPageNumber);
  }, []);

  const onPageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPageNumber(1);
  }, []);

  const onModerationStatusChange = useCallback(
    (newModerationStatus: TModerationStatuses) => {
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

  useEffect(() => {
    setPageNumber(props.pageNumber);
    setPageSize(props.pageSize);
    setModerationStatus(props.moderationStatus);
  }, [props.pageNumber, props.pageSize, props.moderationStatus]);

  useEffect(() => {
    const subscription = moderationsStream({
      queryParameters: {
        'page[number]': pageNumber || 1,
        'page[size]': pageSize,
        moderation_status: moderationStatus,
        moderatable_types: moderatableTypes,
        project_ids: projectIds,
        search: searchTerm,
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
  };
}
