import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Error from 'components/UI/Error';

const emptyString = '';

const TextArea = ({ className, onInput, onChange, placeholder, value, rows, error, name }) => {
  const handleOnInput = (event) => {
    if (onInput) onInput(event.target.value, name);
  };

  const handleOnChange = (event) => {
    if (onChange) onChange(event.target.value, name);
  };

  return (<div>
    <textarea
      className={className}
      rows={rows || '1'}
      placeholder={placeholder}
      value={value || emptyString}
      onInput={handleOnInput}
      onChange={handleOnChange}
    />
    <Error text={error} />
  </div>);
};

TextArea.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onInput: PropTypes.func,
  onChange: PropTypes.func,
  error: PropTypes.string,
  rows: PropTypes.number,
};

export default styled(TextArea)`
  width: 100%;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #a6a6a6;
  padding: 10px;
  resize: none;
`;
