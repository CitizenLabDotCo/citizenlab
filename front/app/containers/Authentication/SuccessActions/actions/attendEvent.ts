import { IEventData } from 'api/events/types';
import { IUserData } from 'api/users/types';

import { addEventAttendance } from 'api/event_attendance/useAddEventAttendance';
import { addFollower } from 'api/follow_unfollow/useAddFollower';

export interface AttendEventParams {
  event: IEventData;
}

export const attendEvent = ({ event }: AttendEventParams) => {
  return async (authUser: IUserData) => {
    addEventAttendance({ eventId: event.id, attendeeId: authUser.id });
    addFollower({
      followableId: event.relationships.project.data.id,
      followableType: 'projects',
    });
  };
};
