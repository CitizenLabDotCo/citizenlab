import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import causeKeys from './keys';
import { IInternalComment, InternalCommentsKeys } from './types';

const fetchInternalComment = ({ id }: { id: string }) =>
  fetcher<IInternalComment>({ path: `/comments/${id}`, action: 'get' });

const useInternalComment = (id: string) => {
  return useQuery<
    IInternalComment,
    CLErrors,
    IInternalComment,
    InternalCommentsKeys
  >({
    queryKey: causeKeys.item({ id }),
    queryFn: () => fetchInternalComment({ id }),
  });
};

export default useInternalComment;
