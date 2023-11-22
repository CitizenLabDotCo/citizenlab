import React from 'react';
import { Icon, fontSizes, media } from '@citizenlab/cl2-component-library';
import { colors, isRtl } from 'utils/styleUtils';
import styled from 'styled-components';
import { darken } from 'polished';

export const NavigationLabel = styled.span`
  width: 100%;
  font-size: ${fontSizes.base}px;
  font-weight: 500;

  ${isRtl`
    margin-left: 0;
    margin-right: 6px;
  `}
`;

export const NavigationItem = styled.li`
  display: flex;
  align-items: stretch;
  cursor: pointer;
  margin: 0;
  padding: 0;

  & > * {
    padding: 0 20px;

    ${media.phone`
      padding: 0;
    `}
  }

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

interface Props {
  onClick: () => void;
  isFullMenuOpened: boolean;
}

const StyledIcon = styled(Icon)<{ isFullMenuOpened: boolean }>`
  margin-right: 3px;
  fill: ${({ isFullMenuOpened, theme }) =>
    isFullMenuOpened ? theme.colors.tenantPrimary : colors.textSecondary};

  &:hover {
    fill: ${({ isFullMenuOpened, theme }) =>
      darken(
        0.2,
        isFullMenuOpened ? theme.colors.tenantPrimary : colors.textSecondary
      )};
  }
`;

// had to make a custom button because the one from the component
// library wraps a div around the button, which makes that the
// padding is not "hoverable" area as the other items in the menu are
const StyledButton = styled.button<{ isFullMenuOpened: boolean }>`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ isFullMenuOpened, theme }) =>
    isFullMenuOpened ? theme.colors.tenantPrimary : colors.textSecondary};

  &:active {
    color: ${({ theme }) => theme.colors.tenantPrimary};

    &:hover {
      color: ${({ theme }) => darken(0.2, theme.colors.tenantPrimary)};
    }
  }

  &:hover {
    color: ${({ isFullMenuOpened, theme }) =>
      darken(
        0.2,
        isFullMenuOpened ? theme.colors.tenantPrimary : colors.textSecondary
      )};

    ${StyledIcon} {
      fill: ${({ isFullMenuOpened, theme }) =>
        darken(
          0.2,
          isFullMenuOpened ? theme.colors.tenantPrimary : colors.textSecondary
        )};
    }
  }
`;

const ShowFullMenuButton = ({ onClick, isFullMenuOpened }: Props) => {
  return (
    <NavigationItem>
      <StyledButton onClick={onClick} isFullMenuOpened={isFullMenuOpened}>
        <StyledIcon name="menu" isFullMenuOpened={isFullMenuOpened} />
      </StyledButton>
    </NavigationItem>
  );
};

export default ShowFullMenuButton;
