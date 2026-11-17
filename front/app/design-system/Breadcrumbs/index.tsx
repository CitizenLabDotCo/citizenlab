import React, { ReactNode } from 'react';

import { Breadcrumbs as AriaBreadcrumbs } from 'react-aria-components';

import '../tokens.css';

import Breadcrumb from './Breadcrumb';
import styles from './Breadcrumbs.module.css';
import { BreadcrumbSeparator, SeparatorContext } from './context';

export { Breadcrumb };

type Props = {
  // Breadcrumb elements; the last one is the current page.
  children: ReactNode;
  // Slash for the phase header.
  separator: BreadcrumbSeparator;
};

const Breadcrumbs = ({ children, separator }: Props) => (
  <SeparatorContext.Provider value={separator}>
    <AriaBreadcrumbs className={styles.breadcrumbs}>{children}</AriaBreadcrumbs>
  </SeparatorContext.Provider>
);

export default Breadcrumbs;
