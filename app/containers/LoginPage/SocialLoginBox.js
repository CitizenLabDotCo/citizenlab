// TODO enable eslint
/* eslint-disable */
import React from 'react';
import styled from 'styled-components';
import {
  Colors,
  Sizes,
  Button,
} from '../../components/Foundation';
import socialAuth from './../../socialAuth';

const Box = styled.div`
  padding: 20px;
  border: 1px solid #888;
`;

export default (props) => {
  const handleLoginClick = () => {
    socialAuth('facebook').login().then(props.onChange);
  };

  const handleLogoutClick = () => {
    socialAuth('facebook').logout();
    props.onChange();
  };

  return (
    <Box>
      <h4>Social Login</h4>

      {
        socialAuth('facebook').isLoggedIn() ?
          <Button onClick={() => handleLogoutClick()}>Logout</Button> :
          <Button className="clLoginBtn" onClick={() => handleLoginClick()}>Facebook</Button>
      }
    </Box>
  );
};
