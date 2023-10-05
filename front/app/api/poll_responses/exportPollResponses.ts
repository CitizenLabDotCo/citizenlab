import { API_PATH } from 'containers/App/constants';
import saveAs from 'file-saver';
import { IParticipationContextType } from 'typings';
import { requestBlob } from 'utils/requestBlob';

async function exportPollResponses(
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

export default exportPollResponses;
