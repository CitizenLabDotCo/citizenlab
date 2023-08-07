import { Keys } from 'utils/cl-react-query/types';
import eventsAttendancesKeys from './keys';

export type EventAttendanceKeys = Keys<typeof eventsAttendancesKeys>;

export type IAddEventAttendanceProperties = {
  eventId: string;
  attendeeId: string;
};

export interface InputParameters {
  eventId?: string;
}

export interface IEventAttendanceData {
  id: string;
  type: string;
  attributes: {
    file: {
      url: string;
    };
    ordering: string | null;
    name: string;
    size: number;
    created_at: string;
    updated_at: string;
  };
}

export interface IEventAttendance {
  data: IEventAttendanceData;
}

export interface IEventAttendances {
  data: IEventAttendanceData[];
}

export interface IDeleteEventAttendanceProperties {
  eventId: string;
  attendanceId?: string;
}
