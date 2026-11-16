import React, { useCallback, useMemo, useState } from 'react';

import IconButton from 'design-system/IconButton';
import Switch from 'design-system/Switch';
import 'design-system/tokens.css';

import { CampaignData } from 'containers/Admin/messaging/AutomatedEmails/types';
import useCampaignRow from 'containers/Admin/messaging/AutomatedEmails/useCampaignRow';
import messagingMessages from 'containers/Admin/messaging/messages';

import { useRegisterPageSaver } from 'components/admin/PageSaveContext';
import upsellMessages from 'components/UpsellTooltip/messages';

import { useIntl } from 'utils/cl-intl';

import NotificationDetail from './NotificationDetail';
import styles from './NotificationRow.module.css';

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
  const when = campaign.trigger || campaign.schedule;
  const savedEnabled = !!campaign.attributes.enabled;
  const [enabled, setEnabled] = useState(savedEnabled);

  useRegisterPageSaver(`notification-${campaign.id}`, {
    dirty: enabled !== savedEnabled,
    save: () => saveEnabled(enabled),
  });

  const editLabel = formatMessage(messagingMessages.editButtonLabel);
  const disabledReason = isOutsidePlan
    ? formatMessage(upsellMessages.tooltipContent)
    : isComingSoon
    ? formatMessage(messagingMessages.editDisabledTooltip)
    : undefined;

  return (
    <div className={styles.row}>
      <div className={styles.switch}>
        <Switch
          size={26}
          aria-label={campaign.campaign_description}
          isSelected={enabled}
          onChange={setEnabled}
          isDisabled={!canBeDisabled}
        />
      </div>
      <div className={styles.content}>
        <span className={styles.description}>
          {campaign.campaign_description}
        </span>
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
      </div>
      <IconButton
        icon="chevron-right-16"
        aria-label={editLabel}
        isDisabled={!isEditable}
        disabledReason={disabledReason}
        onPress={openEditor}
      />
    </div>
  );
};

export default NotificationRow;
