import React, { useState, useCallback, useMemo } from 'react';

import {
  Button,
  ButtonProps,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import useAddEventAttendance from 'api/event_attendance/useAddEventAttendance';
import useDeleteEventAttendance from 'api/event_attendance/useDeleteEventAttendance';
import { IEventData } from 'api/events/types';
import useEventsByUserId from 'api/events/useEventsByUserId';
import useAddFollower from 'api/follow_unfollow/useAddFollower';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase, getLatestRelevantPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';
import { IUserData } from 'api/users/types';

import useLocalize from 'hooks/useLocalize';
import useObserveEvent from 'hooks/useObserveEvent';

import { triggerPostActionEvents } from 'containers/App/events';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

import {
  getPermissionsDisabledMessage,
  isFixableByAuthentication,
} from 'utils/actionDescriptors';
import { useIntl } from 'utils/cl-intl';

import ConfirmationModal from './ConfirmationModal';
import messages from './messages';

type EventAttendanceButtonProps = {
  event: IEventData;
};

const EventAttendanceButton = ({ event }: EventAttendanceButtonProps) => {
  const { data: user } = useAuthUser();
  const { mutate: addFollower } = useAddFollower();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false);

  // Attendance API
  const { data: eventsAttending } = useEventsByUserId(user?.data.id);
  const { mutate: addEventAttendance, isLoading: isAddingAttendance } =
    useAddEventAttendance(event.id);
  const { mutate: deleteEventAttendance, isLoading: isRemovingAttendance } =
    useDeleteEventAttendance(event.id, user?.data.id);

  // Attendance
  const userAttendingEventObject = eventsAttending?.data.find(
    (eventAttending) => eventAttending.id === event.id
  );
  const userIsAttending = !!userAttendingEventObject;
  const attendanceId =
    userAttendingEventObject?.relationships.user_attendance.data.id || null;
  const customButtonText = event.attributes.attend_button_multiloc
    ? localize(event.attributes.attend_button_multiloc)
    : null;

  // Permissions
  const { data: project } = useProjectById(event.relationships.project.data.id);
  const { data: phases } = usePhases(project?.data.id);
  const currentPhase = getCurrentPhase(phases?.data);
  const lastCompletedPhase = useMemo(
    () => phases && getLatestRelevantPhase(phases.data),
    [phases]
  );

  const handleEventAttendanceEvent = useCallback(
    (eventEmitterEvent) => {
      const eventId = eventEmitterEvent.eventValue;

      if (eventId === event.id) {
        setConfirmationModalVisible(true);
      }
    },
    [event.id]
  );

  useObserveEvent('eventAttendance', handleEventAttendanceEvent);

  if (!project) return null;

  const { enabled, disabled_reason } =
    project.data.attributes.action_descriptors.attending_event;

  const handleClick = () => {
    if (event.attributes.using_url) {
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
      // If no current phase, we cannot use the phase context and get specific requirements for the phase
      // So we fall back to the latest relevant phase and if that doesn't exist either,
      // We still allow event registration by using the global context and triggering the default flow
      const context = currentPhase
        ? ({
            type: 'phase',
            action: 'attending_event',
            id: currentPhase.id,
          } as const)
        : lastCompletedPhase
        ? ({
            type: 'phase',
            action: 'attending_event',
            id: lastCompletedPhase.id,
          } as const)
        : ({
            type: 'global',
            action: 'visiting',
          } as const);

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

  // Button disabled logic
  const maxRegistrationsReached =
    event.attributes.maximum_attendees !== null &&
    event.attributes.attendees_count >= event.attributes.maximum_attendees;
  const hasProjectDisabledReason =
    !!disabled_reason && !isFixableByAuthentication(disabled_reason);
  const buttonDisabled = maxRegistrationsReached || hasProjectDisabledReason;

  const permissionDisabledMessageDescriptor = getPermissionsDisabledMessage(
    'attending_event',
    disabled_reason
  );
  const disabledMessage = maxRegistrationsReached
    ? formatMessage(messages.maxRegistrationsReached)
    : hasProjectDisabledReason && permissionDisabledMessageDescriptor
    ? formatMessage(permissionDisabledMessageDescriptor)
    : null;

  const buttonProps: ButtonProps = {
    ml: 'auto',
    width: '100%',
    iconSize: '20px',
    onClick: (event) => {
      event.preventDefault();
      handleClick();
    },
    processing: isAddingAttendance || isRemovingAttendance,
    className: 'e2e-event-attendance-button',
  };

  return (
    <>
      {userIsAttending ? (
        <Button
          {...buttonProps}
          icon={event.attributes.using_url ? undefined : 'check'}
        >
          {customButtonText && event.attributes.using_url
            ? customButtonText
            : formatMessage(messages.registered)}
        </Button>
      ) : (
        <Tooltip
          disabled={!buttonDisabled}
          placement="bottom"
          content={disabledMessage}
          useContentWrapper={false}
        >
          <Button
            {...buttonProps}
            icon={event.attributes.using_url ? undefined : 'plus-circle'}
            disabled={buttonDisabled}
          >
            {customButtonText && event.attributes.using_url
              ? customButtonText
              : formatMessage(messages.register)}
          </Button>
        </Tooltip>
      )}
      <ConfirmationModal
        opened={confirmationModalVisible}
        event={event}
        onClose={() => {
          setConfirmationModalVisible(false);
          triggerPostActionEvents({});
        }}
      />
    </>
  );
};

export default EventAttendanceButton;
