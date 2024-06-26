// import addEventAttendance from 'api/event_attendance/useAddEventAttendance';
import deleteEventAttendance from 'api/event_attendance/useDeleteEventAttendance';
import { addFollower } from 'api/follow_unfollow/useAddFollower';

export interface AttendEventParams {
  projectId: string;
  eventId: string;
  userId?: string;
  attendanceId?: string | null;
}

export const attendEvent =
  ({ projectId, eventId, userId, attendanceId }: AttendEventParams) =>
  async () => {
    if (attendanceId) {
      console.log('attendanceId', attendanceId);
      deleteEventAttendance(attendanceId);
    } else if (userId) {
      // await addEventAttendance({ eventId: eventId, attendeeId: userId });
      console.log('eventId', eventId);
      await addFollower({
        followableId: projectId,
        followableType: 'projects',
      });
      // setConfirmationModalVisible(true);
    }
  };
