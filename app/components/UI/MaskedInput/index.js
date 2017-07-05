import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import Error from 'components/UI/Error';
import _ from 'lodash';
import * as MaskedTextInput from 'react-text-mask';

const InputWrapper = styled.div`
  position: relative;

  input {
    width: 100%;
    color: #333;
    font-size: 17px;
    line-height: 22px;
    font-weight: 300;
    padding: 12px;
    border-radius: 5px;
    border: solid 1px;
    border-color: ${(props) => props.error ? '#fc3c2d' : '#ccc'};
    background: #fff;
    outline: none;

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

const MaskedInput = ({ type, value, placeholder, error, onChange, setRef }) => {
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
      <MaskedTextInput
        mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
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

MaskedInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func,
  setRef: PropTypes.func,
};

MaskedInput.defaultProps = {
  type: 'text',
  value: '',
  placeholder: '',
  error: null,
};

export default MaskedInput;
