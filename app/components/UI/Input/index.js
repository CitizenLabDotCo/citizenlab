import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const InputWrapper = styled.div`
  input {
    width: 100%;
    color: #333;
    font-size: 17px;
    line-height: 22px;
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
  }
`;

const Input = ({ value, placeholder, onChange, setRef }) => {
  const handleOnChange = (event) => {
    onChange(event.target.value);
  };

  const handleRef = (element) => {
    setRef(element);
  };

  return (
    <InputWrapper>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleOnChange}
        ref={handleRef}
      />
    </InputWrapper>
  );
};

Input.propTypes = {
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  setRef: PropTypes.func.isRequired,
};

export default Input;
