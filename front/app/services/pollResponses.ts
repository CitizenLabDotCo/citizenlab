import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { requestBlob } from 'utils/request';
import { saveAs } from 'file-saver';
import { IParticipationContextType } from 'typings';
import projectsKeys from 'api/projects/keys';
import { queryClient } from 'utils/cl-react-query/queryClient';

export interface IPollResponseAttributes {
  series: { [key: string]: number };
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

export async function exportPollResponses(
  participationContextId: string,
  participationContextType: IParticipationContextType,
  fileName: string
) {
  const blob = await requestBlob(
    `${API_PATH}/${participationContextType}s/${participationContextId}/poll_responses/as_xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  saveAs(blob, fileName);
}
export function getPollResponses(
  participationContextId: string,
  participationContextType: IParticipationContextType
) {
  const response = streams.get<IPollResponseAttributes>({
    apiEndpoint: `${API_PATH}/${participationContextType}s/${participationContextId}/poll_responses/responses_count`,
  });
  return response;
}
