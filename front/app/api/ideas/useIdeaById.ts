import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideasKeys from './keys';
import { IIdea, IdeasKeys } from './types';

const fetchIdea = (id?: string) =>
  fetcher<IIdea>({ path: `/ideas/${id}`, action: 'get' });

const useIdeaById = (id?: string) => {
  return useQuery<IIdea, CLErrors, IIdea, IdeasKeys>({
    queryKey: ideasKeys.itemId(id),
    queryFn: () => fetchIdea(id),
    enabled: !!id,
  });
};

export default useIdeaById;
