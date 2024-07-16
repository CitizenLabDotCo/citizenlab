import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import pageFilesKeys from './keys';
import { IPageFiles, PageFilesKeys } from './types';

const fetchPageFiles = ({ pageId }: { pageId?: string }) =>
  fetcher<IPageFiles>({
    path: `/static_pages/${pageId}/files`,
    action: 'get',
  });

const usePageFiles = (pageId?: string) => {
  return useQuery<IPageFiles, CLErrors, IPageFiles, PageFilesKeys>({
    queryKey: pageFilesKeys.list({ pageId }),
    queryFn: () => fetchPageFiles({ pageId }),
    enabled: !!pageId,
  });
};

export default usePageFiles;
