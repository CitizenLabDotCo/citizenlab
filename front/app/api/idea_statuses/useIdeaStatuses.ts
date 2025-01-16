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
  queryParams = {},
}: {
  enabled?: boolean;
  queryParams?: IdeaStatusesQueryParams;
}) => {
  const prescreeningIdeationEnabled = useFeatureFlag({
    name: 'prescreening_ideation',
  });
  const prescreeningProposalsEnabled = useFeatureFlag({
    name: 'prescreening',
  });
  const excludeScreeningStatusDefaults: {
    [key in IdeaStatusParticipationMethod]: boolean;
  } = {
    ideation: !prescreeningIdeationEnabled,
    proposals: !prescreeningProposalsEnabled,
  };
  const excludeScreeningStatus =
    typeof queryParams.exclude_screening_status === 'boolean'
      ? queryParams.exclude_screening_status
      : excludeScreeningStatusDefaults[queryParams.participation_method];
  const finalQueryParams = {
    ...queryParams,
    exclude_screening_status: excludeScreeningStatus,
  };

  return useQuery<IIdeaStatuses, CLErrors, IIdeaStatuses, IdeaStatusesKeys>({
    queryKey: ideaStatusesKeys.list(finalQueryParams),
    queryFn: () => fetchIdeaStatuses(finalQueryParams),
    enabled,
  });
};

export default useIdeaStatuses;
