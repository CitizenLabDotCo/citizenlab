import React, { ReactNode } from 'react';

import Button from 'design-system/Button';
import { MenuTrigger } from 'design-system/Menu';

import ColorDot from '../ColorDot';

import styles from './SidePanel.module.css';

interface Props {
  label?: string;
  color?: string;
  // An OptionList.
  children: ReactNode;
}

const PropertyMenu = ({ label, color, children }: Props) => (
  <MenuTrigger>
    <Button size={28} hasMenu>
      <span className={styles.menuLabel}>
        {color && <ColorDot color={color} />}
        {label}
      </span>
    </Button>
    {children}
  </MenuTrigger>
);

export default PropertyMenu;
