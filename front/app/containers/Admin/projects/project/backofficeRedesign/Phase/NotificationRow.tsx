import React, { useState } from 'react';

import {
  Box,
  Button,
  Text,
  Toggle,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { CampaignData } from 'containers/Admin/messaging/AutomatedEmails/types';
import useCampaignRow from 'containers/Admin/messaging/AutomatedEmails/useCampaignRow';
import messagingMessages from 'containers/Admin/messaging/messages';
import { useRegisterPageSaver } from 'containers/Admin/projects/_shared/PageSaveContext';

import UpsellTooltip from 'components/UpsellTooltip';

import { useIntl } from 'utils/cl-intl';

import NotificationDetail from './NotificationDetail';

interface Props {
  campaign: CampaignData;
  projectId: string;
  phaseId: string;
}

const NotificationRow = ({ campaign, projectId, phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const {
    saveEnabled,
    openEditor,
    isComingSoon,
    isOutsidePlan,
    isEditable,
    canBeDisabled,
  } = useCampaignRow({
    campaign,
    context: { phaseId },
    editPath: (campaignId) =>
      `/admin/projects/${projectId}/phases/${phaseId}/emails/${campaignId}/edit`,
  });
  const when = campaign.trigger || campaign.schedule;
  const savedEnabled = !!campaign.attributes.enabled;
  const [enabled, setEnabled] = useState(savedEnabled);

  useRegisterPageSaver(`notification-${campaign.id}`, {
    dirty: enabled !== savedEnabled,
    save: () => saveEnabled(enabled),
  });

  const editButton = (
    <Button
      buttonStyle="bo-text"
      icon="chevron-right"
      iconSize="16px"
      width="28px"
      height="28px"
      padding="0"
      ariaLabel={formatMessage(messagingMessages.editButtonLabel)}
      disabled={!isEditable}
      onClick={openEditor}
    />
  );

  return (
    <Box display="flex" alignItems="center" gap="12px">
      <Box alignSelf="flex-start" pt="2px">
        <Toggle
          variant="bo"
          checked={enabled}
          onChange={() => setEnabled((enabled) => !enabled)}
          disabled={!canBeDisabled}
        />
      </Box>
      <Box display="flex" flexDirection="column" gap="4px" flexGrow={1}>
        <Text as="span" variant="boControl" m="0">
          {campaign.campaign_description}
        </Text>
        {campaign.recipient_segment && (
          <NotificationDetail
            icon="user"
            label={formatMessage(messagingMessages.automatedEmailsRecipients)}
            text={campaign.recipient_segment}
          />
        )}
        {when && (
          <NotificationDetail
            icon="clock"
            label={formatMessage(messagingMessages.automatedEmailsTriggers)}
            text={when}
          />
        )}
      </Box>
      {isOutsidePlan ? (
        <UpsellTooltip disabled={false}>{editButton}</UpsellTooltip>
      ) : (
        <Tooltip
          disabled={!isComingSoon}
          content={formatMessage(messagingMessages.editDisabledTooltip)}
        >
          <div>{editButton}</div>
        </Tooltip>
      )}
    </Box>
  );
};

export default NotificationRow;
