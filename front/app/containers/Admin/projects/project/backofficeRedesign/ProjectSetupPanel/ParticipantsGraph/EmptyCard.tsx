import React from 'react';

import Text from 'design-system/Text';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import styles from './ParticipantsGraph.module.css';

const EmptyCard = () => {
  const { formatMessage, formatNumber } = useIntl();

  return (
    <div
      className={styles.emptyCard}
      role="group"
      aria-label={formatMessage(messages.participantsGraphLabel)}
    >
      <Text variant="small" tone="secondary">
        {formatMessage(messages.participantsGraphLabel)}
      </Text>
      <p className={styles.emptyValue}>{formatNumber(0)}</p>
      <div className={styles.emptyLine} />
      <Text variant="small" tone="secondary" className={styles.emptyNote}>
        {formatMessage(messages.participantsEmpty)}
      </Text>
    </div>
  );
};

export default EmptyCard;
