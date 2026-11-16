import React, { ReactNode } from 'react';

import { Breadcrumbs as AriaBreadcrumbs, Key } from 'react-aria-components';

import '../tokens.css';

import Breadcrumb from './Breadcrumb';
import styles from './Breadcrumbs.module.css';
import { BreadcrumbSeparator, SeparatorContext } from './context';

export { Breadcrumb };
export type { BreadcrumbProps } from './Breadcrumb';
export type { BreadcrumbSeparator };

export type BreadcrumbsProps = {
  // Breadcrumb elements; the last one is the current page.
  children: ReactNode;
  // Slash for the phase header.
  separator?: BreadcrumbSeparator;
  isDisabled?: boolean;
  onAction?: (key: Key) => void;
  'aria-label'?: string;
};

const Breadcrumbs = ({
  children,
  separator = 'chevron',
  isDisabled,
  onAction,
  'aria-label': ariaLabel,
}: BreadcrumbsProps) => (
  <SeparatorContext.Provider value={separator}>
    <AriaBreadcrumbs
      className={styles.breadcrumbs}
      isDisabled={isDisabled}
      onAction={onAction}
      aria-label={ariaLabel}
    >
      {children}
    </AriaBreadcrumbs>
  </SeparatorContext.Provider>
);

export default Breadcrumbs;
