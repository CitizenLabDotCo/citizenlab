import React from 'react';

// styling
import { darken } from 'polished';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// components
import { Icon, IconNames } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';

const MenuItem = styled.li`
  font-size: ${fontSizes.base}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledLink = styled(Link)`
  color: ${colors.text};
  padding: 20px 10px;
  border-radius: 5px;
  &:hover {
    color: ${darken(0.2, colors.text)};
  }
  &:active {
    background: ${darken(0.05, '#fff')};
  }
  &.active {
    color: ${(props) => props.theme.colorMain};
  }
`;

interface Props {
  linkTo: string;
  navigationItemTitle: string;
  onlyActiveOnIndex?: boolean;
  onClick: () => void;
  iconName?: IconNames;
}

const FullMobileNavMenuItem = ({
  linkTo,
  navigationItemTitle,
  onClick,
  onlyActiveOnIndex,
  iconName,
}: Props) => (
  <MenuItem>
    {/* Without specifying height, the icon height increases too much.
    It can be tested by switching to NL language or changing FAQ to "FAQ 123123123". */}
    {iconName && <Icon name={iconName} height="20px" />}
    <StyledLink
      onClick={onClick}
      to={linkTo}
      onlyActiveOnIndex={onlyActiveOnIndex}
    >
      {navigationItemTitle}
    </StyledLink>
  </MenuItem>
);

export default FullMobileNavMenuItem;
