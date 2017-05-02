import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Sidebar from './Sidebar/';

const Box = styled.div`
  padding-top: 100px;
`;

export default class AdminPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <Box>
          <Sidebar />
          <div>{this.props.children}</div>
        </Box>
      </div>
    );
  }
}

AdminPage.propTypes = {
  children: PropTypes.any,
};
