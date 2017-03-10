// TODO enable eslint
/* eslint-disable */
import React from 'react';
import styled from 'styled-components';
import { LocalForm, Control } from 'react-redux-form';
import {
  Colors,
  Sizes,
  Button,
} from 'components/Foundation';

const Box = styled.div`
  padding: 20px;
  border: 1px solid #888;
  margin-bottom: 20px;
`;

export default (props) => {
  return (
      <Box>
        <LocalForm model="'auth'" onSubmit={props.onSubmit}>
        <label htmlFor=".clLoginFormEmail">Email
          <Control.text model=".email" className="clLoginFormEmail" required />
        </label>
        <label htmlFor=".clLoginFormEmail">Password
          <Control.text model=".password" className="clLoginFormPassword" required type="password" />
        </label>

        <Button>Login</Button>
      </LocalForm>
    </Box>
  );
};
