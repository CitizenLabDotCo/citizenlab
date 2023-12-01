import { API_PATH } from 'containers/App/constants';
import { requestBlob } from 'utils/requestBlob';
import { saveAs } from 'file-saver';

export async function exportVolunteers(phaseId: string) {
  const blob = await requestBlob(
    `${API_PATH}/phases/${phaseId}/volunteers/as_xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  saveAs(blob, 'volunteers-export.xlsx');
}
