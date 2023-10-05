import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import topicsKeys from './keys';
import { ITopic, TopicsKeys } from './types';

const fetchTopic = ({ id }: { id: string }) =>
  fetcher<ITopic>({ path: `/topics/${id}`, action: 'get' });

const useTopic = (id: string) => {
  return useQuery<ITopic, CLErrors, ITopic, TopicsKeys>({
    queryKey: topicsKeys.item({ id }),
    queryFn: () => fetchTopic({ id }),
  });
};

export default useTopic;
