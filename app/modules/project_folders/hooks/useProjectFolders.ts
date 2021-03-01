import { useState, useEffect, useCallback } from 'react';
import {
  IProjectFolderData,
  projectFoldersStream,
} from 'modules/project_folders/services/projectFolders';

interface Props {
  projectFolderIds?: string[];
  pageNumber?: number;
  pageSize?: number;
}

function useProjectFolders(props: Props) {
  const [pageNumber, setPageNumber] = useState(props.pageNumber);
  const [pageSize, setPageSize] = useState(props.pageSize);
  const [projectFolders, setProjectFolders] = useState<
    IProjectFolderData[] | undefined | null | Error
  >(undefined);
  const [projectFolderIds, setProjectFolderIds] = useState(
    props.projectFolderIds
  );

  const onPageNumberChange = useCallback((newPageNumber: number) => {
    setPageNumber(newPageNumber);
  }, []);

  const onPageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPageNumber(1);
  }, []);

  const onProjectFolderIdsChange = useCallback((projectFolderIds: string[]) => {
    setProjectFolderIds([...projectFolderIds]);
  }, []);

  useEffect(() => {
    const subscription = projectFoldersStream({
      queryParameters: {
        'page[number]': pageNumber || 1,
        'page[size]': pageSize,
        filter_ids: projectFolderIds,
      },
    }).observable.subscribe((response) => {
      setProjectFolders(response.data);
    });

    return () => subscription.unsubscribe();
  }, [projectFolderIds, pageNumber, pageSize]);

  return {
    projectFolders,
    onPageNumberChange,
    onPageSizeChange,
    onProjectFolderIdsChange,
  };
}

export default useProjectFolders;
