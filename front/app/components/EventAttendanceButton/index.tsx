import React, { useState, useCallback } from 'react';

import { Button, colors, Tooltip } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useAddEventAttendance from 'api/event_attendance/useAddEventAttendance';
import useDeleteEventAttendance from 'api/event_attendance/useDeleteEventAttendance';
import { IEventData } from 'api/events/types';
import useEventsByUserId from 'api/events/useEventsByUserId';
import useAddFollower from 'api/follow_unfollow/useAddFollower';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';
import { IUserData } from 'api/users/types';

import useLocalize from 'hooks/useLocalize';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

import {
  getPermissionsDisabledMessage,
  isFixableByAuthentication,
} from 'utils/actionDescriptors';
import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import ConfirmationModal from './ConfirmationModal';
import useObserveEvent from 'hooks/useObserveEvent';

type EventAttendanceButtonProps = {
  event: IEventData;
};

const EventAttendanceButton = ({ event }: EventAttendanceButtonProps) => {
  const theme = useTheme();
  const { data: user } = useAuthUser();
  const { mutate: addFollower } = useAddFollower();
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

  // Permissions
  const { data: project } = useProjectById(event.relationships.project.data.id);
  const { data: phases } = usePhases(project?.data.id);
  const currentPhase = getCurrentPhase(phases?.data);

  const handleEventAttendanceEvent = useCallback(() => {
    setConfirmationModalVisible(true);
  }, []);

  useObserveEvent('eventAttendance', handleEventAttendanceEvent);

  // NOTE: If the project does not have a current phase then users cannot register for events
  if (!project || !currentPhase) return null;

  const { enabled, disabled_reason } =
    project.data.attributes.action_descriptors.attending_event;

  const handleClick = () => {
    if (event?.attributes.using_url) {
      window.open(event.attributes.using_url);
      return;
    }

    if (userIsAttending && attendanceId) {
      deleteEventAttendance({ attendanceId });
      return;
    }

    if (user && enabled) {
      registerAttendance(user.data);
      return;
    }

    if (disabled_reason && isFixableByAuthentication(disabled_reason)) {
      const context = {
        type: 'phase',
        action: 'attending_event',
        id: currentPhase?.id,
      } as const;

      const successAction: SuccessAction = {
        name: 'attendEvent',
        params: { event },
      };

      triggerAuthenticationFlow({ context, successAction });
    }
  };

  const registerAttendance = (userData: IUserData) => {
    addEventAttendance({ eventId: event.id, attendeeId: userData.id });
    addFollower({
      followableId: event.relationships.project.data.id,
      followableType: 'projects',
    });
    setConfirmationModalVisible(true);
  };

  const getButtonText = () => {
    if (customButtonText && event?.attributes.using_url) {
      return customButtonText;
    } else if (userIsAttending) {
      return formatMessage(messages.attending);
    }
    return formatMessage(messages.attend);
  };

  const getButtonIcon = () => {
    if (event?.attributes.using_url) {
      return undefined;
    } else if (userIsAttending) {
      return 'check';
    }
    return 'plus-circle';
  };

  const isLoading = isAddingAttendance || isRemovingAttendance;

  // Permissions disabled reasons
  const buttonDisabled =
    !!disabled_reason && !isFixableByAuthentication(disabled_reason);
  const permissionDisabledMessageDescriptor = getPermissionsDisabledMessage(
    'attending_event',
    disabled_reason
  );
  const disabledMessage =
    permissionDisabledMessageDescriptor &&
    formatMessage(permissionDisabledMessageDescriptor);

  return (
    <>
      <Tooltip
        disabled={!disabled_reason}
        placement="bottom"
        content={disabledMessage}
      >
        <Button
          ml="auto"
          width={'100%'}
          iconPos={userIsAttending ? 'left' : 'right'}
          icon={getButtonIcon()}
          iconSize="20px"
          bgColor={
            userIsAttending ? colors.success : theme.colors.tenantPrimary
          }
          disabled={buttonDisabled}
          onClick={(event) => {
            event.preventDefault();
            handleClick();
          }}
          processing={isLoading}
          id="e2e-event-attendance-button"
        >
          {getButtonText()}
        </Button>
      </Tooltip>
      <ConfirmationModal
        opened={confirmationModalVisible}
        event={event}
        onClose={() => setConfirmationModalVisible(false)}
      />
    </>
  );
};

export default EventAttendanceButton;
