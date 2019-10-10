import React, { PureComponent, FormEvent } from 'react';
import styled from 'styled-components';
import clHistory from 'utils/cl-router/history';
import { darken } from 'polished';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { fontSizes } from 'utils/styleUtils';
import Link from 'utils/cl-router/Link';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 22px 0;
`;

const RegisterLink = styled(Link)`
  color: ${(props) => props.theme.colorMain};
  font-size: ${fontSizes.small}px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colorMain)};
  }
`;

export default class Unauthenticated extends PureComponent {
  goToLogin = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    clHistory.push('/sign-in');
  }

  stopPropagation = (event: FormEvent) => {
    event.stopPropagation();
  }

  render() {
    return (
      <Container>
        <Button onClick={this.goToLogin} className="e2e-login-button">
          <FormattedMessage {...messages.login} />
        </Button>
        <RegisterLink to="/sign-up" onClick={this.stopPropagation} className="e2e-register-button">
          <FormattedMessage {...messages.register} />
        </RegisterLink>
      </Container>
    );
  }
}
