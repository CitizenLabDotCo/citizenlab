import React, { ReactNode } from 'react';

import { Button, IconNames } from '@citizenlab/cl2-component-library';

import MenuButton from '../MenuButton';

interface Props {
  icon: IconNames;
  label: string;
  children: (close: () => void) => ReactNode;
  width?: string;
}

const BatchMenuButton = ({ icon, label, children, width }: Props) => (
  <MenuButton
    width={width}
    trigger={({ opened, toggle }) => (
      <Button
        buttonStyle="secondary-outlined"
        size="s"
        padding="4px 10px"
        icon={icon}
        iconSize="16px"
        onClick={toggle}
        ariaExpanded={opened}
        ariaHasPopup="menu"
      >
        {label}
      </Button>
    )}
  >
    {children}
  </MenuButton>
);

export default BatchMenuButton;
