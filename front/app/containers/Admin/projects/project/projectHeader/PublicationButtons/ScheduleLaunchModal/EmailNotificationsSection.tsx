import React from 'react';

import {
  Box,
  Text,
  Toggle,
  IconTooltip,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useProjectById from 'api/projects/useProjectById';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import useProjectPublicationRecipientCount from 'api/project_publication_recipient_count/useProjectPublicationRecipientCount';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  sendEmailEnabled: boolean;
  onSendEmailToggle: (enabled: boolean) => void;
  onCloseModal: () => void;
}

const EmailNotificationsSection = ({
  sendEmailEnabled,
  onSendEmailToggle,
  onCloseModal,
}: Props) => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams() as { projectId: string };
  const { data: project } = useProjectById(projectId);
  const { data: recipientCount } =
    useProjectPublicationRecipientCount(projectId);

  const count = recipientCount?.data.attributes.count;
  const isUnlisted = !project?.data.attributes.listed;
  const emailDisabledGlobally =
    !project?.data.attributes.publication_email_available;

  const toggleDisabled = emailDisabledGlobally || isUnlisted;
  const toggleTooltip = isUnlisted
    ? formatMessage(messages.makeProjectVisibleTooltip)
    : emailDisabledGlobally
    ? formatMessage(messages.emailNotificationsDisabledGlobally)
    : undefined;

  return (
    <Box mb="24px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text fontWeight="bold" mb="0px">
          {formatMessage(messages.sendProjectPublishedEmail)}
        </Text>
        <Tooltip content={toggleTooltip} disabled={!toggleTooltip}>
          <Toggle
            checked={sendEmailEnabled && !toggleDisabled}
            onChange={() => onSendEmailToggle(!sendEmailEnabled)}
            disabled={toggleDisabled}
          />
        </Tooltip>
      </Box>
      {isUnlisted ? (
        <Box display="flex" alignItems="center" gap="4px" mt="4px">
          <Text color="textSecondary" fontSize="s" m="0px">
            <FormattedMessage
              {...messages.projectUnlisted}
              values={{
                underlinedUnlisted: <u>{formatMessage(messages.unlisted)}</u>,
              }}
            />
          </Text>
        </Box>
      ) : (
        count !== undefined && (
          <Box display="flex" alignItems="center" gap="4px" mt="4px">
            <Text color="textSecondary" fontSize="s" m="0px">
              {formatMessage(messages.approximateRecipients, {
                count,
              })}
            </Text>
            <IconTooltip content={formatMessage(messages.recipientsTooltip)} />
            <Text color="textSecondary" fontSize="s" m="0px">
              {'·'}
            </Text>
            <ButtonWithLink
              buttonStyle="text"
              linkTo={`/admin/projects/${projectId}/general`}
              onClick={onCloseModal}
              padding="0"
              fontSize="14px"
              textDecoration="underline"
            >
              {formatMessage(messages.editRecipients)}
            </ButtonWithLink>
          </Box>
        )
      )}
    </Box>
  );
};

export default EmailNotificationsSection;
