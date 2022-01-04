import React, { useEffect } from 'react';
import useKeyPress from 'hooks/useKeyPress';

import { Button, Box } from '@citizenlab/cl2-component-library';

export type NavigationProps = {
  moveUp: () => void;
  moveDown: () => void;
  isMoveUpDisabled: boolean;
  isMoveDownDisabled: boolean;
};

const Navigation = ({
  moveUp,
  moveDown,
  isMoveUpDisabled,
  isMoveDownDisabled,
}: NavigationProps) => {
  const upArrow = useKeyPress('ArrowUp');
  const downArrow = useKeyPress('ArrowDown');

  // Keyboard navigations
  useEffect(() => {
    if (upArrow && !isMoveUpDisabled) {
      moveUp();
    }
  }, [upArrow, moveUp, isMoveUpDisabled]);

  useEffect(() => {
    if (downArrow && !isMoveDownDisabled) {
      moveDown();
    }
  }, [downArrow, moveDown, isMoveDownDisabled]);

  return (
    <Box
      position="absolute"
      bottom="10px"
      left="20px"
      data-testid="insightsInputDetailNavigation"
    >
      <Button
        maxWidth="8px"
        m="2px"
        p="8px 12px"
        iconSize="8px"
        locale="en"
        icon="chevron-up"
        buttonStyle="secondary-outlined"
        onClick={moveUp}
        disabled={isMoveUpDisabled}
        data-testid="insightsInputDetailNavigationUp"
      />
      <Button
        maxWidth="8px"
        m="2px"
        p="8px 12px"
        iconSize="8px"
        locale="en"
        icon="chevron-down"
        buttonStyle="secondary-outlined"
        onClick={moveDown}
        disabled={isMoveDownDisabled}
        data-testid="insightsInputDetailNavigationDown"
      />
    </Box>
  );
};

export default Navigation;
