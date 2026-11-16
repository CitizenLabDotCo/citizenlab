import React, { ReactNode } from 'react';

import { Heading } from 'react-aria-components';

import '../tokens.css';

import styles from './PanelGroupHeader.module.css';

export type PanelGroupHeaderProps = {
  label: ReactNode;
  // Panel: names a run of setting cards. Rail: a group of the project rail.
  context?: 'panel' | 'rail';
  // An IconButton (Ghost 28): Expand all in a panel, the add button in the rail.
  action?: ReactNode;
  level?: number;
  'data-cy'?: string;
};

const PanelGroupHeader = ({
  label,
  context = 'panel',
  action,
  level = 3,
  'data-cy': dataCy,
}: PanelGroupHeaderProps) => (
  <div className={`${styles.header} ${styles[context]}`} data-cy={dataCy}>
    <Heading level={level} className={styles.label}>
      {label}
    </Heading>
    {action}
  </div>
);

export default PanelGroupHeader;
