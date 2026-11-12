import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IPulseCheck } from './types';
import { PULSE_CHECK_MUTATION_META } from './useShowNextPulseCheck';

const dismissPulseCheck = (id: string) =>
  fetcher<IPulseCheck>({
    path: `/pulse_checks/${id}/dismiss`,
    action: 'patch',
    body: {},
  });

const useDismissPulseCheck = () => {
  return useMutation<IPulseCheck, CLErrors, string>({
    mutationFn: dismissPulseCheck,
    meta: PULSE_CHECK_MUTATION_META,
  });
};

export default useDismissPulseCheck;
