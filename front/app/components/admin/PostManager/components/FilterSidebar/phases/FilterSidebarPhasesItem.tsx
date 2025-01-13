import React from 'react';

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
            <CircledPhaseNumber phaseNumber={phaseNumber} />
          </LabelContentWrapper>
        }
        id={id}
      />
    </div>
  );
};

export default FilterSidebarPhasesItem;
