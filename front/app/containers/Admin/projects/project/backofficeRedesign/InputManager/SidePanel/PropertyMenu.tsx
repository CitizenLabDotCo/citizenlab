import React, { ReactNode } from 'react';

import Button from 'design-system/Button';
import { MenuTrigger } from 'design-system/Menu';

import styles from './SidePanel.module.css';

interface Props {
  label?: string;
  // While the change saves, the spinner shows in the control that was used.
  isPending?: boolean;
  // An OptionList.
  children: ReactNode;
}

const PropertyMenu = ({ label, isPending = false, children }: Props) => (
  <MenuTrigger>
    <Button size={28} hasMenu isPending={isPending}>
      <span className={styles.menuLabel}>{label}</span>
    </Button>
    {children}
  </MenuTrigger>
);

export default PropertyMenu;
