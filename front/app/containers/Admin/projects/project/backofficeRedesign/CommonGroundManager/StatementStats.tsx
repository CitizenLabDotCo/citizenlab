import React from 'react';

import { MessageDescriptor } from 'react-intl';

import StatRow from 'design-system/StatRow';

import { useIntl } from 'utils/cl-intl';

import styles from './CommonGroundManager.module.css';
import messages from './messages';
import 'design-system/tokens.css';

export interface StatementStatFilter {
  label: MessageDescriptor;
  value?: number;
  active: boolean;
  toggle: () => void;
}

interface Props {
  statements: number;
  reactions: number;
  participants: number;
  filters: StatementStatFilter[];
}

const StatementStats = ({
  statements,
  reactions,
  participants,
  filters,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <div className={styles.stats} data-cy="e2e-statement-stats">
      <StatRow label={formatMessage(messages.statements)} value={statements} />
      {filters.map(({ label, value, active, toggle }) =>
        value === undefined ? null : (
          <StatRow
            key={label.id}
            label={formatMessage(label)}
            value={value}
            isPressed={active}
            onPress={toggle}
          />
        )
      )}
      <StatRow label={formatMessage(messages.reactions)} value={reactions} />
      <StatRow
        label={formatMessage(messages.participants)}
        value={participants}
      />
    </div>
  );
};

export default StatementStats;
