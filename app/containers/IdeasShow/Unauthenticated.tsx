import * as React from 'react';
import styled from 'styled-components';
import { browserHistory } from 'react-router';
import { darken } from 'polished';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';


const VerticalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StyledButton = styled(Button)`
  margin-bottom: 8px;
`;

const Separator = styled.div`
  color: #999;
  font-size: 14px;
  font-weight: 300;
`;

const RegisterLink = styled.span`
  color: ${(props) => props.theme.colorMain};
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  text-align: center;
  cursor: pointer;
  margin-top: 8px;
  margin-bottom: 8px;

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
      <VerticalContainer>
        <StyledButton onClick={this.goToLogin}><FormattedMessage {...messages.login} /></StyledButton>
        <Separator>or</Separator>
        <RegisterLink onClick={this.goToRegister}><FormattedMessage {...messages.register} /></RegisterLink>
      </VerticalContainer>
    );
  }
}
