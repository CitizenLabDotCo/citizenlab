import React, { ReactNode } from 'react';

import styles from './SidePanel.module.css';

interface Props {
  label: string;
  children: ReactNode;
}

const PropertyRow = ({ label, children }: Props) => (
  <div className={styles.property}>
    <span className={styles.propertyLabel}>{label}</span>
    <div className={styles.propertyValue}>{children}</div>
  </div>
);

export default PropertyRow;
