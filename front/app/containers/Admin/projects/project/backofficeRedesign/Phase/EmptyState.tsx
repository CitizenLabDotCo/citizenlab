import React from 'react';

import DesignSystemEmptyState from 'design-system/EmptyState';
import Text from 'design-system/Text';

import styles from './EmptyState.module.css';
import 'design-system/tokens.css';

interface Props {
  title?: string;
  description?: string;
  size: 'large' | 'small';
}

const EmptyState = ({ title, description, size }: Props) => (
  <div className={styles.fill}>
    <DesignSystemEmptyState context={size === 'large' ? 'list' : 'card'}>
      <span className={`${styles.content} ${styles[size]}`}>
        {title && (
          <Text as="span" variant="uiStrong" tone="primary">
            {title}
          </Text>
        )}
        {description && <span>{description}</span>}
      </span>
    </DesignSystemEmptyState>
  </div>
);

export default EmptyState;
