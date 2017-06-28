import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Icon from 'components/Icon';
import Error from 'components/UI/Error';
import _ from 'lodash';

const InputWrapper = styled.div`
  position: relative;

  input {
    width: 100%;
    color: #333;
    font-size: 17px;
    line-height: 22px;
    font-weight: 300;
    padding: 12px;
    padding-right: ${(props) => props.error ? '40px' : '12px'};
    border-radius: 5px;
    border: solid 1px;
    border-color: ${(props) => props.error ? '#fc3c2d' : '#ccc'};
    background: #fff;
    outline: none;

    &:not(:focus):hover {
      border-color: ${(props) => props.error ? '#fc3c2d' : '#999'};
    }

    &:focus {
      border-color: ${(props) => props.error ? '#fc3c2d' : '#000'};
    }
  }
`;

const IconWrapper = styled.div`
  width: 22px;
  position: absolute;
  top: 13px;
  right: 13px;
  z-index: 1;

  svg  {
    fill: red;
  }
`;

const emptyString = '';

const Input = ({ value, placeholder, error, onChange, setRef }) => {
  const hasError = (_.isString(error) && !_.isEmpty(error));

  const handleOnChange = (event) => {
    onChange(event.target.value);
  };

  const handleRef = (element) => {
    setRef(element);
  };

  return (
    <InputWrapper error={hasError}>
      <input
        type="text"
        placeholder={placeholder}
        value={value || emptyString}
        onChange={handleOnChange}
        ref={handleRef}
      />
      { hasError && <IconWrapper><Icon name="error" /></IconWrapper>}
      <Error text={error} />
    </InputWrapper>
  );
};

Input.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func,
  setRef: PropTypes.func,
};

Input.defaultProps = {
  value: '',
  placeholder: '',
  error: null,
};

export default Input;
