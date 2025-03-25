import React from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

interface Props {
  variant: 'left' | 'right';
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ScrollButton = ({
  variant,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: Props) => {
  return (
    <Box
      as="button"
      className="scroll-button"
      position="absolute"
      left={variant === 'left' ? '8px' : undefined}
      right={variant === 'right' ? '8px' : undefined}
      top="50%"
      transform="translateY(-50%)"
      borderRadius="30px"
      bgColor="white"
      w="52px"
      h="52px"
      zIndex="3"
      border={`1px solid ${colors.divider}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-hidden="true"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Icon name={`arrow-${variant}`} fill={colors.grey700} />
    </Box>
  );
};

export default ScrollButton;
