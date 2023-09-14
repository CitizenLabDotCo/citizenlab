import React, { useState } from 'react';

// components
import {
  Box,
  Button,
  Title,
  colors,
  Text,
} from '@citizenlab/cl2-component-library';
import EventSharingButtons from 'containers/EventsShowPage/components/EventSharingButtons';
import Modal from 'components/UI/Modal';
import { EventModalConfetti } from './EventModalConfetti';

// types
import { IEventData } from 'api/events/types';

// api
import useAuthUser from 'api/me/useAuthUser';
import useAddEventAttendance from 'api/event_attendance/useAddEventAttendance';
import useDeleteEventAttendance from 'api/event_attendance/useDeleteEventAttendance';
import useEventsByUserId from 'api/events/useEventsByUserId';

// intl
import messages from './messages';
import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';

// style
import { useTheme } from 'styled-components';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// utils
import { getEventDateString } from 'utils/dateUtils';

type EventAttendanceButtonProps = {
  event: IEventData;
};

const EventAttendanceButton = ({ event }: EventAttendanceButtonProps) => {
  const theme = useTheme();
  const { data: user } = useAuthUser();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false);

  // Attendance API
  const { data: eventsAttending } = useEventsByUserId(user?.data?.id);
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
  const customButtonText = localize(event?.attributes.attend_button_multiloc);

  const handleClick = () => {
    if (event?.attributes.using_url) {
      window.open(event.attributes.using_url);
      return;
    } else {
      if (user) {
        registerAttendance();
      } else {
        // Currently there are no granular permission for event attendance (I.e. requirements endpoint fails).
        // As such, our only option at this point is to trigger the flow without a success action.
        triggerAuthenticationFlow({
          flow: 'signin',
        });
      }
    }
  };

  const registerAttendance = () => {
    if (userIsAttending && attendanceId) {
      deleteEventAttendance({
        attendanceId,
      });
    } else if (user) {
      addEventAttendance({ eventId: event.id, attendeeId: user.data?.id });
      setConfirmationModalVisible(true);
    }
  };

  const getButtonText = () => {
    if (customButtonText) {
      return customButtonText;
    } else if (userIsAttending) {
      return formatMessage(messages.attending);
    }
    return formatMessage(messages.attend);
  };

  const getButtonIcon = () => {
    if (customButtonText || event?.attributes.using_url) {
      return undefined;
    } else if (userIsAttending) {
      return 'check';
    }
    return 'plus-circle';
  };

  const isLoading = isAddingAttendance || isRemovingAttendance;
  const eventDateTime = getEventDateString(event);

  return (
    <>
      <Button
        ml="auto"
        width={'100%'}
        iconPos={userIsAttending ? 'left' : 'right'}
        icon={getButtonIcon()}
        iconSize="20px"
        bgColor={userIsAttending ? colors.success : theme.colors.tenantPrimary}
        onClick={(event) => {
          event.preventDefault();
          handleClick();
        }}
        processing={isLoading}
        id="e2e-event-attendance-button"
      >
        {getButtonText()}
      </Button>
      <Modal
        opened={confirmationModalVisible}
        close={() => {
          setConfirmationModalVisible(false);
        }}
        header={
          <Title mt="4px" mb="0px" variant="h3">
            {user?.data?.attributes?.first_name
              ? formatMessage(messages.seeYouThereName, {
                  userFirstName: user?.data?.attributes?.first_name,
                })
              : formatMessage(messages.seeYouThere)}
          </Title>
        }
        width={'520px'}
      >
        <EventModalConfetti />
        <Box pt="0px" p="36px">
          <Title my="12px" variant="h3" style={{ fontWeight: 600 }}>
            {localize(event?.attributes?.title_multiloc)}
          </Title>
          <Text my="4px" color="coolGrey600" fontSize="m">
            {eventDateTime}
          </Text>
          {event && (
            <Box mt="16px" width="100%" mx="auto">
              <Text
                textAlign="center"
                width="100%"
                mb="8px"
                style={{ fontWeight: 600 }}
              >
                {formatMessage(messages.forwardToFriend)}
              </Text>
              <EventSharingButtons
                event={event}
                hideTitle={true}
                justifyContent="center"
              />
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default EventAttendanceButton;
