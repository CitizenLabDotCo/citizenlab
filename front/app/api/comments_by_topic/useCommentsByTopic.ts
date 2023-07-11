import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  ICommentsByTopic,
  CommentsByTopicKeys,
  ICommentsByTopicParams,
} from './types';
import commentsByTopicKeys from './keys';

const fetchCommentsByTopic = (params: ICommentsByTopicParams) =>
  fetcher<ICommentsByTopic>({
    path: `/stats/comments_by_topic`,
    action: 'get',
    queryParams: params,
  });

const useCommentsByTopic = ({ ...queryParameters }: ICommentsByTopicParams) => {
  return useQuery<
    ICommentsByTopic,
    CLErrors,
    ICommentsByTopic,
    CommentsByTopicKeys
  >({
    queryKey: commentsByTopicKeys.item(queryParameters),
    queryFn: () => fetchCommentsByTopic(queryParameters),
  });
};

export default useCommentsByTopic;
