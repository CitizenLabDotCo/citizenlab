import React from 'react';

import {
  Box,
  Button,
  Divider,
  Text,
  Toggle,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useProjectPublicationRecipientCount from 'api/project_publication_recipient_count/useProjectPublicationRecipientCount';
import { IProjectData, Visibility } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import OptionRow from './OptionRow';
import getPublicationState, { PublicationState } from './publicationState';

const FIND_OPTIONS = [
  {
    listed: true,
    icon: 'eye',
    label: messages.publishFindPublic,
    description: messages.publishFindPublicDescription,
  },
  {
    listed: false,
    icon: 'eye-off',
    label: messages.publishFindPrivate,
    description: messages.publishFindPrivateDescription,
  },
] as const;

const OPEN_OPTIONS = [
  {
    visibleTo: 'public',
    icon: 'users',
    label: messages.publishOpenEveryone,
    description: messages.publishOpenEveryoneDescription,
  },
  {
    visibleTo: 'admins',
    icon: 'lock',
    label: messages.publishOpenAdmins,
    description: messages.publishOpenAdminsDescription,
  },
  {
    visibleTo: 'groups',
    icon: 'lock',
    label: messages.publishOpenGroups,
    description: messages.publishOpenGroupsDescription,
  },
] as const;

const HEADER_MESSAGES: Record<PublicationState, MessageDescriptor> = {
  published: messages.publishStatePublished,
  archived: messages.publishStateArchived,
  scheduled: messages.publishStateScheduled,
  draft: messages.publishStateDraft,
};

interface Props {
  project: IProjectData;
  onSchedule: () => void;
  onPublished: () => void;
}

const PublishPanel = ({ project, onSchedule, onPublished }: Props) => {
  const { formatMessage, formatDate, formatTime } = useIntl();
  const { mutate: updateProject, isPending } = useUpdateProject();
  const { data: recipientCount } = useProjectPublicationRecipientCount(
    project.id
  );
  const { data: appConfiguration } = useAppConfiguration();
  const tenantTimezone =
    appConfiguration?.data.attributes.settings.core.timezone;

  const {
    listed,
    visible_to,
    scheduled_at,
    publication_email_enabled,
    global_publication_email_enabled,
  } = project.attributes;

  const publicationState = getPublicationState(project);

  const header =
    publicationState === 'scheduled' && scheduled_at
      ? formatMessage(messages.publishStateScheduledAt, {
          date: formatDate(scheduled_at, {
            timeZone: tenantTimezone,
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          time: formatTime(scheduled_at, {
            timeZone: tenantTimezone,
            hour: 'numeric',
            minute: '2-digit',
          }),
        })
      : formatMessage(HEADER_MESSAGES[publicationState]);

  const emailToggleDisabled = !global_publication_email_enabled || !listed;

  const setListed = (nextListed: boolean) =>
    updateProject({ projectId: project.id, listed: nextListed });

  const setVisibleTo = (nextVisibleTo: Visibility) =>
    updateProject({ projectId: project.id, visible_to: nextVisibleTo });

  const setSendEmail = (enabled: boolean) =>
    updateProject({
      projectId: project.id,
      publication_email_enabled: enabled,
    });

  const publishNow = () =>
    updateProject(
      {
        projectId: project.id,
        admin_publication_attributes: { publication_status: 'published' },
        publication_email_enabled,
      },
      { onSuccess: onPublished }
    );

  const count = recipientCount?.data.attributes.count;

  return (
    <Box>
      <Text m="0 0 12px 0" fontSize="m" color="teal500">
        {header}
      </Text>

      <Text m="0 0 4px 0" fontSize="xs" color="textSecondary">
        {formatMessage(messages.publishWhoCanFind)}
      </Text>
      <Box role="radiogroup" display="flex" flexDirection="column">
        {FIND_OPTIONS.map((option) => (
          <OptionRow
            key={String(option.listed)}
            icon={option.icon}
            label={option.label}
            description={option.description}
            selected={listed === option.listed}
            onClick={() => setListed(option.listed)}
          />
        ))}
      </Box>

      <Text m="12px 0 4px 0" fontSize="xs" color="textSecondary">
        {formatMessage(messages.publishWhoCanOpen)}
      </Text>
      <Box role="radiogroup" display="flex" flexDirection="column">
        {OPEN_OPTIONS.map((option) => (
          <OptionRow
            key={option.visibleTo}
            icon={option.icon}
            label={option.label}
            description={option.description}
            selected={visible_to === option.visibleTo}
            onClick={() => setVisibleTo(option.visibleTo)}
          />
        ))}
      </Box>

      <Divider />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap="12px"
      >
        <Text m="0" fontSize="s" color="textPrimary">
          {formatMessage(messages.publishSendEmail)}
        </Text>
        <Tooltip
          content={formatMessage(messages.publishEmailUnavailable)}
          disabled={!emailToggleDisabled}
        >
          <Toggle
            checked={publication_email_enabled && !emailToggleDisabled}
            disabled={emailToggleDisabled}
            onChange={() => setSendEmail(!publication_email_enabled)}
          />
        </Tooltip>
      </Box>
      {count !== undefined && (
        <Text m="4px 0 0 0" fontSize="xs" color="textSecondary">
          {formatMessage(messages.publishEmailRecipients, { count })}
        </Text>
      )}

      {publicationState !== 'published' && (
        <Box
          display="flex"
          justifyContent="flex-end"
          gap="8px"
          mt="16px"
          pt="16px"
          borderTop={`1px solid ${colors.grey200}`}
        >
          <Button
            buttonStyle="secondary-outlined"
            size="s"
            icon="calendar"
            onClick={onSchedule}
          >
            {formatMessage(messages.publishSchedule)}
          </Button>
          <Button
            buttonStyle="admin-dark"
            size="s"
            icon="send"
            onClick={publishNow}
            processing={isPending}
            id="e2e-publish-now"
          >
            {formatMessage(messages.publishNow)}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PublishPanel;
