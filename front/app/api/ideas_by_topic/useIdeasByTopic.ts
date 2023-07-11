import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IIdeasByTopic, IdeasByTopicKeys, IIdeasByTopicParams } from './types';
import ideasByTopicKeys from './keys';

const fetchIdeasByTopic = (params: IIdeasByTopicParams) =>
  fetcher<IIdeasByTopic>({
    path: `/stats/ideas_by_topic`,
    action: 'get',
    queryParams: params,
  });

const useIdeasByTopic = ({ ...queryParameters }: IIdeasByTopicParams) => {
  return useQuery<IIdeasByTopic, CLErrors, IIdeasByTopic, IdeasByTopicKeys>({
    queryKey: ideasByTopicKeys.item(queryParameters),
    queryFn: () => fetchIdeasByTopic(queryParameters),
  });
};

export default useIdeasByTopic;
