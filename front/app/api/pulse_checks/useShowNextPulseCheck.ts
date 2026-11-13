import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IPulseCheck, IShowNextPulseCheck } from './types';

export const PULSE_CHECK_MUTATION_META = { pulseCheck: true };

const showNextPulseCheck = ({
  trigger,
  uiVersion,
  adminArea,
  projectId,
}: IShowNextPulseCheck) =>
  fetcher<IPulseCheck | null>({
    path: '/pulse_checks/show_next',
    action: 'post',
    body: {
      trigger,
      ui_version: uiVersion,
      admin_area: adminArea,
      project_id: projectId,
    },
  });

const useShowNextPulseCheck = () => {
  return useMutation<IPulseCheck | null, CLErrors, IShowNextPulseCheck>({
    mutationFn: showNextPulseCheck,
    meta: PULSE_CHECK_MUTATION_META,
  });
};

export default useShowNextPulseCheck;
