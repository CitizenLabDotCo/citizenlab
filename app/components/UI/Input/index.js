import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import Error from 'components/UI/Error';
import _ from 'lodash';

const InputWrapper = styled.div`
  position: relative;

  input {
    width: 100%;
    color: #333;
    font-size: 17px;
    line-height: 24px;
    font-weight: 400;
    padding: 12px;
    border-radius: 5px;
    border: solid 1px;
    border-color: ${(props) => props.error ? '#fc3c2d' : '#ccc'};
    background: #fff;
    outline: none;

    &::placeholder {
      color: #aaa;
      opacity: 1;
    }

    ${media.notPhone`
      padding-right: ${(props) => props.error && '40px'};
    `}

    &:not(:focus):hover {
      border-color: ${(props) => props.error ? '#fc3c2d' : '#999'};
    }

    &:focus {
      border-color: ${(props) => props.error ? '#fc3c2d' : '#000'};
    }
  }
`;

const emptyString = '';

const Input = ({ type, value, placeholder, error, onChange, setRef }) => {
  const hasError = (_.isString(error) && !_.isEmpty(error));

  const handleOnChange = (event) => {
    onChange(event.target.value);
  };

  const handleRef = (element) => {
    if (_.isFunction(setRef)) {
      setRef(element);
    }
  };

  return (
    <InputWrapper error={hasError}>
      <input
        type={type}
        placeholder={placeholder}
        value={value || emptyString}
        onChange={handleOnChange}
        ref={handleRef}
      />
      <Error text={error} />
    </InputWrapper>
  );
};

Input.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func,
  setRef: PropTypes.func,
};

Input.defaultProps = {
  type: 'text',
  value: '',
  placeholder: '',
  error: null,
};

export default Input;
