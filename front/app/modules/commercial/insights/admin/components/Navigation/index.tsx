import React, { useEffect } from 'react';
import useKeyPress from 'hooks/useKeyPress';

import { Button } from 'cl2-component-library';

// styles
import styled from 'styled-components';

const StyledNavigation = styled.div`
  position: absolute;
  bottom: 10px;
  left: 20px;
`;

const StyledChevronButton = styled(Button)`
  max-width: 8px;
  margin: 2px;
  button {
    padding: 8px 12px !important;
  }
`;

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
    <StyledNavigation data-testid="insightsInputDetailNavigation">
      <StyledChevronButton
        iconSize="8px"
        locale="en"
        icon="chevron-up"
        buttonStyle="secondary-outlined"
        onClick={moveUp}
        disabled={isMoveUpDisabled}
        id="insightsInputDetailNavigationUp"
      />
      <StyledChevronButton
        iconSize="8px"
        locale="en"
        icon="chevron-down"
        buttonStyle="secondary-outlined"
        onClick={moveDown}
        disabled={isMoveDownDisabled}
        id="insightsInputDetailNavigationDown"
      />
    </StyledNavigation>
  );
};

export default Navigation;
