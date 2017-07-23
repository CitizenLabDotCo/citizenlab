import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Error from 'components/UI/Error';

const emptyString = '';

const TextArea = ({ className, onInput, placeholder, value, rows, error, name }) => {
  const handleOnInput = (event) => {
    onInput(event.target.value, name);
  };

  return (<div>
    <textarea
      className={className}
      rows={rows || '1'}
      placeholder={placeholder}
      value={value || emptyString}
      onInput={handleOnInput}
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
