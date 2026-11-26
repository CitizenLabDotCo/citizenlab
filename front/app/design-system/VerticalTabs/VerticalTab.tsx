import React, { ReactNode } from 'react';

import { Key, Tab as AriaTab } from 'react-aria-components';

import Icon, { IconName } from '../Icon';

import styles from './VerticalTabs.module.css';
import '../tokens.css';

type Props = {
  id: Key;
  children: ReactNode;
  // Optional 16 px icon before the label (Show icon).
  icon?: IconName;
};

const VerticalTab = ({ id, children, icon }: Props) => (
  <AriaTab id={id} className={styles.tab}>
    {icon && <Icon name={icon} className={styles.icon} />}
    <span className={styles.label}>{children}</span>
  </AriaTab>
);

export default VerticalTab;
