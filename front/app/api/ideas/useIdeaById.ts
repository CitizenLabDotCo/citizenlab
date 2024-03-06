import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideasKeys from './keys';
import { IIdea, IdeasKeys } from './types';

export const fetchIdea = ({ id }: { id?: string }) =>
  fetcher<IIdea>({ path: `/ideas/${id}`, action: 'get' });

const useIdeaById = (id?: string, keepPreviousData?: boolean) => {
  return useQuery<IIdea, CLErrors, IIdea, IdeasKeys>({
    queryKey: ideasKeys.item({ id }),
    queryFn: () => fetchIdea({ id }),
    enabled: !!id,
    refetchOnWindowFocus: false,
    keepPreviousData,
  });
};

export default useIdeaById;
