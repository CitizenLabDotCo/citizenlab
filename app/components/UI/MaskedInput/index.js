import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import Error from 'components/UI/Error';
import _ from 'lodash';
import MaskedInput from 'react-text-mask';

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

    ::placeholder {
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

const MaskedTextInput = ({ value, placeholder, mask, error, onChange }) => {
  const hasError = (_.isString(error) && !_.isEmpty(error));

  const handleOnChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <InputWrapper error={hasError}>
      <MaskedInput
        guide={false}
        showMask={false}
        keepCharPositions={false}
        mask={mask}
        type="text"
        value={value || emptyString}
        placeholder={placeholder}
        onChange={handleOnChange}
      />
      <Error text={error} />
    </InputWrapper>
  );
};

MaskedTextInput.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  mask: PropTypes.any.isRequired,
  error: PropTypes.string,
  onChange: PropTypes.func,
};

MaskedTextInput.defaultProps = {
  value: '',
  placeholder: '',
  error: null,
};

export default MaskedTextInput;
