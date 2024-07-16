import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideasByTopicKeys from './keys';
import { IIdeasByTopic, IdeasByTopicKeys, IIdeasByTopicParams } from './types';

const fetchIdeasByTopic = (params: IIdeasByTopicParams) =>
  fetcher<IIdeasByTopic>({
    path: `/stats/ideas_by_topic`,
    action: 'get',
    queryParams: params,
  });

const useIdeasByTopic = ({
  enabled,
  ...queryParameters
}: IIdeasByTopicParams & { enabled: boolean }) => {
  return useQuery<IIdeasByTopic, CLErrors, IIdeasByTopic, IdeasByTopicKeys>({
    queryKey: ideasByTopicKeys.item(queryParameters),
    queryFn: () => fetchIdeasByTopic(queryParameters),
    enabled,
  });
};

export default useIdeasByTopic;
