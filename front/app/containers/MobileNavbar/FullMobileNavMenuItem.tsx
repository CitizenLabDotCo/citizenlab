import React from 'react';

// styling
import styled from 'styled-components';
import { darken } from 'polished';
import { colors, fontSizes } from 'utils/styleUtils';

// components
import Link from 'utils/cl-router/Link';

// i18n
import T from 'components/T';
import { Multiloc } from 'typings';

const MenuItem = styled.li`
  font-size: ${fontSizes.base}px;
  display: flex;
  justify-content: center;
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
  navigationItemTitle: Multiloc;
  onlyActiveOnIndex?: boolean;
  onClick: () => void;
}

const FullMobileNavMenuItem = ({
  linkTo,
  navigationItemTitle,
  onClick,
  onlyActiveOnIndex,
}: Props) => (
  <MenuItem>
    <StyledLink
      onClick={onClick}
      to={linkTo}
      activeClassName="active"
      onlyActiveOnIndex={onlyActiveOnIndex}
    >
      <T value={navigationItemTitle} />
    </StyledLink>
  </MenuItem>
);

export default FullMobileNavMenuItem;
