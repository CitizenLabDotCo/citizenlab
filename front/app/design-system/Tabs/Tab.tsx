import React, { ReactNode } from 'react';

import { Key, SelectionIndicator, Tab as AriaTab } from 'react-aria-components';

import styles from './Tabs.module.css';
import '../tokens.css';

type Props = {
  id: Key;
  children: ReactNode;
};

const Tab = ({ id, children }: Props) => (
  <AriaTab id={id} className={styles.tab}>
    <span className={styles.content}>
      <span>{children}</span>
    </span>
    <SelectionIndicator className={styles.indicator} />
  </AriaTab>
);

export default Tab;
