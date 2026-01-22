import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import inputTopicsKeys from './keys';
import { IInputTopics, InputTopicsKeys } from './types';

type SortMethod = 'custom' | 'ideas_count' | '-ideas_count';

interface InputTopicsParams {
  projectId: string;
  sort?: SortMethod;
  parentId?: string;
  /** Filter by depth in the hierarchy. 0 are root topics, 1 are child topics */
  depth?: number;
}

const fetchInputTopics = ({
  projectId,
  sort,
  parentId,
  depth,
}: InputTopicsParams) =>
  fetcher<IInputTopics>({
    path: `/projects/${projectId}/input_topics`,
    action: 'get',
    queryParams: {
      sort,
      parent_id: parentId,
      depth: depth,
    },
  });

const useInputTopics = (projectId?: string, sort?: SortMethod) => {
  return useQuery<IInputTopics, CLErrors, IInputTopics, InputTopicsKeys>({
    queryKey: inputTopicsKeys.list({ projectId: projectId || '', sort }),
    queryFn: () => fetchInputTopics({ projectId: projectId!, sort }),
    enabled: !!projectId,
  });
};

export default useInputTopics;
