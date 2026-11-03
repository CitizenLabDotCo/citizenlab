import React, { forwardRef } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import MenuRow from './MenuRow';

interface Props {
  label: string;
  description: string;
  current: boolean;
  // Set on the row that opens the area flyout.
  flyout?: { opened: boolean; onOpen: () => void };
  onHover: () => void;
  onClick: () => void;
}

const AreaTypeRow = forwardRef<HTMLButtonElement, Props>(
  ({ label, description, current, flyout, onHover, onClick }, ref) => {
    const theme = useTheme();

    return (
      <MenuRow
        ref={ref}
        type="button"
        role="menuitemradio"
        aria-checked={current}
        aria-haspopup={flyout ? 'menu' : undefined}
        aria-expanded={flyout?.opened}
        data-active={!!flyout?.opened}
        onMouseEnter={onHover}
        onKeyDown={(event) => {
          if (flyout && event.key === 'ArrowRight') {
            event.preventDefault();
            flyout.onOpen();
          }
        }}
        onClick={onClick}
      >
        <Icon
          name="position"
          width="16px"
          height="16px"
          fill={colors.coolGrey600}
          mt="2px"
        />
        <Box flex="1 1 auto" minWidth="0">
          <Text as="span" display="block" m="0" fontSize="s">
            {label}
          </Text>
          <Text
            as="span"
            display="block"
            m="0"
            fontSize="xs"
            color="coolGrey600"
          >
            {description}
          </Text>
        </Box>
        {current && (
          <Icon
            name="check"
            width="16px"
            height="16px"
            fill={theme.colors.tenantPrimary}
            mt="2px"
          />
        )}
        {flyout && (
          <Icon
            name="chevron-right"
            width="16px"
            height="16px"
            fill={colors.coolGrey500}
            mt="2px"
          />
        )}
      </MenuRow>
    );
  }
);

export default AreaTypeRow;
