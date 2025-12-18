import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IIdeaExposure } from './types';

interface AddIdeaExposureParams {
  ideaId: string;
}

const addIdeaExposure = async ({ ideaId }: AddIdeaExposureParams) =>
  fetcher<IIdeaExposure>({
    path: `/ideas/${ideaId}/exposures`,
    action: 'post',
    body: null,
  });

const useAddIdeaExposure = () => {
  return useMutation<IIdeaExposure, CLErrors, AddIdeaExposureParams>({
    mutationFn: addIdeaExposure,
  });
};

export default useAddIdeaExposure;
