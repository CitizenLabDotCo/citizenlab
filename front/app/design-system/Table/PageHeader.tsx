import React, { ReactNode } from 'react';

import { Group, Heading } from 'react-aria-components';

import '../tokens.css';

import styles from './PageHeader.module.css';

export type PageHeaderProps = {
  title: ReactNode;
  // The platform menu button: an IconButton Ghost 28 with panel-left-16.
  platformMenu?: ReactNode;
  // E.g. the New project SplitButton.
  actions?: ReactNode;
};

const PageHeader = ({ title, platformMenu, actions }: PageHeaderProps) => (
  <header className={styles.header}>
    <div className={styles.pathRow}>
      {platformMenu && (
        <div className={styles.platformMenu}>{platformMenu}</div>
      )}
    </div>
    <div className={styles.titleRow}>
      <Heading level={1} className={styles.title}>
        {title}
      </Heading>
      {actions && <Group className={styles.actions}>{actions}</Group>}
    </div>
  </header>
);

export default PageHeader;
