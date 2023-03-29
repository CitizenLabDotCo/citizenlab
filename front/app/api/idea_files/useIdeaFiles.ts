import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaFilesKeys from './keys';
import { IIdeaFiles, IdeaFilesKeys } from './types';

const fetchIdeaFiles = ({ ideaId }: { ideaId?: string }) =>
  fetcher<IIdeaFiles>({
    path: `/ideas/${ideaId}/files`,
    action: 'get',
  });

const useIdeaFiles = (ideaId?: string) => {
  return useQuery<IIdeaFiles, CLErrors, IIdeaFiles, IdeaFilesKeys>({
    queryKey: ideaFilesKeys.list({ ideaId }),
    queryFn: () => fetchIdeaFiles({ ideaId }),
    enabled: !!ideaId,
  });
};

export default useIdeaFiles;
