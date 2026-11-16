import React, { useCallback, useMemo, useState } from 'react';

import {
  Box,
  colors,
  Button,
  Text,
  Toggle,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { CampaignData } from 'containers/Admin/messaging/AutomatedEmails/types';
import useCampaignRow from 'containers/Admin/messaging/AutomatedEmails/useCampaignRow';
import messagingMessages from 'containers/Admin/messaging/messages';

import { useRegisterPageSaver } from 'components/admin/PageSaveContext';
import UpsellTooltip from 'components/UpsellTooltip';

import { useIntl } from 'utils/cl-intl';

import useNotificationDescription from './useNotificationDescription';

interface Props {
  campaign: CampaignData;
  projectId: string;
  phaseId: string;
}

const NotificationRow = ({ campaign, projectId, phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const context = useMemo(() => ({ phaseId }), [phaseId]);
  const editPath = useCallback(
    (campaignId: string) =>
      `/admin/projects/${projectId}/phases/${phaseId}/emails/${campaignId}/edit`,
    [projectId, phaseId]
  );
  const {
    saveEnabled,
    openEditor,
    isComingSoon,
    isOutsidePlan,
    isEditable,
    canBeDisabled,
  } = useCampaignRow({ campaign, context, editPath });
  const description = useNotificationDescription(
    campaign.attributes.campaign_name
  );
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
      iconPos="right"
      iconSize="16px"
      iconColor={colors.coolGrey500}
      width="100%"
      height="auto"
      justify="space-between"
      whiteSpace="normal"
      textAlign="left"
      padding="0"
      ariaLabel={formatMessage(messagingMessages.editButtonLabel)}
      disabled={!isEditable || !enabled}
      onClick={openEditor}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        gap="4px"
        py="4px"
      >
        <Text as="span" variant="boControl" lineHeight="20px" m="0">
          {campaign.campaign_description}
        </Text>
        <Text as="span" variant="boHelper" lineHeight="18px" m="0">
          {description ??
            [campaign.recipient_segment, when].filter(Boolean).join(' · ')}
        </Text>
      </Box>
    </Button>
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
      <Box flexGrow={1} minWidth="0">
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
    </Box>
  );
};

export default NotificationRow;
