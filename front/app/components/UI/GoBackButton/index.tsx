import React, { FormEvent } from 'react';

import styled from 'styled-components';

import ButtonWithLink, { ButtonProps } from 'components/UI/ButtonWithLink';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

import type { LinkProps } from '@tanstack/react-router';

const Container = styled.div`
  display: inline-block;
`;

type Props = {
  onClick?: (arg: FormEvent) => void;
  className?: string;
  customMessage?: MessageDescriptor;
  to?: LinkProps['to'];
  params?: Record<string, string>;
  search?: Record<string, unknown>;
  linkTo?: string;
  showGoBackText?: boolean;
} & ButtonProps;

const GoBackButton = ({
  onClick,
  className,
  customMessage,
  to,
  params,
  search,
  linkTo,
  showGoBackText = true,
  buttonStyle = 'text',
  ...buttonProps
}: Props) => {
  return (
    <Container className={className || ''}>
      <ButtonWithLink
        id="e2e-go-back-button"
        onClick={onClick}
        icon="arrow-left"
        padding="0px"
        text={
          showGoBackText ? (
            <FormattedMessage {...(customMessage || messages.goBack)} />
          ) : undefined
        }
        data-testid="goBackButton"
        to={to}
        params={params}
        search={search}
        linkTo={linkTo}
        buttonStyle={buttonStyle}
        {...buttonProps}
      />
    </Container>
  );
};

export default GoBackButton;
