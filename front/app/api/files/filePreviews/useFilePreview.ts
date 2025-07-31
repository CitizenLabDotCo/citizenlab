import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import filePreviewsKeys from './keys';
import { IFilePreview, FilePreviewKeys } from './types';

const fetchPreviewByFileId = (id?: string | null) =>
  fetcher<IFilePreview>({
    path: `/files/${id}/preview`,
    action: 'get',
  });

const useFilePreview = (id?: string) => {
  return useQuery<IFilePreview, CLErrors, IFilePreview, FilePreviewKeys>({
    queryKey: filePreviewsKeys.item({ id }),
    queryFn: () => fetchPreviewByFileId(id),
    enabled: !!id,
    refetchInterval: (data) => {
      // Poll every 2 seconds if status is pending, otherwise stop polling
      return data?.data.attributes.status === 'pending' ? 2000 : false;
    },
  });
};

export default useFilePreview;
