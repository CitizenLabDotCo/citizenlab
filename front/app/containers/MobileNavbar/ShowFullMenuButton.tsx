import React from 'react';
import { NavigationItem, NavigationLabel } from './';
import { Icon } from 'cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';
import { darken } from 'polished';

interface Props {
  onClick: () => void;
  isFullMenuOpened: boolean;
}

const StyledButton = styled.button<{ isFullMenuOpened: boolean }>`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ isFullMenuOpened, theme }) =>
    isFullMenuOpened ? theme.colorMain : colors.label};

  &:hover {
    color: ${({ isFullMenuOpened, theme }) =>
      darken(0.2, isFullMenuOpened ? theme.colorMain : colors.label)};
  }
`;
const StyledIcon = styled(Icon)<{ isFullMenuOpened: boolean }>`
  width: 17px;
  height: 17px;
  margin-right: 3px;
  fill: ${({ isFullMenuOpened, theme }) =>
    isFullMenuOpened ? theme.colorMain : colors.label};
`;

const ShowFullMenuButton = ({ onClick, isFullMenuOpened }: Props) => {
  return (
    <NavigationItem>
      <StyledButton onClick={onClick} isFullMenuOpened={isFullMenuOpened}>
        <StyledIcon name="more-options" isFullMenuOpened={isFullMenuOpened} />
        <NavigationLabel>
          <FormattedMessage {...messages.showMore} />
        </NavigationLabel>
      </StyledButton>
    </NavigationItem>
  );
};

export default ShowFullMenuButton;
