import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import defaultInputTopicsKeys from './keys';
import { IDefaultInputTopic, DefaultInputTopicsKeys } from './types';

const fetchDefaultInputTopic = ({ id }: { id: string }) =>
  fetcher<IDefaultInputTopic>({
    path: `/default_input_topics/${id}`,
    action: 'get',
  });

const useDefaultInputTopic = (id: string) => {
  return useQuery<
    IDefaultInputTopic,
    CLErrors,
    IDefaultInputTopic,
    DefaultInputTopicsKeys
  >({
    queryKey: defaultInputTopicsKeys.item({ id }),
    queryFn: () => fetchDefaultInputTopic({ id }),
  });
};

export default useDefaultInputTopic;
