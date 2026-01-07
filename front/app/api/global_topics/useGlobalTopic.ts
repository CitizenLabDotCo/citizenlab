import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import globalTopicsKeys from './keys';
import { IGlobalTopic, GlobalTopicsKeys } from './types';

const fetchGlobalTopic = ({ id }: { id: string }) =>
  fetcher<IGlobalTopic>({ path: `/global_topics/${id}`, action: 'get' });

const useGlobalTopic = (id: string) => {
  return useQuery<IGlobalTopic, CLErrors, IGlobalTopic, GlobalTopicsKeys>({
    queryKey: globalTopicsKeys.item({ id }),
    queryFn: () => fetchGlobalTopic({ id }),
  });
};

export default useGlobalTopic;
