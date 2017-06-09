import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Label = styled.label`
  color: #333;
  font-size: 16px;
  font-weight: 400;
  display: flex;
  padding-bottom: 4px;
`;

function FormLabel(props) {
  return (
    <Label>{props.children}</Label>
  );
}

FormLabel.propTypes = {
  children: PropTypes.any.isRequired,
};

export default FormLabel;
