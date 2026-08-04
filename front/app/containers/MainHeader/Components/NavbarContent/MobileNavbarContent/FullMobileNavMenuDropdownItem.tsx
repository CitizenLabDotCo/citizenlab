import React from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { NavbarChildLink } from 'api/navbar/util';

import Link, { typedStyled } from 'utils/cl-router/Link';

const Item = styled.li`
  list-style: none;
`;

const StyledLink = typedStyled(Link)`
  display: block;
  color: ${colors.coolGrey700};
  font-size: ${fontSizes.s}px;
  line-height: 150%;
  /* 'anywhere' rather than 'break-word': the menu sits in a flex chain whose
     items size to their content, so the break opportunities have to count
     towards min-content width or the menu just grows past the viewport (and
     gets clipped) instead of wrapping. */
  overflow-wrap: anywhere;
  &:hover {
    color: ${colors.black};
  }
  &.active {
    color: ${(props) => props.theme.colors.tenantPrimary};
  }
`;

interface Props extends NavbarChildLink {
  navigationItemTitle: string;
  onClick: () => void;
  scrollToTop?: boolean;
}

// A child link inside an expanded mobile navbar dropdown.
const FullMobileNavMenuDropdownItem = ({
  to,
  params,
  navigationItemTitle,
  onClick,
  scrollToTop,
}: Props) => (
  <Item>
    <StyledLink
      onClick={onClick}
      to={to}
      params={params}
      scrollToTop={scrollToTop}
    >
      {navigationItemTitle}
    </StyledLink>
  </Item>
);

export default FullMobileNavMenuDropdownItem;
