import React, { ReactNode } from 'react';

import Text from 'design-system/Text';

import styles from './InputImporterModal.module.css';

interface Props {
  title: string;
  description: string;
  children: ReactNode;
}

const ImporterRow = ({ title, description, children }: Props) => (
  <div className={styles.row}>
    <Text as="span" variant="ui" tone="primary">
      {title}
    </Text>
    <span className={styles.description}>{description}</span>
    {children}
  </div>
);

export default ImporterRow;
