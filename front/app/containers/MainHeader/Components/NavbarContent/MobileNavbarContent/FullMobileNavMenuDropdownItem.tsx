import React from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

import Link, { typedStyled, type TypedLinkProps } from 'utils/cl-router/Link';

const Item = styled.li`
  list-style: none;
`;

const StyledLink = typedStyled(Link)`
  display: block;
  color: ${colors.coolGrey700};
  font-size: ${fontSizes.s}px;
  line-height: 150%;
  &:hover {
    color: ${darken(0.2, colors.coolGrey700)};
  }
  &.active {
    color: ${(props) => props.theme.colors.tenantPrimary};
  }
`;

interface Props extends TypedLinkProps {
  navigationItemTitle: string;
  onClick: () => void;
  scrollToTop?: boolean;
}

// A child link inside an expanded mobile navbar dropdown.
const FullMobileNavMenuDropdownItem = ({
  to,
  params,
  search,
  navigationItemTitle,
  onClick,
  scrollToTop,
}: Props) => (
  <Item>
    <StyledLink
      onClick={onClick}
      to={to as Parameters<typeof StyledLink>[0]['to']}
      params={params as Parameters<typeof StyledLink>[0]['params']}
      search={search as Parameters<typeof StyledLink>[0]['search']}
      scrollToTop={scrollToTop}
    >
      {navigationItemTitle}
    </StyledLink>
  </Item>
);

export default FullMobileNavMenuDropdownItem;
