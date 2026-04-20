import React, { useState } from 'react';

import { Box, Button, Text, colors } from '@citizenlab/cl2-component-library';
import { roundToNearestMinutes, addDays } from 'date-fns';

import useApproveProjectReview from 'api/project_reviews/useApproveProject';
import useProjectReview from 'api/project_reviews/useProjectReview';
import useRequestProjectReview from 'api/project_reviews/useRequestProjectReview';
import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

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
  const { mutate: approveProjectReview, isLoading: isApproving } =
    useApproveProjectReview();
  const { mutate: requestProjectReview, isLoading: isRequesting } =
    useRequestProjectReview();

  const isProjectReviewEnabled = useFeatureFlag({ name: 'project_review' });
  const { data: projectReview } = useProjectReview(project.id);
  const reviewState = projectReview?.data.attributes.state;
  const canReview = usePermission({ item: project, action: 'review' });

  const defaultDate = addDays(
    roundToNearestMinutes(new Date(), { nearestTo: 15 }),
    1
  );

  const [mode, setMode] = useState<Mode>('schedule');
  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate);
  const [selectedTime, setSelectedTime] = useState<Date>(defaultDate);
  const [sendEmail, setSendEmail] = useState(
    project.attributes.publication_email_enabled
  );

  const isLoading = isUpdatingProject || isApproving || isRequesting;

  const buildScheduledAt = () => {
    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(selectedTime.getHours());
    scheduledDate.setMinutes(selectedTime.getMinutes());
    scheduledDate.setSeconds(0);
    return scheduledDate.toISOString();
  };

  const saveSchedule = (onSuccess: () => void) => {
    updateProject(
      {
        projectId: project.id,
        admin_publication_attributes: {
          scheduled_at: buildScheduledAt(),
          scheduled_status: 'published',
        },
        publication_email_enabled: sendEmail,
      },
      { onSuccess }
    );
  };

  const publishNow = (onSuccess: () => void) => {
    updateProject(
      {
        projectId: project.id,
        publication_email_enabled: sendEmail,
        admin_publication_attributes: { publication_status: 'published' },
      },
      { onSuccess }
    );
  };

  const handleSaveSchedule = () => saveSchedule(onClose);
  const handlePublishNow = () => publishNow(onClose);

  const handleApproveAndSchedule = () => {
    approveProjectReview(project.id, {
      onSuccess: () => saveSchedule(onClose),
    });
  };

  const handleApproveAndPublish = () => {
    approveProjectReview(project.id, {
      onSuccess: () => publishNow(onClose),
    });
  };

  const handleRequestApproval = () => {
    const request = () =>
      requestProjectReview(project.id, { onSuccess: onClose });
    if (mode === 'schedule') {
      saveSchedule(request);
    } else {
      request();
    }
  };

  // Determine the primary action button for the footer.
  // When project_review is off, behavior is unchanged.
  // When on, the action depends on review state + whether the user can review.
  const reviewGated = isProjectReviewEnabled && reviewState !== 'approved';

  let primaryLabel =
    mode === 'schedule' ? messages.saveChanges : messages.publishNow;
  let primaryIcon: 'check' | 'send' | 'unlock' | 'lock' =
    mode === 'schedule' ? 'check' : 'send';
  let primaryOnClick: () => void =
    mode === 'schedule' ? handleSaveSchedule : handlePublishNow;
  let primaryDisabled = false;

  if (reviewGated) {
    if (reviewState === 'pending' && canReview) {
      primaryLabel =
        mode === 'schedule'
          ? messages.approveAndSchedule
          : messages.approveAndPublish;
      primaryIcon = 'unlock';
      primaryOnClick =
        mode === 'schedule'
          ? handleApproveAndSchedule
          : handleApproveAndPublish;
    } else if (reviewState === 'pending') {
      // PM waiting on admin approval — request already sent, so the button
      // is a disabled "Approval requested" indicator.
      primaryLabel = messages.approvalRequested;
      primaryIcon = 'lock';
      primaryDisabled = true;
    } else if (!canReview) {
      // No review yet, user is a PM — they need to request approval.
      primaryLabel = messages.requestApproval;
      primaryIcon = 'send';
      primaryOnClick = handleRequestApproval;
    }
    // If no review yet and user canReview: fall through to defaults (direct
    // save/publish). Admins implicitly skip the review step.
  }

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
          {mode === 'schedule' ? (
            <>
              <Button
                buttonStyle="text"
                onClick={onClose}
                textColor={colors.black}
              >
                {formatMessage(messages.cancelSchedule)}
              </Button>
              <Button
                buttonStyle="admin-dark"
                icon={primaryIcon}
                onClick={primaryOnClick}
                processing={isLoading}
                disabled={primaryDisabled}
              >
                {formatMessage(primaryLabel)}
              </Button>
            </>
          ) : (
            <Box w="100%" display="flex" justifyContent="flex-end">
              <Button
                buttonStyle="admin-dark"
                icon={primaryIcon}
                onClick={primaryOnClick}
                processing={isLoading}
                disabled={primaryDisabled}
              >
                {formatMessage(primaryLabel)}
              </Button>
            </Box>
          )}
        </Box>
      }
    >
      <Box p="28px">
        <ModeToggle mode={mode} onChange={setMode} />

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
