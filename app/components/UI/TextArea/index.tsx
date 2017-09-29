import * as React from 'react';
import styled from 'styled-components';
import Error from 'components/UI/Error';

const emptyString = '';

interface Props {
  className?: string;
  name: string;
  onInput?: Function;
  onChange?: Function;
  placeholder?: string;
  value?: string;
  rows?: number;
  error: string | null;
}

const TextArea = ({ className, onInput, onChange, placeholder, value, rows, error, name }: Props) => {
  const handleOnInput = (event) => {
    if (onInput) onInput(event.target.value, name);
  };

  const handleOnChange = (event) => {
    if (onChange) onChange(event.target.value, name);
  };


  return (
    <div>
      <textarea
        className={className}
        rows={rows || 1}
        placeholder={placeholder}
        value={value || emptyString}
        onInput={handleOnInput}
        onChange={handleOnChange}
      />
      <Error text={error} />
    </div>
  );
};

export default styled(TextArea)`
  width: 100%;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #a6a6a6;
  font-size: 1.25rem;
  padding: 10px;
  resize: none;
`;
