import React, { useEffect } from 'react';
import useKeyPress from 'hooks/useKeyPress';

import { Button } from 'cl2-component-library';

// styles
import styled from 'styled-components';

const StyledNavigation = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
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
  upDisabled: boolean;
  downDisabled: boolean;
};

const Navigation = ({
  moveUp,
  moveDown,
  upDisabled,
  downDisabled,
}: NavigationProps) => {
  const upArrow = useKeyPress('ArrowUp');
  const downArrow = useKeyPress('ArrowDown');

  useEffect(() => {
    if (upArrow && !upDisabled) {
      moveUp();
    }
    if (downArrow && !downDisabled) {
      moveDown();
    }
  }, [upArrow, downArrow]);

  return (
    <StyledNavigation data-testid="insightsInputDetailNavigation">
      <StyledChevronButton
        iconSize="8px"
        locale="en"
        icon="chevron-up"
        buttonStyle="secondary-outlined"
        onClick={moveUp}
        disabled={upDisabled}
        id="insightsInputDetailNavigationUp"
      />
      <StyledChevronButton
        iconSize="8px"
        locale="en"
        icon="chevron-down"
        buttonStyle="secondary-outlined"
        onClick={moveDown}
        disabled={downDisabled}
        id="insightsInputDetailNavigationDown"
      />
    </StyledNavigation>
  );
};

export default Navigation;
