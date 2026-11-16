import React, { ReactNode } from 'react';

import styles from './InputImporterModal.module.css';

interface Props {
  title: string;
  description: string;
  children: ReactNode;
}

const ImporterRow = ({ title, description, children }: Props) => (
  <div className={styles.row}>
    <span className={styles.title}>{title}</span>
    <span className={styles.description}>{description}</span>
    {children}
  </div>
);

export default ImporterRow;
