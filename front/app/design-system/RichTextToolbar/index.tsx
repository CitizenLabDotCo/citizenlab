import React, { ReactNode } from 'react';

import { Toolbar } from 'react-aria-components';

import styles from './RichTextToolbar.module.css';
import '../tokens.css';

type RichTextToolbarProps = {
  // RichTextToolbarButton items.
  children: ReactNode;
  'aria-label': string;
};

const RichTextToolbar = ({
  children,
  'aria-label': ariaLabel,
}: RichTextToolbarProps) => (
  <Toolbar className={styles.toolbar} aria-label={ariaLabel}>
    {children}
  </Toolbar>
);

export { default as RichTextToolbarButton } from './RichTextToolbarButton';

export default RichTextToolbar;
