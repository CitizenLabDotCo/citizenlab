import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IParticipationContextType } from 'typings';
import projectsKeys from 'api/projects/keys';
import { queryClient } from 'utils/cl-react-query/queryClient';

export interface IPollResponse {
  data: {
    type: 'responses_count';
    attributes: { series: { [key: string]: number } };
  };
}

export async function addPollResponse(
  participationContextId: string,
  participationContextType: IParticipationContextType,
  optionIds: string[],
  projectId: string
) {
  const response = await streams.add(
    `${API_PATH}/${participationContextType}s/${participationContextId}/poll_responses`,
    {
      response: {
        response_options_attributes: optionIds.map((optionId) => ({
          option_id: optionId,
        })),
      },
    }
  );

  queryClient.invalidateQueries({
    queryKey: projectsKeys.item({ id: projectId }),
  });

  return response;
}

export function getPollResponses(
  participationContextId: string,
  participationContextType: IParticipationContextType
) {
  const response = streams.get<IPollResponse>({
    apiEndpoint: `${API_PATH}/${participationContextType}s/${participationContextId}/poll_responses/responses_count`,
  });
  return response;
}
