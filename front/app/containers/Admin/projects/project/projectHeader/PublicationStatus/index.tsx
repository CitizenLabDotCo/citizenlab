import React, { useState } from 'react';

import {
  Box,
  Button,
  Dropdown,
  Icon,
  IconNames,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import moment from 'moment';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import {
  IProject,
  PublicationStatus as PublicationStatusType,
} from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import PublicationStatusPicker from './PublicationStatusPicker';

const getStatusMessageAndIcon = ({
  project,
  isOngoingProject,
  phases,
}: {
  project: IProject;
  isOngoingProject: boolean;
  phases: IPhaseData[];
}) => {
  let statusMessage = messages.draft;

  let publicationStatusIcon: IconNames = 'flag';
  let publicationStatusIconColor = colors.orange500;

  switch (project.data.attributes.publication_status) {
    case 'published':
      if (phases.length === 0) {
        publicationStatusIcon = 'check-circle';
        publicationStatusIconColor = colors.green500;
        statusMessage = messages.publishedStatus;
      } else {
        publicationStatusIcon = isOngoingProject ? 'check-circle' : 'bullseye';
        publicationStatusIconColor = isOngoingProject
          ? colors.green500
          : colors.coolGrey600;
        statusMessage = isOngoingProject
          ? messages.publishedActive
          : messages.publishedFinished;
      }
      break;
    case 'draft':
      publicationStatusIcon = 'flag';
      publicationStatusIconColor = colors.orange500;
      statusMessage = messages.draft;
      break;
    case 'archived':
      publicationStatusIcon = 'inbox';
      publicationStatusIconColor = colors.coolGrey600;
      statusMessage = messages.archived;
      break;
  }
  return {
    statusMessage,
    publicationStatusIcon,
    publicationStatusIconColor,
  };
};

const PublicationStatus = ({ project }: { project: IProject }) => {
  const { mutate: updateProject, isLoading } = useUpdateProject();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { formatMessage } = useIntl();
  const { data: phases } = usePhases(project.data.id);

  const isOngoingProject = phases?.data.some(
    (phase) =>
      !phase.attributes.end_at ||
      moment(phase.attributes.end_at).isSameOrAfter(moment().startOf('day'))
  );

  const { statusMessage, publicationStatusIcon, publicationStatusIconColor } =
    getStatusMessageAndIcon({
      project,
      isOngoingProject: !!isOngoingProject,
      phases: phases?.data || [],
    });

  const handleStatusChange = (value: PublicationStatusType) => {
    updateProject({
      projectId: project.data.id,
      admin_publication_attributes: {
        publication_status: value,
      },
    });
    setIsPickerOpen(false);
  };

  if (!project.data.attributes.first_published_at) {
    return (
      <Box
        display="flex"
        alignItems="center"
        gap="8px"
        as="span"
        padding="4px 8px"
        border={`1px solid ${colors.borderDark}`}
        borderRadius={stylingConsts.borderRadius}
      >
        <Icon
          name={publicationStatusIcon}
          fill={publicationStatusIconColor}
          width="20px"
        />
        <Text color="coolGrey600" m="0px">
          {formatMessage(statusMessage)}
        </Text>
      </Box>
    );
  }

  return (
    <Box position="relative">
      <Button
        buttonStyle="secondary-outlined"
        padding="4px 8px"
        size="s"
        icon={isPickerOpen ? 'chevron-up' : 'chevron-down'}
        iconPos="right"
        onClick={() => setIsPickerOpen(!isPickerOpen)}
        processing={isLoading}
        id="e2e-admin-edit-publication-status"
      >
        <Box display="flex" alignItems="center" gap="8px" as="span">
          <Icon
            name={publicationStatusIcon}
            fill={publicationStatusIconColor}
            width="20px"
          />
          <Text color="coolGrey600" m="0px">
            {formatMessage(statusMessage)}
          </Text>
        </Box>
      </Button>
      <Dropdown
        opened={isPickerOpen}
        onClickOutside={() => setIsPickerOpen(false)}
        content={
          <>
            <PublicationStatusPicker
              publicationStatus={project.data.attributes.publication_status}
              handleStatusChange={handleStatusChange}
            />
          </>
        }
        top="36px"
        right="0px"
        zIndex="10000"
        maxHeight="400px"
        width="300px"
      />
    </Box>
  );
};

export default PublicationStatus;
