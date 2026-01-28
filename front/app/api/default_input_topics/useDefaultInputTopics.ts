import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import defaultInputTopicsKeys from './keys';
import { IDefaultInputTopics, DefaultInputTopicsKeys } from './types';

const fetchDefaultInputTopics = () =>
  fetcher<IDefaultInputTopics>({
    path: `/default_input_topics`,
    action: 'get',
  });

const useDefaultInputTopics = () => {
  return useQuery<
    IDefaultInputTopics,
    CLErrors,
    IDefaultInputTopics,
    DefaultInputTopicsKeys
  >({
    queryKey: defaultInputTopicsKeys.list(),
    queryFn: () => fetchDefaultInputTopics(),
  });
};

export default useDefaultInputTopics;
