import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Input = styled.input`
  width: 100%;
  color: #333;
  font-size: 16px;
  font-weight: 400;
`;

function FormTextInput(props) {
  return (
    <Input type="text" />
  );
}

FormTextInput.propTypes = {
  children: PropTypes.any.isRequired,
};

export default FormTextInput;
