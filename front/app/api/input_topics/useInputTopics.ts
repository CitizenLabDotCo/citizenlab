import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import inputTopicsKeys from './keys';
import { IInputTopics, InputTopicsKeys } from './types';

const fetchInputTopics = ({ projectId }: { projectId: string }) =>
  fetcher<IInputTopics>({
    path: `/projects/${projectId}/input_topics`,
    action: 'get',
  });

const useInputTopics = (projectId: string) => {
  return useQuery<IInputTopics, CLErrors, IInputTopics, InputTopicsKeys>({
    queryKey: inputTopicsKeys.list({ projectId }),
    queryFn: () => fetchInputTopics({ projectId }),
  });
};

export default useInputTopics;
