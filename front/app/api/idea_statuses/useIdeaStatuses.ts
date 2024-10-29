import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideaStatusesKeys from './keys';
import {
  IIdeaStatuses,
  IdeaStatusesKeys,
  IdeaStatusesQueryParams,
} from './types';

const fetchIdeaStatuses = ({ participation_method }: IdeaStatusesQueryParams) =>
  fetcher<IIdeaStatuses>({
    path: '/idea_statuses',
    action: 'get',
    queryParams: { participation_method },
  });

const useIdeaStatuses = ({
  enabled = true,
  participation_method,
}: {
  enabled?: boolean;
  participation_method?: IdeaStatusesQueryParams['participation_method'];
}) => {
  return useQuery<IIdeaStatuses, CLErrors, IIdeaStatuses, IdeaStatusesKeys>({
    queryKey: ideaStatusesKeys.list({ participation_method }),
    queryFn: () => fetchIdeaStatuses({ participation_method }),
    enabled,
  });
};

export default useIdeaStatuses;
