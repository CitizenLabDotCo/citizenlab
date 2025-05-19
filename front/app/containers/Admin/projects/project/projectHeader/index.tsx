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

import useProjectReview from 'api/project_reviews/useProjectReview';
import useProjectById from 'api/projects/useProjectById';
import useUserById from 'api/users/useUserById';

import useLocalize from 'hooks/useLocalize';

import NavigationTabs from 'components/admin/NavigationTabs';
import { createHighlighterLink } from 'components/Highlighter';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { getFullName } from 'utils/textUtils';

import LinkToFolderSettings from './LinkToFolderSettings';
import messages from './messages';
import ProjectDescriptionPreview from './ProjectDescriptionPreview';
import PublicationStatus from './PublicationStatus';
import PublicationButtons from './PublicationButtons';
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

export const fragmentId = 'title-multiloc';
const ProjectHeader = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: projectReview } = useProjectReview(projectId);
  const { data: approver } = useUserById(
    projectReview?.data.relationships.reviewer?.data?.id
  );

  const { formatMessage } = useIntl();
  const localize = useLocalize();

  if (!project) return null;

  const folderId = project.data.attributes.folder_id;
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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap="16px"
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            mb="8px"
            maxWidth="600px"
          >
            {typeof folderId === 'string' && (
              <Box mb="4px">
                <LinkToFolderSettings
                  folderId={folderId}
                  projectId={projectId}
                />
              </Box>
            )}
            <Link
              to={createHighlighterLink(
                `/admin/projects/${project.data.id}/settings#${fragmentId}`
              )}
              data-cy="e2e-project-title-preview-link-to-settings"
            >
              <StyledTitle color="primary" variant="h4" mt="0" mb="4px">
                {localize(project.data.attributes.title_multiloc)}
              </StyledTitle>
            </Link>
            <ProjectDescriptionPreview project={project} />
          </Box>
          <Box
            display="flex"
            gap="8px"
            className="intercom-projects-project-header-buttons"
          >
            <ButtonWithLink
              linkTo={`/projects/${project.data.attributes.slug}`}
              buttonStyle="secondary-outlined"
              icon="eye"
              size="s"
              padding="4px 8px"
              id="e2e-view-project"
              className="intercom-product-tour-project-view-link"
            />
            <PublicationStatus
              className="intercom-product-tour-project-publication-status-dropdown"
              project={project}
            />
            <ShareLink
              projectId={project.data.id}
              projectSlug={project.data.attributes.slug}
              token={project.data.attributes.preview_token}
              className="intercom-product-tour-project-sharing-dropdown"
            />
            <ButtonWithLink
              linkTo={`/admin/projects/${project.data.id}/settings`}
              buttonStyle="admin-dark"
              size="s"
              padding="4px 8px"
              icon="settings"
              iconSize="18px"
              className="intercom-product-tour-project-settings-link"
            >
              {formatMessage(messages.settings)}
            </ButtonWithLink>

            <PublicationButtons project={project.data} />
          </Box>
        </Box>
        <Box display="flex" gap="8px">
          <ButtonWithLink
            linkTo={`/admin/projects/${project.data.id}/settings/access-rights`}
            buttonStyle="text"
            size="s"
            padding="0px"
          >
            <Box display="flex" alignItems="center" gap="4px">
              <Icon
                name={visibilityIcon}
                fill={colors.coolGrey600}
                width="16px"
              />
              <Text color="coolGrey600" fontSize="s" m="0px">
                {formatMessage(visibilityMessage)}
              </Text>
            </Box>
          </ButtonWithLink>
          <Text color="coolGrey600" fontSize="s" mb="0px" mt="2px">
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
            <Box display="flex" alignItems="center" gap="4px">
              <Icon name="user" fill={colors.coolGrey600} width="16px" />
              <Text color="coolGrey600" fontSize="s" m="0px">
                {formatMessage(messages.participants, {
                  participantsCount: project.data.attributes.participants_count,
                })}
              </Text>
            </Box>
          </Tooltip>
          {approver && (
            <>
              <Text color="coolGrey600" fontSize="s" mb="0px" mt="2px">
                ·
              </Text>
              <Box display="flex" alignItems="center" gap="4px">
                <Icon name="check-circle" fill={colors.green500} width="16px" />
                <Text color="coolGrey600" fontSize="s" m="0px">
                  {formatMessage(messages.approvedBy, {
                    name: getFullName(approver.data),
                  })}
                </Text>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </NavigationTabs>
  );
};

export default ProjectHeader;
