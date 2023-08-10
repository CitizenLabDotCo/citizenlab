import React from 'react';

// components
import { Button, colors } from '@citizenlab/cl2-component-library';

// types
import { IEventData } from 'api/events/types';

// api
import useAuthUser from 'api/me/useAuthUser';
import useAddEventAttendance from 'api/event_attendance/useAddEventAttendance';
import useDeleteEventAttendance from 'api/event_attendance/useDeleteEventAttendance';

// intl
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// style
import { useTheme } from 'styled-components';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import useEventsByUserId from 'api/events/useEventsByUserId';

type EventAttendanceButtonProps = {
  event: IEventData;
};

const EventAttendanceButton = ({ event }: EventAttendanceButtonProps) => {
  const theme = useTheme();
  const { data: user } = useAuthUser();
  const { formatMessage } = useIntl();

  // Attendance API
  const { data: eventsAttending } = useEventsByUserId({
    attendeeId: user?.data?.id,
  });
  const { mutate: addEventAttendance, isLoading: isAddingAttendance } =
    useAddEventAttendance(event.id);
  const { mutate: deleteEventAttendance, isLoading: isRemovingAttendance } =
    useDeleteEventAttendance(event.id, user?.data?.id);

  // Attendance

  const userAttendingEventObject = eventsAttending?.data?.find(
    (eventAttending) => eventAttending.id === event.id
  );

  const userIsAttending = !!userAttendingEventObject;

  const attendanceId =
    userAttendingEventObject?.relationships.user_attendance.data.id || null;

  const handleClick = () => {
    if (user) {
      registerAttendance();
    } else {
      // Currently there are no granular permission for event attendance (I.e. requirements endpoint fails).
      // As such, our only option at this point is to trigger the flow without a success action.
      triggerAuthenticationFlow({
        flow: 'signin',
      });
    }
  };

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
        handleClick();
      }}
      processing={isLoading}
      id="e2e-event-attendance-button"
    >
      {userIsAttending
        ? formatMessage(messages.attending)
        : formatMessage(messages.attend)}
    </Button>
  );
};

export default EventAttendanceButton;
