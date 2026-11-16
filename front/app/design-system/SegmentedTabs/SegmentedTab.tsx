import React, { ReactNode } from 'react';

import { Key, SelectionIndicator, Tab } from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import { useRegisterReasonKey } from '../disabledReason/reasonKeys';
import renderAriaDisabled from '../disabledReason/renderAriaDisabled';
import NewDot from '../NewDot';
import '../tokens.css';
import Tooltip from '../Tooltip';

import messages from './messages';
import styles from './SegmentedTabs.module.css';

type Props = {
  id: Key;
  children: ReactNode;
  // Shows the New dot: something new waits in that view.
  isUnread?: boolean;
  isDisabled?: boolean;
  // Looks disabled but stays focusable (arrow keys reach it) so the tooltip can say
  // why; it can't be selected.
  disabledReason?: ReactNode;
  'data-cy'?: string;
};

const SegmentedTab = ({
  id,
  children,
  isUnread = false,
  isDisabled,
  disabledReason,
  'data-cy': dataCy,
}: Props) => {
  const { formatMessage } = useIntl();
  const hasReason = !!disabledReason;
  useRegisterReasonKey(id, hasReason);

  const tab = (
    <Tab
      id={id}
      className={styles.tab}
      isDisabled={isDisabled && !hasReason}
      render={hasReason ? renderAriaDisabled : undefined}
      data-cy={dataCy}
    >
      <SelectionIndicator className={styles.indicator} />
      <span className={styles.label}>{children}</span>
      {isUnread && (
        <span className={styles.unreadDot}>
          <NewDot aria-label={formatMessage(messages.unread)} />
        </span>
      )}
    </Tab>
  );

  if (!hasReason) return tab;

  return <Tooltip content={disabledReason}>{tab}</Tooltip>;
};

export default SegmentedTab;
