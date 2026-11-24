import React from 'react';

import { Badge, Box, colors } from '@citizenlab/cl2-component-library';

import DSBadge from 'design-system/Badge';
import StatusBadge from 'design-system/StatusBadge';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import styles from './DraftPhaseDescription.module.css';

interface Props {
  isEditing: boolean;
  isPanel: boolean;
}

const StatusBadges = ({ isEditing, isPanel }: Props) => {
  const { formatMessage } = useIntl();

  const statusLabel = formatMessage(
    isEditing
      ? messages.draftDescriptionDraftBadge
      : messages.draftDescriptionPublishedBadge
  );

  if (isPanel) {
    return (
      <span className={styles.badges}>
        <StatusBadge status={isEditing ? 'draft' : 'published'}>
          {statusLabel}
        </StatusBadge>
        <DSBadge use="note">{formatMessage(messages.beta)}</DSBadge>
      </span>
    );
  }

  return (
    <Box as="span" display="inline-flex" alignItems="center" gap="8px">
      <Badge
        as="span"
        color={isEditing ? colors.orange500 : colors.green500}
        className="inverse"
      >
        {statusLabel}
      </Badge>
      <Badge as="span" color={colors.coolGrey600} className="inverse">
        {formatMessage(messages.beta)}
      </Badge>
    </Box>
  );
};

export default StatusBadges;
