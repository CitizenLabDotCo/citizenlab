import React from 'react';

import {
  Box,
  Title,
  Icon,
  Text,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';
import moment from 'moment';
import styled from 'styled-components';

import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import otherProjectMessages from 'containers/Admin/projects/all/messages';

import NavigationTabs from 'components/admin/NavigationTabs';
import Button from 'components/UI/Button';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';

const StyledTitle = styled(Title)`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
`;

interface Props {
  projectId: string;
}

const ProjectHeader = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  if (!project) return null;
  const isOngoingProject = phases?.data.some(
    (phase) =>
      !phase.attributes.end_at ||
      moment(phase.attributes.end_at).isSameOrAfter(moment().startOf('day'))
  );

  let visibilityMessage: MessageDescriptor = messages.everyone;
  let visibilityIcon: IconNames = 'lock';
  switch (project.data.attributes.visible_to) {
    case 'public':
      visibilityMessage = messages.everyone;
      visibilityIcon = 'unlock';
      break;
    case 'groups':
      visibilityMessage = messages.groups;
      break;
    case 'admins':
      visibilityMessage = messages.adminsOnly;
      break;
  }

  let statusMessage = messages.draft;
  let publicationStatusIcon: IconNames = 'flag';
  let publicationStatusIconColor = colors.orange500;
  switch (project.data.attributes.publication_status) {
    case 'published':
      if (phases?.data.length === 0) {
        publicationStatusIcon = 'check-circle';
        publicationStatusIconColor = colors.green500;
        statusMessage = otherProjectMessages.published;
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

  return (
    <NavigationTabs position="static" paddingLeft="24px">
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        pr="24px"
        py="16px"
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <StyledTitle color="primary" variant="h4" my="0px">
            {localize(project.data.attributes.title_multiloc)}
          </StyledTitle>
          <Box display="flex">
            <Button
              linkTo={`/projects/${project.data.attributes.slug}`}
              buttonStyle="primary-inverse"
              icon="eye"
              size="s"
              padding="4px 8px"
              mr="12px"
            >
              {formatMessage(messages.view)}
            </Button>
            <Button
              linkTo={`/admin/projects/${project.data.id}/settings`}
              buttonStyle="secondary-outlined"
              icon="settings"
              size="s"
              padding="4px 8px"
            >
              {formatMessage(messages.projectSettings)}
            </Button>
          </Box>
        </Box>
        <Box display="flex" gap="8px">
          <Button
            linkTo={`/admin/projects/${project.data.id}/settings`}
            buttonStyle="text"
            size="s"
            padding="0px"
          >
            <Box display="flex" alignItems="center">
              <Icon
                name={publicationStatusIcon}
                fill={publicationStatusIconColor}
                width="16px"
              />
              <Text color="coolGrey600" fontSize="s" m="0px">
                {formatMessage(statusMessage)}
              </Text>
            </Box>
          </Button>
          <Text color="coolGrey600" fontSize="s" my="0px">
            ·
          </Text>
          <Button
            linkTo={`/admin/projects/${project.data.id}/settings/access-rights`}
            buttonStyle="text"
            size="s"
            padding="0px"
          >
            <Box display="flex" alignItems="center">
              <Icon
                name={visibilityIcon}
                fill={colors.coolGrey600}
                width="16px"
              />
              <Text color="coolGrey600" fontSize="s" m="0px">
                {formatMessage(visibilityMessage)}
              </Text>
            </Box>
          </Button>
          <Text color="coolGrey600" fontSize="s" my="0px">
            ·
          </Text>
          <Box display="flex" alignItems="center">
            <Icon name="user" fill={colors.coolGrey600} width="16px" />
            <Text color="coolGrey600" fontSize="s" m="0px">
              {formatMessage(messages.participants, {
                participantsCount: project.data.attributes.participants_count,
              })}
            </Text>
          </Box>
        </Box>
      </Box>
    </NavigationTabs>
  );
};

export default ProjectHeader;
