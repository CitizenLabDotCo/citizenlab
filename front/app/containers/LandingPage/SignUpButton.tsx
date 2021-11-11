import React from 'react';
import Button from 'components/UI/Button';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const CTAButton = styled(Button).attrs(() => ({
  fontWeight: '500',
  padding: '13px 22px',
  buttonStyle: 'primary-inverse',
  className: 'e2e-signed-out-header-cta-button',
}))`
  margin-top: 38px;

  ${media.smallerThanMinTablet`
    margin-top: 30px;
  `}
`;

interface Props {
  signUpIn: (event) => void;
}

const SignUpButton = ({ signUpIn }: Props) => (
  <CTAButton
    onClick={signUpIn}
    text={<FormattedMessage {...messages.createAccount} />}
  />
);

export { SignUpButton, CTAButton };
