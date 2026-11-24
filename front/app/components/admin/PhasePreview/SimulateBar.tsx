import React, { ReactNode } from 'react';

import Badge from 'design-system/Badge';
import Tooltip, { TooltipTarget } from 'design-system/Tooltip';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import styles from './SimulateBar.module.css';

type Props = {
  // The Before / Open / Ended selector.
  children: ReactNode;
};

const SimulateBar = ({ children }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <div className={styles.bar}>
      <Tooltip
        content={
          <>
            <span className={styles.tipTitle}>
              {formatMessage(messages.simulateTooltipTitle)}
            </span>
            <span className={styles.tipText}>
              {formatMessage(messages.simulateTooltipText)}
            </span>
          </>
        }
      >
        <TooltipTarget className={styles.label}>
          {formatMessage(messages.simulate)}
          <Badge use="note" tone="selected">
            {formatMessage(messages.simulateNew)}
          </Badge>
        </TooltipTarget>
      </Tooltip>
      {children}
    </div>
  );
};

export default SimulateBar;
