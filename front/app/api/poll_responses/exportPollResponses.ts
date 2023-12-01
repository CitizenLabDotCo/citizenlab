import { API_PATH } from 'containers/App/constants';
import saveAs from 'file-saver';
import { requestBlob } from 'utils/requestBlob';

async function exportPollResponses(phaseId: string, fileName: string) {
  const blob = await requestBlob(
    `${API_PATH}/phases/${phaseId}/poll_responses/as_xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  saveAs(blob, fileName);
}

export default exportPollResponses;
