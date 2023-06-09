import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import experimentsKeys from './keys';
import { IExperiment, IExperimentAdd } from './types';

const addExperiment = async (requestBody: IExperimentAdd) =>
  fetcher<IExperiment>({
    path: '/experiments',
    action: 'post',
    body: { experiment: requestBody },
  });

const useAddExperiment = () => {
  const queryClient = useQueryClient();
  return useMutation<IExperiment, CLErrors, IExperimentAdd>({
    mutationFn: addExperiment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experimentsKeys.all() });
    },
  });
};

export default useAddExperiment;
