import React, { FormEvent } from 'react';
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const StyledInput = styled.input`
  background-color: rgba(0, 0, 0, 0);
  font-size: ${fontSizes.xxl}px;
  color: ${({ theme }) => theme.colors.textSecondary};
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
  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const newStrValue = e.currentTarget.value;

    if (!isNumeric(newStrValue)) return;
    const newValue = Number(newStrValue);

    if (newValue < 1) return;

    onChange(newValue < max ? newValue : max);
  };

  return (
    <StyledInput type="text" value={value.toString()} onChange={handleChange} />
  );
};

export default NumberInput;
