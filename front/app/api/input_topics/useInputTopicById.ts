import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import inputTopicsKeys from './keys';
import { IInputTopic, InputTopicsKeys } from './types';

const fetchInputTopicById = (id: string) =>
  fetcher<IInputTopic>({
    path: `/input_topics/${id}`,
    action: 'get',
  });

const useInputTopicById = (id?: string) => {
  return useQuery<IInputTopic, CLErrors, IInputTopic, InputTopicsKeys>({
    queryKey: inputTopicsKeys.item({ id: id || '' }),
    queryFn: () => fetchInputTopicById(id!),
    enabled: !!id,
  });
};

export default useInputTopicById;
