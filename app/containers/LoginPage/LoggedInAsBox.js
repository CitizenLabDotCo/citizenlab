// TODO enable eslint
/* eslint-disable */
import React from 'react';
import styled from 'styled-components';
import socialAuth from '../../socialAuth';

const Box = styled.div`
  padding: 20px;
  border: 1px solid #888;
  margin-bottom: 20px;
`;

export default (props) => {
  return (
    <Box>
      { socialAuth('facebook').isLoggedIn() ? 'logged in? yes' : 'logged in? no' }
    </Box>
  );
};
