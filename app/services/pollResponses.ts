import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { requestBlob } from 'utils/request';
import { saveAs } from 'file-saver';

export async function addPollResponse(participationContextId: string, participationContextType: 'projects' | 'phases', optionIds: string[], projectId?: string) {
  const response = await streams.add(`${API_PATH}/${participationContextType}/${participationContextId}/poll_responses`, {
    response: {
      response_options_attributes: optionIds.map(optionId => ({ option_id: optionId }))
    }
  });
  projectId && streams.fetchAllWith({ dataId: [projectId] });
  return response;
}

export async function exportPollResponses(participationContextId: string, participationContextType: 'projects' | 'phases') {
  const blob = await requestBlob(
    `${API_PATH}/${participationContextType}/${participationContextId}/poll_responses/as_xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  saveAs(blob, 'survey-results-export.xlsx');
}
