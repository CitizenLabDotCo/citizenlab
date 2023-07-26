import React, { useState, FormEvent } from 'react';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const StyledInput = styled.input`
  background-color: rgba(0, 0, 0, 0);
  font-size: ${fontSizes.xxl}px;
  font-weight: 600;
  color: ${colors.black};
  width: 50px;
  &:focus {
    outline-width: 0;
  }
`;

interface Props {
  value: number;
  max: number;
  onChange: (newValue: number) => void;
}

const isNumeric = (value: string) => Number(value).toString() === value;

const NumberInput = ({ value, max, onChange }: Props) => {
  const [isEmpty, setIsEmpty] = useState(false);

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const newStrValue = e.currentTarget.value;

    if (newStrValue === '') {
      setIsEmpty(true);
      return;
    }

    if (!isNumeric(newStrValue)) return;
    const newValue = Number(newStrValue);

    if (newValue < 1) return;

    onChange(newValue < max ? newValue : max);
    setIsEmpty(false);
  };

  const handleBlur = () => {
    isEmpty ? onChange(0) : null;
  };

  return (
    <StyledInput
      type="text"
      value={isEmpty ? '' : value.toString()}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

export default NumberInput;
