import React from 'react';

import DesignSystemEmptyState from 'design-system/EmptyState';
import 'design-system/tokens.css';

import styles from './EmptyState.module.css';

interface Props {
  title?: string;
  description?: string;
  size: 'large' | 'small';
}

const EmptyState = ({ title, description, size }: Props) => (
  <div className={styles.fill}>
    <DesignSystemEmptyState context={size === 'large' ? 'list' : 'card'}>
      <span className={`${styles.content} ${styles[size]}`}>
        {title && <span className={styles.title}>{title}</span>}
        {description && <span>{description}</span>}
      </span>
    </DesignSystemEmptyState>
  </div>
);

export default EmptyState;
