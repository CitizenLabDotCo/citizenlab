import * as React from 'react';
import styled from 'styled-components';
import clHistory from 'utils/cl-router/history';
import { darken } from 'polished';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  padding: 22px 0;
`;

const RegisterLink = styled.span`
  color: ${(props) => props.theme.colorMain};
  font-size: ${fontSizes.small};
  font-weight: 500;
  cursor: pointer;

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colorMain)};
  }
`;

export default class Unauthenticated extends React.PureComponent {
  goToLogin = (event) => {
    event.preventDefault();
    event.stopPropagation();
    clHistory.push('/sign-in');
  }

  goToRegister = (event) => {
    event.preventDefault();
    event.stopPropagation();
    clHistory.push('/sign-up');
  }

  render() {
    return (
      <Container>
        <Button onClick={this.goToLogin}><FormattedMessage {...messages.login} /></Button>
        <RegisterLink onClick={this.goToRegister}><FormattedMessage {...messages.register} /></RegisterLink>
      </Container>
    );
  }
}
