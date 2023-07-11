import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  IReactionsByTopic,
  ReactionsByTopicKeys,
  IReactionsByTopicParams,
} from './types';
import reactionsByTopicKeys from './keys';

const fetchReactionsByTopic = (params: IReactionsByTopicParams) =>
  fetcher<IReactionsByTopic>({
    path: `/stats/reactions_by_topic`,
    action: 'get',
    queryParams: params,
  });

const useReactionsByTopic = ({
  ...queryParameters
}: IReactionsByTopicParams) => {
  return useQuery<
    IReactionsByTopic,
    CLErrors,
    IReactionsByTopic,
    ReactionsByTopicKeys
  >({
    queryKey: reactionsByTopicKeys.item(queryParameters),
    queryFn: () => fetchReactionsByTopic(queryParameters),
  });
};

export default useReactionsByTopic;
