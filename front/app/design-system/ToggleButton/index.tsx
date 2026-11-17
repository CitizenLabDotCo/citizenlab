import React, { ReactNode } from 'react';

import { Key, ToggleButton as AriaToggleButton } from 'react-aria-components';

import styles from './ToggleButton.module.css';
import '../tokens.css';

type ToggleButtonProps = {
  children: ReactNode;
  // The item's key inside a ToggleButtonGroup.
  id: Key;
};

const ToggleButton = ({ children, id }: ToggleButtonProps) => (
  <AriaToggleButton className={styles.toggleButton} id={id}>
    {children}
  </AriaToggleButton>
);

export default ToggleButton;
