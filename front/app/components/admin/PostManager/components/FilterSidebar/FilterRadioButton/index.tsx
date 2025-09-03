import React from 'react';

import { hideVisually } from 'polished';
import styled from 'styled-components';

const HiddenRadio = styled.input.attrs({ type: 'radio' })`
  ${hideVisually()};
`;

const Label = styled.label<{ selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius};
  width: 100%;
  font-size: ${({ theme }) => theme.fontSizes.s}px;
  color: ${({ theme: { colors } }) => colors.blue500};
  background: ${({ theme: { colors }, selected }) =>
    selected ? colors.background : colors.white};

  &:hover {
    background: ${({ theme: { colors } }) => colors.grey200};
  }

  ${HiddenRadio}.focus-visible + & {
    outline: 2px solid black;
  }
`;

interface Props {
  onChange: () => void;
  isSelected: boolean;
  id: string;
  labelContent: React.ReactNode;
  name: string;
}

const FilterRadioButton = ({
  onChange,
  isSelected,
  id,
  labelContent,
  name,
}: Props) => {
  return (
    <>
      <HiddenRadio
        id={id}
        name={name}
        checked={isSelected}
        onChange={onChange}
      />
      <Label htmlFor={id} onClick={onChange} selected={isSelected}>
        {labelContent}
      </Label>
    </>
  );
};

export default FilterRadioButton;
