import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import opinionGroupsKeys from './keys';
import {
  IOpinionGroups,
  OpinionGroupsKeys,
  OpinionGroupsParameters,
} from './types';

export const fetchOpinionGroups = ({
  phaseId,
  parameters,
}: {
  phaseId?: string;
  parameters: OpinionGroupsParameters;
}): Promise<IOpinionGroups> =>
  fetcher<IOpinionGroups>({
    path: `/phases/${phaseId}/opinion_groups`,
    action: 'get',
    queryParams: parameters,
  });

// The analysis can take several seconds for large phases and only changes
// when reactions change, so the result is kept for a while.
const useOpinionGroups = (
  phaseId: string | undefined,
  parameters: OpinionGroupsParameters
) =>
  useQuery<IOpinionGroups, CLErrors, IOpinionGroups, OpinionGroupsKeys>({
    queryKey: opinionGroupsKeys.item({ phaseId, parameters }),
    queryFn: () => fetchOpinionGroups({ phaseId, parameters }),
    enabled: !!phaseId,
    staleTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

export default useOpinionGroups;
