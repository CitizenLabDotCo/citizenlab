import React, { FormEvent } from 'react';

import styled from 'styled-components';

import ButtonWithLink, { ButtonProps } from 'components/UI/ButtonWithLink';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import { type TypedLinkProps } from 'utils/cl-router/Link';

import messages from './messages';

const Container = styled.div`
  display: inline-block;
`;

type Props = {
  onClick?: (arg: FormEvent) => void;
  className?: string;
  customMessage?: MessageDescriptor;
  linkTo?: string;
  showGoBackText?: boolean;
} & ButtonProps &
  TypedLinkProps;

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
