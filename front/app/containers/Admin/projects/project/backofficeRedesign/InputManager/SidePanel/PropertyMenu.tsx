import React, { ReactNode } from 'react';

import {
  Box,
  Button,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';

import MenuButton from '../MenuButton';

interface Props {
  label: string;
  /** A dot before the label, e.g. the status colour. */
  color?: string;
  icon?: IconNames;
  children: (close: () => void) => ReactNode;
}

const PropertyMenu = ({
  label,
  color,
  icon = 'chevron-down',
  children,
}: Props) => (
  <MenuButton
    width="280px"
    trigger={({ opened, toggle }) => (
      <Button
        buttonStyle="text"
        size="s"
        padding="4px 10px"
        bgColor={colors.grey100}
        bgHoverColor={colors.grey200}
        textColor={colors.textPrimary}
        icon={icon}
        iconPos="right"
        iconSize="14px"
        onClick={toggle}
        ariaExpanded={opened}
        ariaHasPopup="menu"
      >
        <Box display="flex" alignItems="center" gap="6px">
          {color && (
            <Box
              width="8px"
              height="8px"
              borderRadius="50%"
              background={color}
            />
          )}
          {label}
        </Box>
      </Button>
    )}
  >
    {children}
  </MenuButton>
);

export default PropertyMenu;
