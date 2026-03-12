import React, { FormEvent } from 'react';

import { RouteType } from 'routes';
import styled from 'styled-components';

import ButtonWithLink, { ButtonProps } from 'components/UI/ButtonWithLink';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

const Container = styled.div`
  display: inline-block;
`;

type Props = {
  onClick?: (arg: FormEvent) => void;
  className?: string;
  customMessage?: MessageDescriptor;
  linkTo?: RouteType;
  showGoBackText?: boolean;
} & ButtonProps;

const GoBackButton = ({
  onClick,
  className,
  customMessage,
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
        linkTo={linkTo}
        buttonStyle={buttonStyle}
        {...buttonProps}
      />
    </Container>
  );
};

export default GoBackButton;
