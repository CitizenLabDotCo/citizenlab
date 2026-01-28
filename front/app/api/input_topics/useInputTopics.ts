import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import inputTopicsKeys from './keys';
import { IInputTopics, InputTopicsKeys } from './types';

type SortMethod = 'custom' | 'ideas_count' | '-ideas_count';

interface InputTopicsParams {
  projectId: string;
  filters?: {
    sort?: SortMethod;
    parent_id?: string;
    depth?: number;
  };
}

const fetchInputTopics = ({ projectId, filters }: InputTopicsParams) =>
  fetcher<IInputTopics>({
    path: `/projects/${projectId}/input_topics`,
    action: 'get',
    queryParams: filters,
  });

const useInputTopics = (
  projectId?: string,
  filters?: InputTopicsParams['filters']
) => {
  return useQuery<IInputTopics, CLErrors, IInputTopics, InputTopicsKeys>({
    queryKey: inputTopicsKeys.list({ projectId: projectId || '', ...filters }),
    queryFn: () => fetchInputTopics({ projectId: projectId!, filters }),
    enabled: !!projectId,
  });
};

export default useInputTopics;
