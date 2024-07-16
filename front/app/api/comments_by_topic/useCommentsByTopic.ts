import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import commentsByTopicKeys from './keys';
import {
  ICommentsByTopic,
  CommentsByTopicKeys,
  ICommentsByTopicParams,
} from './types';

const fetchCommentsByTopic = (params: ICommentsByTopicParams) =>
  fetcher<ICommentsByTopic>({
    path: `/stats/comments_by_topic`,
    action: 'get',
    queryParams: params,
  });

const useCommentsByTopic = ({
  enabled,
  ...queryParameters
}: ICommentsByTopicParams & { enabled: boolean }) => {
  return useQuery<
    ICommentsByTopic,
    CLErrors,
    ICommentsByTopic,
    CommentsByTopicKeys
  >({
    queryKey: commentsByTopicKeys.item(queryParameters),
    queryFn: () => fetchCommentsByTopic(queryParameters),
    enabled,
  });
};

export default useCommentsByTopic;
