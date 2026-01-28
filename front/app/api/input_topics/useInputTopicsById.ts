import { useQueries } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import inputTopicsKeys from './keys';
import { IInputTopic } from './types';

const fetchInputTopicById = (id: string) =>
  fetcher<IInputTopic>({
    path: `/input_topics/${id}`,
    action: 'get',
  });

const useInputTopicsById = (ids: string[]) => {
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: inputTopicsKeys.item({ id }),
      queryFn: () => fetchInputTopicById(id),
      enabled: !!id,
    })),
  });

  return {
    data: results
      .filter((result) => result.data)
      .map((result) => result.data as IInputTopic),
    isLoading: results.some((result) => result.isLoading),
  };
};

export default useInputTopicsById;
