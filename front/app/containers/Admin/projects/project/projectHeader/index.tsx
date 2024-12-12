import React from 'react';

import {
  Box,
  Title,
  Icon,
  Text,
  colors,
  IconNames,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import NavigationTabs from 'components/admin/NavigationTabs';
import Button from 'components/UI/Button';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';
import PublicationStatus from './PublicationStatus';
import ShareLink from './ShareLink';

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
  const shareLinkEnabled = useFeatureFlag({ name: 'project_preview_link' });

  const { data: project } = useProjectById(projectId);

  const { formatMessage } = useIntl();
  const localize = useLocalize();

  if (!project) return null;

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
          <Box display="flex" gap="12px">
            <Button
              linkTo={`/projects/${project.data.attributes.slug}`}
              buttonStyle="secondary-outlined"
              icon="eye"
              size="s"
              padding="4px 8px"
              id="e2e-view-project"
            />
            <PublicationStatus project={project} />
            <Button
              linkTo={`/admin/projects/${project.data.id}/settings`}
              buttonStyle="secondary-outlined"
              icon="settings"
              size="s"
              padding="4px 8px"
            >
              {formatMessage(messages.projectSettings)}
            </Button>
            {shareLinkEnabled && (
              <ShareLink
                projectId={project.data.id}
                projectSlug={project.data.attributes.slug}
                token={project.data.attributes.preview_token}
              />
            )}
          </Box>
        </Box>
        <Box display="flex" gap="8px">
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
          <Tooltip
            theme="dark"
            maxWidth={280}
            placement="bottom"
            content={
              <Box p="8px">
                <FormattedMessage {...messages.participantsInfoTitle} />
                <ul
                  style={{
                    margin: '0',
                    marginBottom: '8px',
                    listStyleType: 'disc',
                  }}
                >
                  <li>
                    <FormattedMessage {...messages.users} />
                  </li>
                  <li>
                    <FormattedMessage {...messages.attendees} />
                  </li>
                </ul>

                <FormattedMessage
                  {...messages.participantsExclusionTitle}
                  values={{ b: (chunks) => <b>{chunks}</b> }}
                />
                <ul
                  style={{
                    margin: '0',
                    marginBottom: '8px',
                    listStyleType: 'disc',
                  }}
                >
                  <li>
                    <FormattedMessage {...messages.followers} />
                  </li>
                  <li>
                    <FormattedMessage {...messages.embeddedMethods} />
                  </li>
                  <li>
                    <FormattedMessage {...messages.offlineVoters} />
                  </li>
                </ul>

                <FormattedMessage {...messages.note} />
              </Box>
            }
          >
            <Box display="flex" alignItems="center">
              <Icon name="user" fill={colors.coolGrey600} width="16px" />
              <Text color="coolGrey600" fontSize="s" m="0px">
                {formatMessage(messages.participants, {
                  participantsCount: project.data.attributes.participants_count,
                })}
              </Text>
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </NavigationTabs>
  );
};

export default ProjectHeader;
