import React from 'react';

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
      <p className={styles.caption}>
        {formatMessage(messages.participantsGraphLabel)}
      </p>
      <p className={styles.emptyValue}>{formatNumber(0)}</p>
      <div className={styles.emptyLine} />
      <p className={styles.emptyNote}>
        {formatMessage(messages.participantsEmpty)}
      </p>
    </div>
  );
};

export default EmptyCard;
