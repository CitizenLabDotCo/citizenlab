import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IPulseCheck, IPulseCheckAnswer } from './types';
import { PULSE_CHECK_MUTATION_META } from './useShowNextPulseCheck';

const answerPulseCheck = ({ id, ...answer }: IPulseCheckAnswer) =>
  fetcher<IPulseCheck>({
    path: `/pulse_checks/${id}/answer`,
    action: 'patch',
    body: { pulse_check: answer },
  });

const useAnswerPulseCheck = () => {
  return useMutation<IPulseCheck, CLErrors, IPulseCheckAnswer>({
    mutationFn: answerPulseCheck,
    meta: PULSE_CHECK_MUTATION_META,
  });
};

export default useAnswerPulseCheck;
