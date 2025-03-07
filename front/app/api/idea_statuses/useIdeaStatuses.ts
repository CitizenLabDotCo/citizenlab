import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideaStatusesKeys from './keys';
import {
  IIdeaStatuses,
  IdeaStatusesKeys,
  IdeaStatusesQueryParams,
} from './types';

const fetchIdeaStatuses = (queryParams: IdeaStatusesQueryParams) =>
  fetcher<IIdeaStatuses>({
    path: '/idea_statuses',
    action: 'get',
    queryParams,
  });

const useIdeaStatuses = ({
  enabled = true,
  queryParams,
}: {
  enabled?: boolean;
  queryParams: IdeaStatusesQueryParams;
}) => {
  return useQuery<IIdeaStatuses, CLErrors, IIdeaStatuses, IdeaStatusesKeys>({
    queryKey: ideaStatusesKeys.list(queryParams),
    queryFn: () => fetchIdeaStatuses(queryParams),
    enabled,
  });
};

export default useIdeaStatuses;
