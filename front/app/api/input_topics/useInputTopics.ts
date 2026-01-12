import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import inputTopicsKeys from './keys';
import { IInputTopics, InputTopicsKeys } from './types';

type SortMethod = 'custom' | 'ideas_count' | '-ideas_count';

interface InputTopicsParams {
  projectId: string;
  sort?: SortMethod;
}

const fetchInputTopics = ({ projectId, sort }: InputTopicsParams) =>
  fetcher<IInputTopics>({
    path: `/projects/${projectId}/input_topics`,
    action: 'get',
    queryParams: sort ? { sort } : undefined,
  });

const useInputTopics = (projectId?: string, sort?: SortMethod) => {
  return useQuery<IInputTopics, CLErrors, IInputTopics, InputTopicsKeys>({
    queryKey: inputTopicsKeys.list({ projectId: projectId || '', sort }),
    queryFn: () => fetchInputTopics({ projectId: projectId!, sort }),
    enabled: !!projectId,
  });
};

export default useInputTopics;
