import React, { ReactNode } from 'react';

import { Key, SelectionIndicator, Tab as AriaTab } from 'react-aria-components';

import styles from './Tabs.module.css';
import '../tokens.css';

type Props = {
  id: Key;
  children: ReactNode;
  'data-cy'?: string;
};

const Tab = ({ id, children, 'data-cy': dataCy }: Props) => (
  <AriaTab id={id} className={styles.tab} data-cy={dataCy}>
    <span className={styles.content}>
      <span>{children}</span>
    </span>
    <SelectionIndicator className={styles.indicator} />
  </AriaTab>
);

export default Tab;
