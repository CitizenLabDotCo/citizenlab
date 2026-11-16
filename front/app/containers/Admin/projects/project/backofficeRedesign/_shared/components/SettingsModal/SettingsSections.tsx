import React from 'react';

import 'design-system/tokens.css';

import styles from './SettingsSections.module.css';

interface Props {
  children: React.ReactNode;
}

const SettingsSections = ({ children }: Props) => (
  <div className={styles.sections}>{children}</div>
);

export default SettingsSections;
