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
    created_at: string;
  };
  relationships: {
    attendee: {
      data: {
        id: string;
      };
    };
  };
}

export interface IEventAttendance {
  data: IEventAttendanceData;
}

export interface IEventAttendances {
  data: IEventAttendanceData[];
}

export interface IDeleteEventAttendanceProperties {
  attendanceId: string;
}
