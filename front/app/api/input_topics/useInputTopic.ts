import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import inputTopicsKeys from './keys';
import { IInputTopic, InputTopicsKeys } from './types';

const fetchInputTopic = ({
  projectId,
  id,
}: {
  projectId: string;
  id: string;
}) =>
  fetcher<IInputTopic>({
    path: `/projects/${projectId}/input_topics/${id}`,
    action: 'get',
  });

const useInputTopic = (projectId: string, id: string) => {
  return useQuery<IInputTopic, CLErrors, IInputTopic, InputTopicsKeys>({
    queryKey: inputTopicsKeys.item({ projectId, id }),
    queryFn: () => fetchInputTopic({ projectId, id }),
  });
};

export default useInputTopic;
