import React, { ReactNode, useContext } from 'react';

import { Key, Tab as AriaTab } from 'react-aria-components';

import { useRegisterReasonKey } from '../disabledReason/reasonKeys';
import renderAriaDisabled from '../disabledReason/renderAriaDisabled';
import Icon, { IconName } from '../Icon';
import '../tokens.css';
import Tooltip from '../Tooltip';

import { StyleContext } from './context';
import styles from './VerticalTabs.module.css';

export type VerticalTabProps = {
  id: Key;
  children: ReactNode;
  // Optional 16 px icon before the label (Show icon).
  icon?: IconName;
  // Shown at the end of the row (Show count).
  count?: ReactNode;
  isDisabled?: boolean;
  // Looks disabled but stays focusable (arrow keys reach it) so the tooltip can say
  // why; it can't be selected and drops its href.
  disabledReason?: ReactNode;
  href?: string;
};

const VerticalTab = ({
  id,
  children,
  icon,
  count,
  isDisabled,
  disabledReason,
  href,
}: VerticalTabProps) => {
  const style = useContext(StyleContext);
  const hasReason = !!disabledReason;
  useRegisterReasonKey(id, hasReason);

  const tab = (
    <AriaTab
      id={id}
      isDisabled={isDisabled && !hasReason}
      href={hasReason ? undefined : href}
      render={hasReason ? renderAriaDisabled : undefined}
      className={`${styles.tab} ${styles[style]}`}
    >
      {icon && <Icon name={icon} className={styles.icon} />}
      <span className={styles.label}>{children}</span>
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </AriaTab>
  );

  if (!hasReason) return tab;

  return <Tooltip content={disabledReason}>{tab}</Tooltip>;
};

export default VerticalTab;
