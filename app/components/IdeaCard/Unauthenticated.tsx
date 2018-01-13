import * as React from 'react';
import styled from 'styled-components';
import { browserHistory } from 'react-router';
import { darken } from 'polished';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 22px 0;
`;

const RegisterLink = styled.span`
  color: ${(props) => props.theme.colorMain};
  font-size: 14px;
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
    browserHistory.push('/sign-in');
  }

  goToRegister = (event) => {
    event.preventDefault();
    event.stopPropagation();
    browserHistory.push('/sign-up');
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
