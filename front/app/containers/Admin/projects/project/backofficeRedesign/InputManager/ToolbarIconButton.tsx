import React from 'react';

import {
  Box,
  Button,
  colors,
  IconNames,
  Tooltip,
} from '@citizenlab/cl2-component-library';

interface Props {
  icon: IconNames;
  label: string;
  onClick: () => void;
  active?: boolean;
  showDot?: boolean;
}

const ToolbarIconButton = ({
  icon,
  label,
  onClick,
  active = false,
  showDot = false,
}: Props) => (
  <Tooltip content={label} placement="bottom" theme="dark">
    <Box position="relative">
      <Button
        buttonStyle="secondary-outlined"
        icon={icon}
        iconSize="18px"
        padding="6px"
        onClick={onClick}
        ariaLabel={label}
        ariaExpanded={active}
        bgColor={active ? colors.grey100 : colors.white}
      />
      {showDot && (
        <Box
          position="absolute"
          top="-2px"
          right="-2px"
          width="8px"
          height="8px"
          borderRadius="50%"
          background={colors.teal500}
          border={`2px solid ${colors.white}`}
        />
      )}
    </Box>
  </Tooltip>
);

export default ToolbarIconButton;
