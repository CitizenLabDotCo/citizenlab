import React from 'react';

// components
import { Button, colors } from '@citizenlab/cl2-component-library';

// types
import { IEventData } from 'api/events/types';

// api
import useAuthUser from 'api/me/useAuthUser';
import useEventAttendances from 'api/event_attendance/useEventAttendances';
import useAddEventAttendance from 'api/event_attendance/useAddEventAttendance';
import useDeleteEventAttendance from 'api/event_attendance/useDeleteEventAttendance';

// intl
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// style
import { useTheme } from 'styled-components';

type EventAttendanceButtonProps = {
  event: IEventData;
};

const EventAttendanceButton = ({ event }: EventAttendanceButtonProps) => {
  const theme = useTheme();
  const { data: user } = useAuthUser();
  const { formatMessage } = useIntl();

  // Attendance API
  const { data: eventAttendances } = useEventAttendances(event.id);
  const { mutate: addEventAttendance, isLoading: isAddingAttendance } =
    useAddEventAttendance(event.id);
  const { mutate: deleteEventAttendance, isLoading: isRemovingAttendance } =
    useDeleteEventAttendance(event.id);

  // Attendance
  const eventAttendanceUserIds = eventAttendances?.data?.map(
    (eventAttendance) => eventAttendance.relationships.attendee.data.id
  );
  const userIsAttending =
    user && eventAttendanceUserIds?.includes(user.data.id);
  const attendanceId = eventAttendances?.data?.find(
    (eventAttendance) =>
      eventAttendance.relationships.attendee.data.id === user?.data?.id
  )?.id;

  const registerAttendance = () => {
    if (userIsAttending && attendanceId) {
      deleteEventAttendance({
        attendanceId,
      });
    } else if (user) {
      addEventAttendance({ eventId: event.id, attendeeId: user.data?.id });
    }
  };

  const isLoading = isAddingAttendance || isRemovingAttendance;

  return (
    <Button
      ml="auto"
      width={'100%'}
      iconPos={userIsAttending ? 'left' : 'right'}
      icon={userIsAttending ? 'check' : 'plus-circle'}
      iconSize="20px"
      bgColor={userIsAttending ? colors.success : theme.colors.tenantPrimary}
      onClick={(event) => {
        event.preventDefault();
        registerAttendance();
      }}
      processing={isLoading}
    >
      {userIsAttending
        ? formatMessage(messages.attending)
        : formatMessage(messages.attend)}
    </Button>
  );
};

export default EventAttendanceButton;
