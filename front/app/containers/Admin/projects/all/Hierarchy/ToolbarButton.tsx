import React, { forwardRef } from 'react';

import {
  Box,
  Button,
  IconNames,
  Tooltip,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';

import { TOOLBAR_HEIGHT } from './constants';

interface Props {
  icon: IconNames;
  label: string;
  // On while what it opens is in use, like the filters.
  isActive?: boolean;
  // Set for a button that opens a menu.
  menuOpened?: boolean;
  onClick: () => void;
}

// An icon button of the level's toolbar, marked with a dot while what it
// controls is on.
const ToolbarButton = forwardRef<HTMLButtonElement, Props>(
  ({ icon, label, isActive = false, menuOpened, onClick }, ref) => (
    <Box position="relative">
      <Tooltip
        content={label}
        placement="bottom"
        theme="dark"
        disabled={menuOpened}
      >
        <Button
          ref={ref}
          type="button"
          buttonStyle="bo-secondary"
          icon={icon}
          iconSize="16px"
          iconColor={isActive ? colors.primary : colors.coolGrey600}
          borderColor={isActive ? colors.primary : undefined}
          // A square the toolbar's height, the icon in its middle.
          width={TOOLBAR_HEIGHT}
          height={TOOLBAR_HEIGHT}
          padding="0"
          borderRadius={bo.borderRadius}
          ariaLabel={label}
          ariaExpanded={menuOpened}
          ariaHasPopup={menuOpened === undefined ? undefined : 'menu'}
          onClick={onClick}
        />
      </Tooltip>
      {isActive && (
        <Box
          position="absolute"
          top="-3px"
          right="-3px"
          width="7px"
          height="7px"
          borderRadius="50%"
          bgColor={colors.primary}
          border={`1.5px solid ${colors.white}`}
        />
      )}
    </Box>
  )
);

export default ToolbarButton;
