import React from 'react';

import {
  Box,
  colors,
  Icon,
  IconButton,
  IconNames,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

type ToolbarAction = {
  icon: IconNames;
  label: string;
  onClick: () => void;
};

type Props = {
  actions: ToolbarAction[];
  showDragHandle?: boolean;
  dragLabel?: string;
};

// Small floating toolbar shown on the top-right edge of a hovered or selected
// block in the canvas.
const BlockToolbar = ({ actions, showDragHandle, dragLabel }: Props) => (
  <Box
    position="absolute"
    top="-26px"
    right="-8px"
    zIndex="3"
    display="flex"
    alignItems="center"
    gap="4px"
    px="6px"
    py="2px"
    bgColor={colors.white}
    border={`1px solid ${colors.grey300}`}
    borderRadius={stylingConsts.borderRadius}
    boxShadow="0px 2px 4px rgba(0, 0, 0, 0.12)"
    onClick={(event) => event.stopPropagation()}
  >
    {showDragHandle && (
      <Box
        display="flex"
        alignItems="center"
        px="2px"
        style={{ cursor: 'grab' }}
        title={dragLabel}
      >
        <Icon
          name="drag-handle"
          width="16px"
          height="16px"
          fill={colors.textSecondary}
        />
      </Box>
    )}
    {actions.map((action) => (
      <IconButton
        key={action.icon}
        iconName={action.icon}
        buttonType="button"
        iconWidth="18px"
        iconHeight="18px"
        iconColor={colors.textSecondary}
        iconColorOnHover={colors.textPrimary}
        a11y_buttonActionMessage={action.label}
        onClick={(event) => {
          event?.stopPropagation();
          action.onClick();
        }}
      />
    ))}
  </Box>
);

export const getBlockOutline = ({
  selected,
  hasError,
  hovered,
}: {
  selected: boolean;
  hasError: boolean;
  hovered: boolean;
}) => {
  if (hasError) return `2px solid ${colors.red600}`;
  if (selected) return `2px solid ${colors.primary}`;
  if (hovered) return `1px dashed ${colors.grey500}`;
  return '2px solid transparent';
};

export default BlockToolbar;
