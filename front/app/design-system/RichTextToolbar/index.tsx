import React, { ReactNode } from 'react';

import { Toolbar } from 'react-aria-components';

import '../tokens.css';

import styles from './RichTextToolbar.module.css';

export type RichTextToolbarProps = {
  // RichTextToolbarButton items.
  children: ReactNode;
  'aria-label': string;
  'data-cy'?: string;
};

const RichTextToolbar = ({
  children,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
}: RichTextToolbarProps) => (
  <Toolbar className={styles.toolbar} aria-label={ariaLabel} data-cy={dataCy}>
    {children}
  </Toolbar>
);

export { default as RichTextToolbarButton } from './RichTextToolbarButton';
export type { RichTextToolbarButtonProps } from './RichTextToolbarButton';

export default RichTextToolbar;
