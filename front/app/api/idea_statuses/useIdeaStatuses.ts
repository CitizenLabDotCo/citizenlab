import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaStatusesKeys from './keys';
import { IIdeaStatuses, IdeaStatusesKeys } from './types';

const fetchIdeaStatuses = () =>
  fetcher<IIdeaStatuses>({ path: '/idea_statuses', action: 'get' });

const useIdeaStatuses = () => {
  return useQuery<IIdeaStatuses, CLErrors, IIdeaStatuses, IdeaStatusesKeys>({
    queryKey: ideaStatusesKeys.lists(),
    queryFn: fetchIdeaStatuses,
  });
};

export default useIdeaStatuses;
