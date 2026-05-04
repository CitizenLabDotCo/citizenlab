import React from 'react';

import { media } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import type { LinkProps } from '@tanstack/react-router';

const StyledButton = styled(ButtonWithLink)`
  ${media.tablet`
  order: 1;
  margin-right: 10px;
`}

  ${media.phone`
  margin-bottom: 10px;
  margin-right: 0px;
`}
`;

interface Props {
  onClick?: () => void;
  to?: LinkProps['to'];
  params?: Record<string, string>;
  search?: Record<string, unknown>;
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
