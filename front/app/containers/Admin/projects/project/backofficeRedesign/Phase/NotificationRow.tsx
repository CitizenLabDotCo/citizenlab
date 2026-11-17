import React, { useCallback, useMemo, useState } from 'react';

import Icon from 'design-system/Icon';
import Switch from 'design-system/Switch';
import Tooltip from 'design-system/Tooltip';
import { Button as AriaButton } from 'react-aria-components';

import { CampaignData } from 'containers/Admin/messaging/AutomatedEmails/types';
import useCampaignRow from 'containers/Admin/messaging/AutomatedEmails/useCampaignRow';
import messagingMessages from 'containers/Admin/messaging/messages';

import { useRegisterPageSaver } from 'components/admin/PageSaveContext';
import upsellMessages from 'components/UpsellTooltip/messages';

import { useIntl } from 'utils/cl-intl';

import styles from './NotificationRow.module.css';
import useNotificationDescription from './useNotificationDescription';
import 'design-system/tokens.css';

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

  const editLabel = formatMessage(messagingMessages.editButtonLabel);
  const disabledReason = isOutsidePlan
    ? formatMessage(upsellMessages.tooltipContent)
    : isComingSoon
    ? formatMessage(messagingMessages.editDisabledTooltip)
    : undefined;
  const isEditDisabled = !isEditable || !enabled;
  const hasReason = isEditDisabled && !!disabledReason;

  // The whole text block opens the editor, so it is a plain React Aria button
  // styled as a row; a design-system Button only holds a short label.
  const editButton = (
    <AriaButton
      className={styles.edit}
      aria-label={editLabel}
      isDisabled={isEditDisabled && !hasReason}
      aria-disabled={hasReason ? true : undefined}
      onPress={isEditDisabled ? undefined : openEditor}
    >
      <span className={styles.content}>
        <span className={styles.title}>{campaign.campaign_description}</span>
        <span className={styles.detail}>
          {description ??
            [campaign.recipient_segment, when].filter(Boolean).join(' · ')}
        </span>
      </span>
      <Icon name="chevron-right-16" className={styles.chevron} />
    </AriaButton>
  );

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
      <div className={styles.main}>
        {hasReason ? (
          <Tooltip content={disabledReason}>{editButton}</Tooltip>
        ) : (
          editButton
        )}
      </div>
    </div>
  );
};

export default NotificationRow;
