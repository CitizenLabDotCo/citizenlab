import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import filesKeys from './keys';
import { FilesKeys, IFile } from './types';

const fetchFileById = (id?: string | null) =>
  fetcher<IFile>({
    path: `/files/${id}`,
    action: 'get',
  });

const useFileById = (id?: string | null) => {
  return useQuery<IFile, CLErrors, IFile, FilesKeys>({
    queryKey: filesKeys.item({ id }),
    queryFn: () => fetchFileById(id),
    enabled: !!id,
  });
};

export default useFileById;
