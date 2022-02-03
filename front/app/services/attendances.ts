import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { ILinks, IRelationship } from 'typings';
import { apiEndpoint as eventsApiEndpoint } from 'services/events';

const apiEndpoint = `${API_PATH}/attendances`;

export interface IAttendance {
  id: string;
  type: 'attendance';
  attributes: {
    created_at: string;
    updated_at: string;
  };
  relationships: {
    event: {
      data: IRelationship;
    };
    user: {
      data: IRelationship;
    };
  };
  links: ILinks;
}

interface IAttendanceResponse {
  data: IAttendance;
}

interface IAttendancesResponse {
  data: IAttendance[];
}

export interface IAttendancesQueryParams {
  'page[number]'?: number;
  'page[size]'?: number;
}

export function attendancesStream(
  eventId: string,
  queryParameters: IAttendancesQueryParams | null = null
) {
  return streams.get<IAttendancesResponse>({
    apiEndpoint: `${eventsApiEndpoint}/${eventId}/attendances`,
    queryParameters,
  });
}

export function attendanceStream(attendanceId: string) {
  return streams.get<IAttendanceResponse>({
    apiEndpoint: `${apiEndpoint}/${attendanceId}`,
  });
}

export function attendEvent(eventId: string) {
  return streams.add<IAttendanceResponse>(
    `${eventsApiEndpoint}/${eventId}/attendances`,
    null
  );
}

export function unAttendEvent(attendanceId: string) {
  return streams.delete(`${apiEndpoint}/${attendanceId}`, attendanceId);
}
