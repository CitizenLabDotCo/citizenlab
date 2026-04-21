import React, { useState } from 'react';

import {
  Box,
  Button,
  Radio,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import {
  IProjectData,
  PublicationStatus as PublicationStatusType,
} from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import Modal from 'components/UI/Modal';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import tracks from './tracks';

interface StatusOption {
  value: PublicationStatusType;
  title: MessageDescriptor;
  bullets: MessageDescriptor[];
}

const OPTIONS: StatusOption[] = [
  {
    value: 'published',
    title: messages.changeStatusPublishedTitle,
    bullets: [messages.changeStatusPublishedBullet1],
  },
  {
    value: 'draft',
    title: messages.changeStatusDraftTitle,
    bullets: [
      messages.changeStatusDraftBullet1,
      messages.changeStatusDraftBullet2,
    ],
  },
  {
    value: 'archived',
    title: messages.changeStatusArchivedTitle,
    bullets: [
      messages.changeStatusArchivedBullet1,
      messages.changeStatusArchivedBullet2,
      messages.changeStatusArchivedBullet3,
    ],
  },
];

interface Props {
  opened: boolean;
  project: IProjectData;
  onClose: () => void;
}

const ChangeStatusModal = ({ opened, project, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updateProject, isLoading } = useUpdateProject();

  const currentStatus = project.attributes.publication_status;
  const [selectedStatus, setSelectedStatus] =
    useState<PublicationStatusType>(currentStatus);

  const handleSave = () => {
    if (selectedStatus === currentStatus) {
      onClose();
      return;
    }
    trackEventByName(tracks.projectStatusChanged, {
      from: currentStatus,
      to: selectedStatus,
    });
    updateProject(
      {
        projectId: project.id,
        admin_publication_attributes: { publication_status: selectedStatus },
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal
      opened={opened}
      close={onClose}
      header={
        <Text fontSize="xl" fontWeight="bold" m="0px">
          {formatMessage(messages.changeProjectStatus)}
        </Text>
      }
      footer={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          w="100%"
        >
          <Button
            buttonStyle="text"
            onClick={onClose}
            textColor={colors.black}
            textDecoration="underline"
            textDecorationHover="underline"
          >
            {formatMessage(messages.close)}
          </Button>
          <Button
            buttonStyle="admin-dark"
            icon="check"
            onClick={handleSave}
            processing={isLoading}
          >
            {formatMessage(messages.saveChanges)}
          </Button>
        </Box>
      }
    >
      <Box p="28px" display="flex" flexDirection="column" gap="12px">
        {OPTIONS.map((option) => (
          <Box
            key={option.value}
            border={`1px solid ${colors.grey300}`}
            borderRadius="8px"
            p="16px"
          >
            <Radio
              onChange={setSelectedStatus}
              currentValue={selectedStatus}
              value={option.value}
              name="projectstatus"
              id={`projectstatus-${option.value}`}
              className={`e2e-projectstatus-${option.value}`}
              label={
                <Box display="flex" flexDirection="column" ml="4px">
                  <Text m="0px" fontWeight="bold">
                    {formatMessage(option.title)}
                  </Text>
                  <Box
                    as="ul"
                    m="4px 0 0 0"
                    pl="20px"
                    display="flex"
                    flexDirection="column"
                    gap="2px"
                  >
                    {option.bullets.map((bullet, i) => (
                      <Box as="li" key={i}>
                        <Text m="0px" color="textSecondary" fontSize="s">
                          {formatMessage(bullet)}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              }
            />
          </Box>
        ))}
      </Box>
    </Modal>
  );
};

export default ChangeStatusModal;
