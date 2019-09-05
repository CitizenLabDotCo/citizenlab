// responsible for showing the form if it's not answered yet, the FormCompleted component otherwise
// showing details about the permissions
// sign up to fill in/ this project has specific requirements to participate, sign in to see if you comply ect
// the logic to validate and send the form and the form presentational component should be in this folder
// but in separate components.
import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';

import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

import PollForm from './PollForm';
import FormCompleted from './FormCompleted';

import styled from 'styled-components';

const Container = styled.div`
  color: ${({ theme }) => theme.colorText};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

interface InputProps {
  id: string;
  type: 'projects' | 'phases';
}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps { }

class PollSection extends PureComponent<Props> {

  render() {
    return (
      <Container>
        <PollForm />
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  // poll questions
  // phase or project action desc?
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <PollSection {...inputProps} {...dataProps} />}
  </Data>
);
