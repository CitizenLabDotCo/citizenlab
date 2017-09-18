import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// router
import { browserHistory } from 'react-router';

// components
import SignInUp from 'components/SignInUp';
import ContentContainer from 'components/ContentContainer';

// style
import styled from 'styled-components';

const StyledContentContainer = styled(ContentContainer)`
  margin-top: 120px;
`;

type Props = {};

type State = {};

export default class SignInPage extends React.PureComponent<Props, State> {
  onSuccess = () => {
    browserHistory.push('/');
  }

  render() {
    return (
      <StyledContentContainer>
        <SignInUp onSignInUpCompleted={this.onSuccess} show="signIn" />
      </StyledContentContainer>
    );
  }
}
