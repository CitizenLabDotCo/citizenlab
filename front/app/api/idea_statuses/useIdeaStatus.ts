import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaStatusesKeys from './keys';
import { IIdeaStatus, IdeaStatusesKeys } from './types';

const fetchIdeaStatus = ({ id }: { id: string }) =>
  fetcher<IIdeaStatus>({ path: `/idea_statuses/${id}`, action: 'get' });

const useIdeaStatus = (id: string) => {
  return useQuery<IIdeaStatus, CLErrors, IIdeaStatus, IdeaStatusesKeys>({
    queryKey: ideaStatusesKeys.item({ id }),
    queryFn: () => fetchIdeaStatus({ id }),
  });
};

export default useIdeaStatus;
