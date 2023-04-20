import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import causeKeys from './keys';
import { IComment, CommentsKeys } from './types';

const fetchComment = ({ id }: { id: string }) =>
  fetcher<IComment>({ path: `/comments/${id}`, action: 'get' });

const useComment = (id: string) => {
  return useQuery<IComment, CLErrors, IComment, CommentsKeys>({
    queryKey: causeKeys.item({ id }),
    queryFn: () => fetchComment({ id }),
  });
};

export default useComment;
