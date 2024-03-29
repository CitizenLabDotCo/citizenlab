import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import phasesKeys from './keys';
import { IPhases, PhasesKeys } from './types';

const fetchPhases = async ({
  projectId,
}: {
  projectId: string | undefined;
}) => {
  return fetcher<IPhases>({
    path: `/projects/${projectId}/phases`,
    action: 'get',
  });
};

const usePhases = (projectId?: string) => {
  return useQuery<IPhases, CLErrors, IPhases, PhasesKeys>({
    queryKey: phasesKeys.list({ projectId }),
    queryFn: () => fetchPhases({ projectId }),
    enabled: !!projectId,
  });
};

export default usePhases;
