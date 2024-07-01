import { IEventData } from 'api/events/types';
import { IUserData } from 'api/users/types';

import { addEventAttendance } from 'api/event_attendance/useAddEventAttendance';
import { addFollower } from 'api/follow_unfollow/useAddFollower';
import eventEmitter from 'utils/eventEmitter';

export interface AttendEventParams {
  event: IEventData;
}

export const attendEvent = ({ event }: AttendEventParams) => {
  return async (authUser: IUserData) => {
    await Promise.all([
      addEventAttendance({ eventId: event.id, attendeeId: authUser.id }),
      addFollower({
        followableId: event.relationships.project.data.id,
        followableType: 'projects',
      }),
    ]);

    eventEmitter.emit('eventAttendance');
  };
};
