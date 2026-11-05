import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IIdeaExposure } from './types';

interface AddIdeaExposureParams {
  ideaId: string;
  phaseId: string;
}

const addIdeaExposure = async ({ ideaId, phaseId }: AddIdeaExposureParams) =>
  fetcher<IIdeaExposure>({
    path: `/ideas/${ideaId}/exposures`,
    action: 'post',
    body: { phase_id: phaseId },
  });

const useAddIdeaExposure = () => {
  return useMutation<IIdeaExposure, CLErrors, AddIdeaExposureParams>({
    mutationFn: addIdeaExposure,
  });
};

export default useAddIdeaExposure;
