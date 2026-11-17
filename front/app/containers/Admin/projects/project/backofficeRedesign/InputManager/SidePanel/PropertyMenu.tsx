import React, { ReactNode } from 'react';

import {
  Box,
  Button,
  ButtonProps,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';

import MenuButton from 'components/admin/MenuButton';

const APPEARANCES: Record<'pill' | 'link', Partial<ButtonProps>> = {
  pill: {
    buttonStyle: 'bo-picker',
    height: '22px',
    padding: '0 8px 0 10px',
    fontSize: '12px',
  },
  link: {
    buttonStyle: 'bo-text',
    height: '22px',
    padding: '0',
    fontSize: '12px',
    fontWeight: '500',
    textColor: colors.primary,
    iconColor: colors.primary,
  },
};

interface Props {
  label?: string;
  color?: string;
  icon?: IconNames;
  appearance?: keyof typeof APPEARANCES;
  children: (close: () => void) => ReactNode;
}

const PropertyMenu = ({
  label,
  color,
  icon = 'chevron-down',
  appearance = 'pill',
  children,
}: Props) => (
  <MenuButton
    width="280px"
    trigger={({ opened, toggle }) => (
      <Button
        {...APPEARANCES[appearance]}
        icon={icon}
        iconSize="12px"
        iconPos={icon === 'plus' ? 'left' : 'right'}
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
