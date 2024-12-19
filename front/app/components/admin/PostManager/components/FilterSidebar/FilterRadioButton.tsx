import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { hideVisually } from 'polished';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import { canContainIdeas } from 'api/phases/utils';

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
  phase?: IPhaseData;
  labelContent: React.ReactNode;
}

const FilterRadioButton = ({
  onChange,
  isSelected,
  phase,
  labelContent,
}: Props) => {
  const radioId = phase?.id || 'all-phases';

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'IDEA',
    drop: () =>
      phase
        ? {
            type: 'phase',
            id: phase.id,
          }
        : undefined,
    canDrop() {
      return phase ? canContainIdeas(phase) : false;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <Box
      display="flex"
      alignItems="center"
      id={`e2e-item-${radioId}`}
      ref={drop}
    >
      <HiddenRadio
        id={radioId}
        name="selectedPhase"
        value={radioId}
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
