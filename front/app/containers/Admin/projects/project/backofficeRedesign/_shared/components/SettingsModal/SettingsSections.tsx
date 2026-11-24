import React from 'react';

import styles from './SettingsSections.module.css';
import 'design-system/tokens.css';

interface Props {
  children: React.ReactNode;
}

const SettingsSections = ({ children }: Props) => (
  <div className={styles.sections}>{children}</div>
);

export default SettingsSections;
