import React from 'react';
import styled from 'styled-components';
import { LocalForm, Control } from 'react-redux-form';
import {
  Button,
} from 'components/Foundation';

const Box = styled.div`
  padding: 20px;
  border: 1px solid #888;
`;

const initialState = {
  name: '',
  email: '',
  password: '',
};

const Form = (props) => (
  <Box>
    <LocalForm
      noValidate
      model="registration"
      initialState={initialState}
      getDispatch={props.getDispatch}
      onSubmit={props.onSubmit}
    >
      <label htmlFor=".clRegistrationFormName">Name
        <Control.text model=".name" className="clRegistrationFormName" required />
      </label>

      <label htmlFor=".clRegistrationFormEmail">Email
        <Control.text model=".email" className="clRegistrationFormEmail" required />
      </label>

      <label htmlFor=".clRegistrationFormPassword">Password
        <Control.text model=".password" className="clRegistrationFormPassword" required />
      </label>

      <Button>Submit</Button>
    </LocalForm>
  </Box>
);

Form.propTypes = {
  getDispatch: React.PropTypes.func,
  onSubmit: React.PropTypes.func,
};

export default Form;
