import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledButton = styled.button`
  color: #333;
  font-size: 16px;
  font-weight: 500;
  padding-top: 8px;
  padding-bottom: 9px;
  padding-left: 15px;
  padding-right: 15px; 
  padding-top: 10px;
  border-radius: 5px;
  background: #e0e0e0;

  &:hover {
    background: #ccc;
  }
`;

function Button(props) {
  return (
    <StyledButton>{props.children}</StyledButton>
  );
}

Button.propTypes = {
  children: PropTypes.any.isRequired,
};

export default Button;
