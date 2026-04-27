import React, { useState } from 'react';

import { Box, Button, Text, colors } from '@citizenlab/cl2-component-library';
import { roundToNearestMinutes, addDays } from 'date-fns';

import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Modal from 'components/UI/Modal';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import tracks from '../tracks';

import EmailNotificationsSection from './EmailNotificationsSection';
import messages from './messages';
import ModeToggle from './ModeToggle';
import VisibilitySection from './VisibilitySection';
import WhenSection from './WhenSection';

type Mode = 'schedule' | 'now';

interface Props {
  opened: boolean;
  project: IProjectData;
  onClose: () => void;
}

const ScheduleLaunchModal = ({ opened, project, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updateProject, isLoading: isUpdatingProject } =
    useUpdateProject();
  const { mutate: cancelScheduleMutation, isLoading: isCancelling } =
    useUpdateProject();

  const isProjectSchedulingEnabled = useFeatureFlag({
    name: 'project_scheduling',
  });

  const initialDate = project.attributes.scheduled_at
    ? new Date(project.attributes.scheduled_at)
    : addDays(roundToNearestMinutes(new Date(), { nearestTo: 15 }), 1);

  const [mode, setMode] = useState<Mode>(
    isProjectSchedulingEnabled ? 'schedule' : 'now'
  );
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [selectedTime, setSelectedTime] = useState<Date>(initialDate);
  const [sendEmail, setSendEmail] = useState(
    project.attributes.publication_email_enabled
  );

  const buildScheduledAt = () => {
    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(selectedTime.getHours());
    scheduledDate.setMinutes(selectedTime.getMinutes());
    scheduledDate.setSeconds(0);
    return scheduledDate.toISOString();
  };

  const schedulePayload = () => ({
    projectId: project.id,
    admin_publication_attributes: {
      scheduled_at: buildScheduledAt(),
      scheduled_status: 'published' as const,
    },
    publication_email_enabled: sendEmail,
  });

  const publishPayload = () => ({
    projectId: project.id,
    admin_publication_attributes: { publication_status: 'published' as const },
    publication_email_enabled: sendEmail,
  });

  const handleSaveSchedule = () => {
    trackEventByName(tracks.projectScheduled);
    updateProject(schedulePayload(), { onSuccess: onClose });
  };

  const handlePublishNow = () => {
    trackEventByName(tracks.projectPublishedNow);
    updateProject(publishPayload(), { onSuccess: onClose });
  };

  const handleCancelSchedule = () => {
    trackEventByName(tracks.scheduleCancelled);
    cancelScheduleMutation(
      {
        projectId: project.id,
        admin_publication_attributes: {
          scheduled_at: null,
          scheduled_status: null,
        },
      },
      { onSuccess: onClose }
    );
  };

  const primary =
    mode === 'schedule'
      ? {
          label: messages.saveChanges,
          icon: 'check' as const,
          onClick: handleSaveSchedule,
        }
      : {
          label: messages.publishNow,
          icon: 'send' as const,
          onClick: handlePublishNow,
        };

  return (
    <Modal
      opened={opened}
      close={onClose}
      header={
        <Box>
          <Text fontSize="xl" fontWeight="bold" m="0px">
            {formatMessage(messages.scheduleLaunch)}
          </Text>
          <Text color="grey700" fontSize="s" my="4px">
            {formatMessage(messages.reviewSubtitle)}
          </Text>
        </Box>
      }
      footer={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          w="100%"
        >
          {project.attributes.scheduled_at ? (
            <Button
              buttonStyle="text"
              onClick={handleCancelSchedule}
              textColor={colors.black}
              textDecoration="underline"
              textDecorationHover="underline"
              processing={isCancelling}
            >
              {formatMessage(messages.cancelSchedule)}
            </Button>
          ) : (
            <Box />
          )}
          <Button
            buttonStyle="admin-dark"
            icon={primary.icon}
            onClick={primary.onClick}
            processing={isUpdatingProject}
            id="e2e-schedule-launch-submit"
          >
            {formatMessage(primary.label)}
          </Button>
        </Box>
      }
    >
      <Box p="28px">
        <ModeToggle
          mode={mode}
          onChange={setMode}
          schedulingEnabled={isProjectSchedulingEnabled}
        />

        {mode === 'schedule' && (
          <WhenSection
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedTime={selectedTime}
            onTimeChange={setSelectedTime}
          />
        )}

        <VisibilitySection project={project} onClose={onClose} />
        <EmailNotificationsSection
          sendEmailEnabled={sendEmail}
          onSendEmailToggle={setSendEmail}
          onCloseModal={onClose}
        />
      </Box>
    </Modal>
  );
};

export default ScheduleLaunchModal;
