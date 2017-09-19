import * as React from 'react';

// router
import { browserHistory } from 'react-router';

// components
import ContentContainer from 'components/ContentContainer';
import SignUp from 'components/SignUp';

// style
import styled from 'styled-components';

const StyledContentContainer = styled(ContentContainer)`
  margin-top: 120px;
`;

type Props = {};

type State = {};

export default class RegisterPage extends React.PureComponent<Props, State> {
  onSuccess = () => {
    browserHistory.push('/');
  }

  render() {
    return (
      <StyledContentContainer>
        <SignUp onSignedUp={this.onSuccess} />
      </StyledContentContainer>
    );
  }
}
