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
  first_name: '',
  last_name: '',
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
      <label htmlFor=".clRegistrationFormFirstName">First name
        <Control.text model=".first_name" className="clRegistrationFormFirstName" required />
      </label>

      <label htmlFor=".clRegistrationFormLastName">Last name
        <Control.text model=".last_name" className="clRegistrationFormLastName" required />
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
