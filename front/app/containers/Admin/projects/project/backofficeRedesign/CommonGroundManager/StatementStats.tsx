import React from 'react';

import StatRow from 'design-system/StatRow';
import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';

import styles from './CommonGroundManager.module.css';
import messages from './messages';

interface Props {
  statements: number;
  reactions: number;
  participants: number;
}

const StatementStats = ({ statements, reactions, participants }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <div className={styles.stats} data-cy="e2e-statement-stats">
      <StatRow label={formatMessage(messages.statements)} value={statements} />
      <StatRow label={formatMessage(messages.reactions)} value={reactions} />
      <StatRow
        label={formatMessage(messages.participants)}
        value={participants}
      />
    </div>
  );
};

export default StatementStats;
