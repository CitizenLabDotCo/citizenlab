import React from 'react';

import DesignSystemEmptyState from 'design-system/EmptyState';

import styles from './ManageLayout.module.css';

// An empty Manage view's side column: one panel with the small notebook.
const EmptySideColumn = () => (
  <div className={styles.emptySide}>
    <DesignSystemEmptyState context="panel" illustration="small" />
  </div>
);

export default EmptySideColumn;
