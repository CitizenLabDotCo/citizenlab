import React, { ReactNode } from 'react';

import DesignSystemEmptyState from 'design-system/EmptyState';
import Text from 'design-system/Text';

import styles from './EmptyState.module.css';
import 'design-system/tokens.css';

interface Props {
  title?: string;
  description?: ReactNode;
  size: 'large' | 'small';
  // The library's empty views draw the notebook above the sentence.
  illustrated?: boolean;
}

const EmptyState = ({ title, description, size, illustrated }: Props) => (
  <div className={styles.fill}>
    <DesignSystemEmptyState
      context={illustrated ? 'panel' : size === 'large' ? 'list' : 'card'}
      illustration={illustrated ? size : undefined}
    >
      {(title || description) && (
        <span className={`${styles.content} ${styles[size]}`}>
          {title && (
            <Text as="span" variant="uiStrong" tone="primary">
              {title}
            </Text>
          )}
          {description && <span>{description}</span>}
        </span>
      )}
    </DesignSystemEmptyState>
  </div>
);

export default EmptyState;
