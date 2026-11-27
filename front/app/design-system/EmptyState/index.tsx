import React, { ReactNode } from 'react';

import styles from './EmptyState.module.css';
import NotebookArt from './NotebookArt';
import '../tokens.css';

type Props = {
  // One sentence saying what is missing and, if it helps, when it will appear.
  children?: ReactNode;
  // List = where the rows would be; Card = inside a dashboard card; Panel = a
  // whole empty view, centred, with the illustration.
  context?: 'list' | 'card' | 'panel';
  // The notebook drawing above the sentence; small for a side column.
  illustration?: 'large' | 'small';
};

const EmptyState = ({ children, context = 'list', illustration }: Props) => (
  <div className={`${styles.emptyState} ${styles[context]}`}>
    {illustration && <NotebookArt size={illustration} />}
    {children}
  </div>
);

export default EmptyState;
