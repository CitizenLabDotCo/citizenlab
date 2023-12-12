import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import pollResponsesKeys from './keys';
import { IPollResponses, IPollResponseParameters } from './types';
import projectsKeys from 'api/projects/keys';

type AddPollResponse = {
  optionIds: string[];
  projectId?: string;
} & IPollResponseParameters;

export const addPollResponse = async ({
  phaseId,
  optionIds,
  projectId: _id,
}: AddPollResponse) =>
  fetcher<IPollResponses>({
    path: `/phases/${phaseId}/poll_responses`,
    action: 'post',
    body: {
      response: {
        response_options_attributes: optionIds.map((optionId) => ({
          option_id: optionId,
        })),
      },
    },
  });

const useAddPollResponse = () => {
  const queryClient = useQueryClient();
  return useMutation<IPollResponses, CLErrors, AddPollResponse>({
    mutationFn: addPollResponse,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: pollResponsesKeys.item({
          phaseId: variables.phaseId,
        }),
      });

      queryClient.invalidateQueries({
        queryKey: projectsKeys.item({ id: variables.projectId }),
      });
    },
  });
};

export default useAddPollResponse;
