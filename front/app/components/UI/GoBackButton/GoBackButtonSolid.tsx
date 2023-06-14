import React, { useCallback } from 'react';

// components
import { Button, Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { ScreenReaderOnly } from 'utils/a11y';

interface Props {
  text: string;
  iconSize?: string;
  onClick: (event: React.MouseEvent) => void;
}

const GoBackButtonSolid = ({ text, iconSize = '26px', onClick }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      onClick(event);
    },
    [onClick]
  );

  return (
    <Button
      id="e2e-idea-other-link"
      icon="arrow-left-circle"
      buttonStyle="text"
      iconSize={iconSize}
      padding="0"
      textDecorationHover="underline"
      whiteSpace="normal"
      onClick={handleClick}
    >
      <Box
        as="span"
        display={isSmallerThanPhone ? 'none' : 'block'}
        aria-hidden
      >
        {text}
      </Box>
      <ScreenReaderOnly>{text}</ScreenReaderOnly>
    </Button>
  );
};

export default GoBackButtonSolid;
