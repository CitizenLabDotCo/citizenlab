import { API_PATH } from 'containers/App/constants';
import { IParticipationContextType } from 'typings';
import { requestBlob } from 'utils/requestBlob';
import { saveAs } from 'file-saver';

export async function exportVolunteers(
  participationContextId: string,
  participationContextType: IParticipationContextType
) {
  const blob = await requestBlob(
    `${API_PATH}/${participationContextType}s/${participationContextId}/volunteers/as_xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  saveAs(blob, 'volunteers-export.xlsx');
}
