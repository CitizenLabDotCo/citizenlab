import React, { ReactNode } from 'react';

import Button from 'design-system/Button';
import { MenuTrigger } from 'design-system/Menu';

import styles from './SidePanel.module.css';

interface Props {
  label?: string;
  // An OptionList.
  children: ReactNode;
}

const PropertyMenu = ({ label, children }: Props) => (
  <MenuTrigger>
    <Button size={28} hasMenu>
      <span className={styles.menuLabel}>{label}</span>
    </Button>
    {children}
  </MenuTrigger>
);

export default PropertyMenu;
