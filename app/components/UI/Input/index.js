import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledInput = styled.input`
  width: 100%;
  color: #333;
  font-size: 17px;
  line-height: 17px;
  font-weight: 300;
  padding: 12px;
  border-radius: 5px;
  border: solid 1px #ccc;
  background: #fff;
  outline: none;

  &:not(:focus):hover {
    border-color: #999;
  }

  &:focus {
    border-color: #000;
  }
`;

const Input = ({ value, placeholder, onChange }) => {
  const handleOnChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <StyledInput
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={handleOnChange}
    />
  );
};

Input.propTypes = {
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default Input;
