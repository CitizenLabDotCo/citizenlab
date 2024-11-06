import React from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

interface Props {
  variant: 'left' | 'right';
  onClick: () => void;
}

const ScrollButton = ({ variant, onClick }: Props) => {
  return (
    <Box
      as="button"
      className="scroll-button"
      position="absolute"
      left={variant === 'left' ? '8px' : undefined}
      right={variant === 'right' ? '8px' : undefined}
      top="120px"
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
    >
      <Icon name={`arrow-${variant}`} fill={colors.grey700} />
    </Box>
  );
};

export default ScrollButton;
