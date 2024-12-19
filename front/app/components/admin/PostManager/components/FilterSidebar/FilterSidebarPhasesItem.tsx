import React from 'react';

import { useDrop } from 'react-dnd';

import { IPhaseData } from 'api/phases/types';
import { canContainIdeas } from 'api/phases/utils';

import FilterRadioButton from './FilterRadioButton';

interface Props {
  phase: IPhaseData;
  name: string;
  onChange: () => void;
  isSelected: boolean;
  labelContent: React.ReactNode;
  id: string;
}

const FilterSidebarPhasesItem = ({
  phase,
  name,
  onChange,
  isSelected,
  labelContent,
  id,
}: Props) => {
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
        labelContent={labelContent}
        id={id}
      />
    </div>
  );
};

export default FilterSidebarPhasesItem;
