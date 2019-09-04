// responsible for showing the form if it's not answered yet, the FormCompleted component otherwise
// showing details about the permissions
// sign up to fill in/ this project has specific requirements to participate, sign in to see if you comply ect
// the logic to validate and send the form and the form presentational component should be in this folder
// but in separate components.
import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';

import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

import FormCompleted from './FormCompleted';

import styled from 'styled-components';

const Container = styled.div`

`;

interface InputProps {
  // TODO pass in form
}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

class PollForm extends PureComponent<Props> {

  // TODO : if (userAnwsered) {} else ...
  render() {
    return (
      <Container>
        <FormCompleted />
      </Container>
    );
  }

}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <PollForm {...inputProps} {...dataProps} />}
  </Data>
);
