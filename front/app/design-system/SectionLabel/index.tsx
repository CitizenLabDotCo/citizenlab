import React, { ReactNode } from 'react';

import { Header } from 'react-aria-components';

import '../tokens.css';
import styles from './SectionLabel.module.css';

export type SectionLabelProps = {
  // The group name, e.g. "Timeline".
  children: ReactNode;
};

// A Header, so inside a ListBox or GridList section it labels the section.
const SectionLabel = ({ children }: SectionLabelProps) => (
  <Header className={styles.sectionLabel}>{children}</Header>
);

export default SectionLabel;
