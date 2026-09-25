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

import OptionRow from 'components/UI/OptionRow';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { FIND_OPTIONS, OPEN_OPTIONS } from '../../_shared/visibilityOptions';
import messages from '../../messages';

import { ConfirmableStatus } from './ConfirmStatusChangeModal';
import getPublicationState, { PublicationState } from './publicationState';

const HEADER_MESSAGES: Record<PublicationState, MessageDescriptor> = {
  published: messages.publishStatePublished,
  archived: messages.publishStateArchived,
  scheduled: messages.publishStateScheduled,
  draft: messages.publishStateDraft,
};

interface Props {
  project: IProjectData;
  onSchedule: () => void;
  onConfirmStatusChange: (status: ConfirmableStatus) => void;
  onDone: () => void;
}

const PublishPanel = ({
  project,
  onSchedule,
  onConfirmStatusChange,
  onDone,
}: Props) => {
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

  const isDraftOrScheduled =
    publicationState === 'draft' || publicationState === 'scheduled';

  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: tenantTimezone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: tenantTimezone,
    hour: 'numeric',
    minute: '2-digit',
  };

  const header =
    publicationState === 'scheduled' && scheduled_at
      ? formatMessage(messages.publishStateScheduledAt, {
          date: formatDate(scheduled_at, dateOptions),
          time: formatTime(scheduled_at, timeOptions),
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
      { onSuccess: onDone }
    );

  const count = recipientCount?.data.attributes.count;

  return (
    <Box>
      <Text variant="bo-section" mb="12px">
        {header}
      </Text>

      <Text variant="bo-section" mb="4px">
        {formatMessage(messages.publishWhoCanFind)}
      </Text>
      <Box role="radiogroup" display="flex" flexDirection="column">
        {FIND_OPTIONS.map((option) => {
          const optionListed = option.value === 'listed';

          return (
            <OptionRow
              key={option.value}
              icon={option.icon}
              label={formatMessage(option.label)}
              description={formatMessage(option.description)}
              selected={listed === optionListed}
              onClick={() => setListed(optionListed)}
            />
          );
        })}
      </Box>

      <Text variant="bo-section" mt="12px" mb="4px">
        {formatMessage(messages.publishWhoCanOpen)}
      </Text>
      <Box role="radiogroup" display="flex" flexDirection="column">
        {OPEN_OPTIONS.map((option) => (
          <OptionRow
            key={option.value}
            icon={option.icon}
            label={formatMessage(option.label)}
            description={formatMessage(option.description)}
            selected={visible_to === option.value}
            onClick={() => setVisibleTo(option.value)}
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
        <Text variant="bo-label">
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
        <Text variant="bo-micro" mt="4px">
          {formatMessage(messages.publishEmailRecipients, { count })}
        </Text>
      )}

      <Box
        display="flex"
        justifyContent="flex-end"
        gap="8px"
        mt="16px"
        pt="16px"
        borderTop={`1px solid ${colors.grey200}`}
      >
        {publicationState === 'published' && (
          <>
            <Box flex="1">
              <Button
                buttonStyle="bo-secondary"
                width="100%"
                onClick={() => onConfirmStatusChange('draft')}
              >
                {formatMessage(messages.publishRestoreToDraft)}
              </Button>
            </Box>
            <Box flex="1">
              <Button
                buttonStyle="bo-secondary"
                width="100%"
                onClick={() => onConfirmStatusChange('archived')}
              >
                {formatMessage(messages.publishMoveToArchive)}
              </Button>
            </Box>
          </>
        )}

        {publicationState === 'archived' && (
          <Box flex="1">
            <Button
              buttonStyle="bo-secondary"
              width="100%"
              onClick={() => onConfirmStatusChange('draft')}
            >
              {formatMessage(messages.publishRestoreToDraft)}
            </Button>
          </Box>
        )}

        {isDraftOrScheduled && (
          <>
            <Box flex="1">
              <Button
                buttonStyle="bo-secondary"
                width="100%"
                icon="calendar"
                onClick={onSchedule}
              >
                {formatMessage(messages.publishSchedule)}
              </Button>
            </Box>
            <Box flex="1">
              <Button
                buttonStyle="bo-primary"
                width="100%"
                icon="send"
                onClick={publishNow}
                processing={isPending}
                id="e2e-publish-now"
              >
                {formatMessage(messages.publishNow)}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default PublishPanel;
