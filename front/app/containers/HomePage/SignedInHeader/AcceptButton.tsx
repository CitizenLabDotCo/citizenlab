import React from 'react';

import { media, colors } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { type TypedLinkProps } from 'utils/cl-router/Link';

const StyledButton = styled(ButtonWithLink)`
  ${media.tablet`
  order: 1;
  margin-right: 10px;
`}

  ${media.phone`
  margin-bottom: 10px;
  margin-right: 0px;
`}

  && button:focus-visible,
  && button.focus-visible,
  && a:focus-visible,
  && a.focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.white}, 0 0 0 4px ${colors.black},
      0 0 0 6px ${colors.white};
  }
`;

interface Props extends TypedLinkProps {
  onClick?: () => void;
  linkTo?: string;
  className?: string;
  text: string;
}

const AcceptButton = ({
  onClick,
  to,
  params,
  search,
  linkTo,
  className,
  text,
}: Props) => {
  const theme = useTheme();

  return (
    <StyledButton
      text={text}
      buttonStyle="primary-inverse"
      onClick={onClick}
      to={to}
      params={params}
      search={search}
      linkTo={linkTo}
      textColor={theme.colors.tenantPrimary}
      textHoverColor={theme.colors.tenantPrimary}
      fontWeight="500"
      className={className}
    />
  );
};

export default AcceptButton;
