import { IEventData } from 'api/events/types';
import { IUserData } from 'api/users/types';

import { addEventAttendance } from 'api/event_attendance/useAddEventAttendance';
import { addFollower } from 'api/follow_unfollow/useAddFollower';
import eventEmitter from 'utils/eventEmitter';
import { queryClient } from 'utils/cl-react-query/queryClient';

import projectsKeys from 'api/projects/keys';

import eventsKeys from 'api/events/keys';

export interface AttendEventParams {
  event: IEventData;
}

export const attendEvent = ({ event }: AttendEventParams) => {
  return async (authUser: IUserData) => {
    const projectId = event.relationships.project.data.id;
    const attendeeId = authUser.id;

    await Promise.all([
      addEventAttendance({ eventId: event.id, attendeeId }),
      addFollower({
        followableId: projectId,
        followableType: 'projects',
      }),
    ]);

    queryClient.invalidateQueries({
      queryKey: projectsKeys.item({ id: projectId }),
    });

    queryClient.invalidateQueries({
      queryKey: eventsKeys.list({ attendeeId }),
    });

    eventEmitter.emit('eventAttendance');
  };
};
