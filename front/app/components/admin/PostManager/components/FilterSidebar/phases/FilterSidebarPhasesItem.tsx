import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useDrop } from 'react-dnd';

import { IPhaseData } from 'api/phases/types';
import { canContainIdeas } from 'api/phases/utils';

import useLocalize from 'hooks/useLocalize';

import FilterRadioButton from '../FilterRadioButton';
import LabelContentWrapper from '../FilterRadioButton/LabelContentWrapper';

import CircledPhaseNumber from './CircledPhaseNumber';

interface Props {
  phase: IPhaseData;
  name: string;
  onChange: () => void;
  isSelected: boolean;
  id: string;
  phaseNumber: number;
}

const FilterSidebarPhasesItem = ({
  phase,
  name,
  onChange,
  isSelected,
  id,
  phaseNumber,
}: Props) => {
  const localize = useLocalize();
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'IDEA',
    drop: () => ({
      type: 'phase',
      id: phase.id,
    }),
    canDrop() {
      return canContainIdeas(phase);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div ref={drop}>
      <FilterRadioButton
        name={name}
        onChange={onChange}
        isSelected={isSelected || (isOver && canDrop)}
        labelContent={
          <LabelContentWrapper>
            {localize(phase.attributes.title_multiloc)}
            {/* Flex shrink needed to prevent number from becoming squished  */}
            <Box flexShrink={0}>
              <CircledPhaseNumber phaseNumber={phaseNumber} />
            </Box>
          </LabelContentWrapper>
        }
        id={id}
      />
    </div>
  );
};

export default FilterSidebarPhasesItem;
