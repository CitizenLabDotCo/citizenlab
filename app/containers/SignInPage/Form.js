import React from 'react';
import { LocalForm, Control } from 'react-redux-form';
import {
  Button,
} from 'components/Foundation';

const Form = (props) => (
  <LocalForm model="'auth'" onSubmit={props.onSubmit}>
    <label htmlFor=".clLoginFormEmail">Email
      <Control.text model=".email" className="clLoginFormEmail" required />
    </label>

    <label htmlFor=".clLoginFormEmail">Password
      <Control.text model=".password" className="clLoginFormPassword" required type="password" />
    </label>

    <Button>Login</Button>
  </LocalForm>
);

Form.propTypes = {
  onSubmit: React.PropTypes.func,
};

export default Form;
