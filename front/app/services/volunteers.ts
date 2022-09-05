import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc, ImageSizes, IParticipationContextType } from 'typings';
import { requestBlob } from 'utils/request';
import { saveAs } from 'file-saver';

export interface IVolunteerData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    image: ImageSizes;
    volunteers_count: number;
  };
}

export interface IVolunteer {
  data: IVolunteerData;
}

export async function addVolunteer(causeId: string) {
  const stream = await streams.add<IVolunteer>(
    `${API_PATH}/causes/${causeId}/volunteers`,
    null
  );
  await streams.fetchAllWith({ dataId: [causeId] });
  return stream;
}

export async function deleteVolunteer(causeId: string, volunteerId: string) {
  const stream = await streams.delete(
    `${API_PATH}/causes/${causeId}/volunteers`,
    volunteerId
  );
  await streams.fetchAllWith({ dataId: [causeId] });
  return stream;
}

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
