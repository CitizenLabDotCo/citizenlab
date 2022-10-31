import React from 'react';

// styling
import styled from 'styled-components';
import { darken } from 'polished';
import { colors, fontSizes } from 'utils/styleUtils';

// components
import Link from 'utils/cl-router/Link';
import { Icon, IconNames } from '@citizenlab/cl2-component-library';

const MenuItem = styled.li`
  font-size: ${fontSizes.base}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledLink = styled(Link)`
  color: ${colors.textPrimary};
  padding: 20px 10px;
  border-radius: 5px;
  &:hover {
    color: ${darken(0.2, colors.textPrimary)};
  }
  &:active {
    background: ${darken(0.05, '#fff')};
  }
  &.active {
    color: ${(props) => props.theme.colors.tenantPrimary};
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
