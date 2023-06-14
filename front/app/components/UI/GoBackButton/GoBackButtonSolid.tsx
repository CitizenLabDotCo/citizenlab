import React, { useCallback } from 'react';

// components
import { Button, Box } from '@citizenlab/cl2-component-library';
import { ScreenReaderOnly } from 'utils/a11y';

interface Props {
  text?: string;
  screenReaderText: string;
  onClick: (event: React.MouseEvent) => void;
}

const GoBackButtonSolid = ({ text, screenReaderText, onClick }: Props) => {
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
      onClick={handleClick}
      buttonStyle="text"
      iconSize="26px"
      padding="0"
      textDecorationHover="underline"
      whiteSpace="normal"
    >
      <Box as="span" display={text ? 'block' : 'none'} aria-hidden>
        {text}
      </Box>
      <ScreenReaderOnly>{screenReaderText}</ScreenReaderOnly>
    </Button>
  );
};

export default GoBackButtonSolid;
