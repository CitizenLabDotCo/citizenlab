import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
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

  &:hover {
    background: ${({ theme: { colors } }) => colors.grey200};
  }

  background: ${({ theme: { colors }, selected }) =>
    selected ? colors.background : colors.white};

  ${HiddenRadio}.focus-visible + & {
    outline: 2px solid black;
  }
`;

interface Props {
  onChange: () => void;
  isSelected: boolean;
  phaseId?: string;
  labelContent: React.ReactNode;
}

const FilterRadioButton = ({
  onChange,
  isSelected,
  phaseId,
  labelContent,
}: Props) => {
  const radioId = phaseId || 'all-phases';

  return (
    <Box display="flex" alignItems="center" id={`e2e-item-${radioId}`}>
      <HiddenRadio
        id={radioId}
        name="selectedPhase"
        value={phaseId}
        checked={isSelected}
        onChange={onChange}
      />
      <Label htmlFor={radioId} onClick={onChange} selected={isSelected}>
        {labelContent}
      </Label>
    </Box>
  );
};

export default FilterRadioButton;
