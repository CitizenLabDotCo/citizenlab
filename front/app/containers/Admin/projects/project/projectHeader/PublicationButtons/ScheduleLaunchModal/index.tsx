import React, { useState } from 'react';

import { Box, Button, Text, colors } from '@citizenlab/cl2-component-library';
import { roundToNearestMinutes, addDays } from 'date-fns';

import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

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
  onPublishNow: () => void;
}

const ScheduleLaunchModal = ({
  opened,
  project,
  onClose,
  onPublishNow,
}: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updateProject, isLoading } = useUpdateProject();

  const defaultDate = addDays(
    roundToNearestMinutes(new Date(), { nearestTo: 15 }),
    1
  );

  const [mode, setMode] = useState<Mode>('schedule');
  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate);
  const [selectedTime, setSelectedTime] = useState<Date>(defaultDate);

  const handleSaveSchedule = () => {
    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(selectedTime.getHours());
    scheduledDate.setMinutes(selectedTime.getMinutes());
    scheduledDate.setSeconds(0);

    updateProject(
      {
        projectId: project.id,
        scheduled_at: scheduledDate.toISOString(),
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
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
                icon="check"
                onClick={handleSaveSchedule}
                processing={isLoading}
              >
                {formatMessage(messages.saveChanges)}
              </Button>
            </>
          ) : (
            <Box w="100%" display="flex" justifyContent="flex-end">
              <Button
                buttonStyle="admin-dark"
                icon="send"
                onClick={onPublishNow}
                processing={isLoading}
              >
                {formatMessage(messages.publishNow)}
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

        <VisibilitySection project={project} />
        <EmailNotificationsSection projectId={project.id} />
      </Box>
    </Modal>
  );
};

export default ScheduleLaunchModal;
