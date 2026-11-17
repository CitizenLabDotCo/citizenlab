import { ILinks } from 'typings';

import { IUserData } from 'api/users/types';

import { Keys } from 'utils/cl-react-query/types';

import eventsAttendancesKeys from './keys';

export type EventAttendanceKeys = Keys<typeof eventsAttendancesKeys>;

export type IAddEventAttendanceProperties = {
  eventId: string;
  attendeeId: string;
};

export type AttendanceSort = 'created_at' | '-created_at';

export interface InputParameters {
  eventId?: string;
  search?: string;
  sort?: AttendanceSort;
  registered?: 'this_week' | 'earlier';
  'page[number]'?: number;
  'page[size]'?: number;
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

export type EventRegistrant = Pick<IUserData, 'id' | 'type'> & {
  attributes: Pick<
    IUserData['attributes'],
    'first_name' | 'last_name' | 'email'
  >;
};

export interface IEventAttendances {
  data: IEventAttendanceData[];
  included: EventRegistrant[];
  links: ILinks;
  meta: { total: number; unfiltered_total: number };
}

export interface IDeleteEventAttendanceProperties {
  attendanceId: string;
}
