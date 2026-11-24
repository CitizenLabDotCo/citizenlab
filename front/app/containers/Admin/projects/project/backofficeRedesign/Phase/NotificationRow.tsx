import React, { useCallback, useMemo } from 'react';

import { useController, useForm } from 'react-hook-form';

import Icon from 'design-system/Icon';
import Switch from 'design-system/Switch';
import UnstyledButton from 'design-system/UnstyledButton';

import messagingMessages from 'containers/Admin/messaging/messages';
import useCampaignRow from 'containers/Admin/messaging/AutomatedEmails/useCampaignRow';
import { CampaignData } from 'containers/Admin/messaging/AutomatedEmails/types';

import upsellMessages from 'components/UpsellTooltip/messages';
import { useRegisterPageSaver } from 'components/admin/PageSaveContext';

import { useIntl } from 'utils/cl-intl';

import 'design-system/tokens.css';
import Text from 'design-system/Text';
import styles from './NotificationRow.module.css';
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
  const {
    control,
    reset,
    formState: { isDirty },
  } = useForm({
    defaultValues: { enabled: !!campaign.attributes.enabled },
  });
  const {
    field: { value: enabled, onChange: setEnabled },
  } = useController({ control, name: 'enabled' });

  useRegisterPageSaver(`notification-${campaign.id}`, {
    dirty: isDirty,
    save: async () => {
      await saveEnabled(enabled);
      reset({ enabled });
    },
  });

  const editLabel = formatMessage(messagingMessages.editButtonLabel);
  const disabledReason = isOutsidePlan
    ? formatMessage(upsellMessages.tooltipContent)
    : isComingSoon
    ? formatMessage(messagingMessages.editDisabledTooltip)
    : undefined;
  const isEditDisabled = !isEditable || !enabled;

  // The whole text block opens the editor, so it is a plain React Aria button
  // styled as a row; a design-system Button only holds a short label.
  const editButton = (
    <UnstyledButton
      className={`${styles.edit} ${enabled ? '' : styles.off}`}
      aria-label={editLabel}
      isDisabled={isEditDisabled}
      disabledReason={isEditDisabled ? disabledReason : undefined}
      onPress={openEditor}
    >
      <span className={styles.content}>
        <Text as="span" variant="ui" tone="primary" className={styles.title}>
          {campaign.campaign_description}
        </Text>
        <Text as="span" variant="small" tone="secondary">
          {description ??
            [campaign.recipient_segment, when].filter(Boolean).join(' · ')}
        </Text>
      </span>
      <Icon name="chevron-right-16" className={styles.chevron} />
    </UnstyledButton>
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
      <div className={styles.main}>{editButton}</div>
    </div>
  );
};

export default NotificationRow;
