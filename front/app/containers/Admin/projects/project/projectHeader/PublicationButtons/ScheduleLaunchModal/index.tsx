import React, { useState } from 'react';

import { Box, Button, Text, colors } from '@citizenlab/cl2-component-library';
import { roundToNearestMinutes, addDays } from 'date-fns';
import { MessageDescriptor } from 'react-intl';

import useApproveProjectReview from 'api/project_reviews/useApproveProject';
import useProjectReview from 'api/project_reviews/useProjectReview';
import useRequestProjectReview from 'api/project_reviews/useRequestProjectReview';
import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Modal from 'components/UI/Modal';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import tracks from '../tracks';

import EmailNotificationsSection from './EmailNotificationsSection';
import messages from './messages';
import ModeToggle from './ModeToggle';
import VisibilitySection from './VisibilitySection';
import WhenSection from './WhenSection';

type Mode = 'schedule' | 'now';
type PrimaryIcon = 'check' | 'send' | 'unlock' | 'lock';

interface PrimaryAction {
  label: MessageDescriptor;
  icon: PrimaryIcon;
  onClick: () => void;
  disabled?: boolean;
}

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
  const { mutate: approveProjectReview, isLoading: isApproving } =
    useApproveProjectReview();
  const { mutate: requestProjectReview, isLoading: isRequesting } =
    useRequestProjectReview();

  const isProjectReviewEnabled = useFeatureFlag({ name: 'project_review' });
  const isProjectSchedulingEnabled = useFeatureFlag({
    name: 'project_scheduling',
  });
  const { data: projectReview } = useProjectReview(project.id);
  const reviewState = projectReview?.data.attributes.state;
  const canReview = usePermission({ item: project, action: 'review' });

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
  const primaryLoading = isUpdatingProject || isApproving || isRequesting;
  const cancelLoading = isCancelling;

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

  const handleApproveAndSchedule = () => {
    trackEventByName(tracks.projectApprovedAndScheduled);
    approveProjectReview(project.id, {
      onSuccess: () => {
        updateProject(schedulePayload(), { onSuccess: onClose });
      },
    });
  };

  const handleApproveAndPublish = () => {
    trackEventByName(tracks.projectApprovedAndPublished);
    approveProjectReview(project.id, {
      onSuccess: () => {
        updateProject(publishPayload(), { onSuccess: onClose });
      },
    });
  };

  const handleRequestApproval = () => {
    trackEventByName(tracks.reviewRequested);
    if (mode === 'schedule') {
      updateProject(schedulePayload(), {
        onSuccess: () => {
          requestProjectReview(project.id, { onSuccess: onClose });
        },
      });
    } else {
      requestProjectReview(project.id, { onSuccess: onClose });
    }
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

  const primary: PrimaryAction = (() => {
    const saveOrPublish: PrimaryAction =
      mode === 'schedule'
        ? {
            label: messages.saveChanges,
            icon: 'check',
            onClick: handleSaveSchedule,
          }
        : {
            label: messages.publishNow,
            icon: 'send',
            onClick: handlePublishNow,
          };

    const reviewGated = isProjectReviewEnabled && reviewState !== 'approved';
    if (!reviewGated) return saveOrPublish;

    // Admin/folder manager on a pending review — one click approves and
    // saves the schedule or publishes.
    if (reviewState === 'pending' && canReview) {
      return mode === 'schedule'
        ? {
            label: messages.approveAndSchedule,
            icon: 'unlock',
            onClick: handleApproveAndSchedule,
          }
        : {
            label: messages.approveAndPublish,
            icon: 'unlock',
            onClick: handleApproveAndPublish,
          };
    }

    // PM waiting on an existing request — disabled indicator.
    if (reviewState === 'pending') {
      return {
        label: messages.approvalRequested,
        icon: 'lock',
        onClick: () => {},
        disabled: true,
      };
    }

    // No review yet. Admins skip the request flow entirely.
    if (canReview) return saveOrPublish;

    // PM with no review yet — request approval (saves schedule alongside).
    return {
      label: messages.requestApproval,
      icon: 'send',
      onClick: handleRequestApproval,
    };
  })();

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
              processing={cancelLoading}
              disabled={isProjectReviewEnabled && reviewState === 'pending'}
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
            processing={primaryLoading}
            disabled={primary.disabled}
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
