// This code is a prototype for input authoring. Clean-up will follow after the prototype phase.
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import authoringAssistanceKeys from './keys';
import { IAuthoringAssistanceResponse, IAuthoringAssistance } from './types';

const addAuthoringAssistance = async ({
  id,
  custom_free_prompt,
  regenerate,
}: IAuthoringAssistance) =>
  fetcher<IAuthoringAssistanceResponse>({
    path: `/ideas/${id}/authoring_assistance_responses?regenerate=${regenerate}`,
    action: 'post',
    body: { authoring_assistance_response: { custom_free_prompt } },
  });

const useAddAuthoringAssistance = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IAuthoringAssistanceResponse,
    CLErrors,
    IAuthoringAssistance
  >({
    mutationFn: addAuthoringAssistance,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authoringAssistanceKeys.lists(),
      });
    },
  });
};

export default useAddAuthoringAssistance;
