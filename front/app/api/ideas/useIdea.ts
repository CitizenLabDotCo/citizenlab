import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideasKeys from './keys';
import { IIdea, IdeasKeys } from './types';

const fetchIdeaStatus = (id: string) =>
  fetcher<IIdea>({ path: `/idea_statuses/${id}`, action: 'get' });

const useIdeaStatus = (id: string) => {
  return useQuery<IIdea, CLErrors, IIdea, IdeasKeys>({
    queryKey: ideasKeys.item(id),
    queryFn: () => fetchIdeaStatus(id),
  });
};

export default useIdeaStatus;
