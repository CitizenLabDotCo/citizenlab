import React from 'react';
import moment from 'moment';
import Button from 'components/UI/Button';
import {
  Box,
  Title,
  Icon,
  Text,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';
import NavigationTabs from 'components/admin/NavigationTabs';
import { GetPhasesChildProps } from 'resources/GetPhases';
import { GetProjectChildProps } from 'resources/GetProject';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import messages from './messages';
import useLocalize from 'hooks/useLocalize';

interface Props {
  phases: GetPhasesChildProps;
  project: GetProjectChildProps;
}

export const ProjectHeader = ({ project, phases }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const isOngoingProject = phases?.some((phase) => {
    if (!phase.attributes.end_at) {
      return true;
    }
    return moment(phase.attributes.end_at).isAfter(moment());
  });

  if (!project) return null;

  let visibilityMessage: MessageDescriptor = messages.everyone;
  switch (project.attributes.visible_to) {
    case 'public':
      visibilityMessage = messages.everyone;
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
  let publicationStatusIconColor = colors.orange;
  switch (project.attributes.publication_status) {
    case 'published':
      publicationStatusIcon = isOngoingProject ? 'check-circle' : 'bullseye';
      publicationStatusIconColor = isOngoingProject
        ? colors.green500
        : colors.coolGrey600;
      statusMessage = isOngoingProject
        ? messages.publishedActive
        : messages.publishedFinished;
      break;
    case 'draft':
      publicationStatusIcon = 'flag';
      publicationStatusIconColor = colors.orange;
      statusMessage = messages.draft;
      break;
    case 'archived':
      publicationStatusIcon = 'inbox';
      publicationStatusIconColor = colors.coolGrey600;
      statusMessage = messages.archived;
      break;
  }

  return (
    <NavigationTabs position="static">
      <Box
        display="flex"
        height="58px"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        pr="24px"
      >
        <Box display="flex" flexDirection="column">
          <Title color="primary" variant="h4" my="0px">
            {localize(project.attributes.title_multiloc)}
          </Title>
          <Box display="flex" gap="8px">
            <Box display="flex" alignItems="center">
              <Icon
                name={publicationStatusIcon}
                fill={publicationStatusIconColor}
                width="16px"
              />
              <Text color="coolGrey600" fontSize="s" my="0px">
                {formatMessage(statusMessage)}
              </Text>
            </Box>
            <Box display="flex" alignItems="center">
              <Icon name="lock" fill={colors.coolGrey600} width="16px" />
              <Text color="coolGrey600" fontSize="s" my="0px">
                {formatMessage(visibilityMessage)}
              </Text>
            </Box>
            <Box display="flex" alignItems="center">
              <Icon name="user" fill={colors.coolGrey600} width="16px" />
              <Text color="coolGrey600" fontSize="s" my="0px">
                {formatMessage(messages.participants, {
                  participantsCount: project.attributes.participants_count,
                })}
              </Text>
            </Box>
          </Box>
        </Box>
        <Box display="flex">
          <Button
            linkTo={`/projects/${project.attributes.slug}`}
            buttonStyle="primary-inverse"
            icon="eye"
            size="s"
            padding="4px 8px"
            mr="12px"
          >
            {formatMessage(messages.view)}
          </Button>
          <Button
            linkTo={`/admin/projects/${project.id}/settings`}
            buttonStyle="secondary"
            icon="settings"
            size="s"
            padding="4px 8px"
          >
            {formatMessage(messages.settings)}
          </Button>
        </Box>
      </Box>
    </NavigationTabs>
  );
};
