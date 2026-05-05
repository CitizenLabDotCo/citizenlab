import React, { useState, useEffect } from 'react';

import { Box, Button, Text, colors } from '@citizenlab/cl2-component-library';
import { roundToNearestMinutes, addDays } from 'date-fns';
import moment from 'moment-timezone';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
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
  const { data: appConfiguration } = useAppConfiguration();
  const tenantTimezone =
    appConfiguration?.data.attributes.settings.core.timezone;

  const isProjectSchedulingEnabled = useFeatureFlag({
    name: 'project_scheduling',
  });

  const defaultDate = addDays(
    roundToNearestMinutes(new Date(), { nearestTo: 15 }),
    1
  );

  const [mode, setMode] = useState<Mode>(
    isProjectSchedulingEnabled ? 'schedule' : 'now'
  );
  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate);
  const [selectedTime, setSelectedTime] = useState<Date>(defaultDate);
  const [sendEmail, setSendEmail] = useState(
    project.attributes.publication_email_enabled
  );

  // Hydrate from an existing schedule when the modal opens. We do NOT use
  // `new Date(scheduled_at)` because its getters return browser-local time —
  // the pickers (and `WhenSection`'s `tenantTimeNow`) expect a Date whose
  // components match the tenant-TZ wall clock. This mirrors the email
  // scheduling modal's approach.
  useEffect(() => {
    if (opened && project.attributes.scheduled_at && tenantTimezone) {
      const m = moment.tz(project.attributes.scheduled_at, tenantTimezone);
      const scheduled = new Date(
        m.year(),
        m.month(),
        m.date(),
        m.hour(),
        m.minute()
      );
      setSelectedDate(scheduled);
      setSelectedTime(scheduled);
    }
  }, [opened, project.attributes.scheduled_at, tenantTimezone]);

  const buildScheduledAt = () => {
    const dateTimeParts = {
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth(),
      day: selectedDate.getDate(),
      hour: selectedTime.getHours(),
      minute: selectedTime.getMinutes(),
      second: 0,
    };
    const scheduled = tenantTimezone
      ? moment.tz(dateTimeParts, tenantTimezone)
      : moment(dateTimeParts);
    return scheduled.toISOString();
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
