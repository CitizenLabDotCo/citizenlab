import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import phasesMiniKeys from './keys';
import { PhasesMiniKeys, PhaseMini } from './types';

const fetchPhaseMini = (id?: string) =>
  fetcher<PhaseMini>({
    path: `/phases/${id}/mini`,
    action: 'get',
  });

const usePhaseMini = (id?: string) => {
  return useQuery<PhaseMini, CLErrors, PhaseMini, PhasesMiniKeys>({
    queryKey: phasesMiniKeys.item({ id }),
    queryFn: () => fetchPhaseMini(id),
    enabled: !!id,
  });
};

export default usePhaseMini;
