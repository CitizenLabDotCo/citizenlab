import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import filesKeys from './keys';
import { FilesKeys, IFiles } from './types';

const fetchFileById = (id?: string | null) =>
  fetcher<IFiles>({
    path: `/files/${id}`,
    action: 'get',
  });

const useFileById = (id?: string | null) => {
  return useQuery<IFiles, CLErrors, IFiles, FilesKeys>({
    queryKey: filesKeys.item({ id }),
    queryFn: () => fetchFileById(id),
    enabled: !!id,
  });
};

export default useFileById;
