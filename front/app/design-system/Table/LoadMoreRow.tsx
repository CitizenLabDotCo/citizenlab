import React, { ReactNode } from 'react';

import { TableLoadMoreItem } from 'react-aria-components';

import { SpinnerGraphic } from '../Spinner';
import '../tokens.css';

import styles from './LoadMoreRow.module.css';

export type LoadMoreRowProps = {
  // E.g. Loading more projects.
  children: ReactNode;
  isLoading: boolean;
  onLoadMore?: () => void;
  showSpinner?: boolean;
};

// The last row of a TableBody while the next page loads.
const LoadMoreRow = ({
  children,
  isLoading,
  onLoadMore,
  showSpinner = false,
}: LoadMoreRowProps) => (
  <TableLoadMoreItem
    className={styles.row}
    isLoading={isLoading}
    onLoadMore={onLoadMore}
  >
    <div className={styles.content}>
      {showSpinner && <SpinnerGraphic tone="accent" />}
      <span className={styles.label}>{children}</span>
    </div>
  </TableLoadMoreItem>
);

export default LoadMoreRow;
