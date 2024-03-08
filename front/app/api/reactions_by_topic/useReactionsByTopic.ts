import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import reactionsByTopicKeys from './keys';
import {
  IReactionsByTopic,
  ReactionsByTopicKeys,
  IReactionsByTopicParams,
} from './types';

const fetchReactionsByTopic = (params: IReactionsByTopicParams) =>
  fetcher<IReactionsByTopic>({
    path: `/stats/reactions_by_topic`,
    action: 'get',
    queryParams: params,
  });

const useReactionsByTopic = ({
  enabled,
  ...queryParameters
}: IReactionsByTopicParams & { enabled: boolean }) => {
  return useQuery<
    IReactionsByTopic,
    CLErrors,
    IReactionsByTopic,
    ReactionsByTopicKeys
  >({
    queryKey: reactionsByTopicKeys.item(queryParameters),
    queryFn: () => fetchReactionsByTopic(queryParameters),
    enabled,
  });
};

export default useReactionsByTopic;
