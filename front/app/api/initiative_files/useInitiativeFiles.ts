import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeFilesKeys from './keys';
import { IInitiativeFiles, InitiativeFilesKeys } from './types';

const fetchInitiativeFiles = (initiativeId: string) =>
  fetcher<IInitiativeFiles>({
    path: `/initiatives/${initiativeId}/files`,
    action: 'get',
  });

const useInitiativeFiles = (initiativeId: string) => {
  return useQuery<
    IInitiativeFiles,
    CLErrors,
    IInitiativeFiles,
    InitiativeFilesKeys
  >({
    queryKey: initiativeFilesKeys.list(initiativeId),
    queryFn: () => fetchInitiativeFiles(initiativeId),
  });
};

export default useInitiativeFiles;
