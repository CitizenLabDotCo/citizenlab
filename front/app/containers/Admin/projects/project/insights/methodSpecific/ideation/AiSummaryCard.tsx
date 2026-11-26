import React, { ReactNode } from 'react';

import Button from 'design-system/Button';
import DashboardCard from 'design-system/DashboardCard';
import Text from 'design-system/Text';

import { useIntl } from 'utils/cl-intl';

import styles from './AiSummaryCard.module.css';
import messages from './messages';

type Props = {
  children: ReactNode;
  // How many inputs the summary leaves out, of how many, for example "1 / 34".
  coverage?: string;
  onExplore?: () => void;
};

const AiSummaryCard = ({ children, coverage, onExplore }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <DashboardCard
      title={formatMessage(messages.whatArePeopleSaying)}
      icon="sparkles-16"
      className={styles.card}
    >
      <div className={styles.body}>{children}</div>
      {onExplore && (
        <div className={styles.footer}>
          <Text variant="small" tone="tertiary">
            {coverage}
          </Text>
          <Button onPress={onExplore}>{formatMessage(messages.explore)}</Button>
        </div>
      )}
    </DashboardCard>
  );
};

export default AiSummaryCard;
