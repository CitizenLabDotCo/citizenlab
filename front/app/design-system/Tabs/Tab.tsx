import React, { ReactNode } from 'react';

import { Key, SelectionIndicator, Tab as AriaTab } from 'react-aria-components';

import { useRegisterReasonKey } from '../disabledReason/reasonKeys';
import renderAriaDisabled from '../disabledReason/renderAriaDisabled';
import '../tokens.css';
import Tooltip from '../Tooltip';

import styles from './Tabs.module.css';

export type TabProps = {
  id: Key;
  children: ReactNode;
  // Shown after the label (Show count).
  count?: ReactNode;
  isDisabled?: boolean;
  // Looks disabled but stays focusable (arrow keys reach it) so the tooltip can say
  // why; it can't be selected and drops its href.
  disabledReason?: ReactNode;
  href?: string;
};

const Tab = ({
  id,
  children,
  count,
  isDisabled,
  disabledReason,
  href,
}: TabProps) => {
  const hasReason = !!disabledReason;
  useRegisterReasonKey(id, hasReason);

  const tab = (
    <AriaTab
      id={id}
      isDisabled={isDisabled && !hasReason}
      href={hasReason ? undefined : href}
      render={hasReason ? renderAriaDisabled : undefined}
      className={styles.tab}
    >
      <span className={styles.content}>
        <span>{children}</span>
        {count !== undefined && <span className={styles.count}>{count}</span>}
      </span>
      <SelectionIndicator className={styles.indicator} />
    </AriaTab>
  );

  if (!hasReason) return tab;

  return <Tooltip content={disabledReason}>{tab}</Tooltip>;
};

export default Tab;
