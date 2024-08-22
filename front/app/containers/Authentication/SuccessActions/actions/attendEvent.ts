import { addEventAttendance } from 'api/event_attendance/useAddEventAttendance';
import eventsKeys from 'api/events/keys';
import { IEventData } from 'api/events/types';
import { addFollower } from 'api/follow_unfollow/useAddFollower';
import projectsKeys from 'api/projects/keys';
import { IUserData } from 'api/users/types';

import { queryClient } from 'utils/cl-react-query/queryClient';
import eventEmitter from 'utils/eventEmitter';

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

    eventEmitter.emit('eventAttendance', event.id);
  };
};
