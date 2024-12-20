import React from 'react';

import { useDrop } from 'react-dnd';
import { Menu, Label } from 'semantic-ui-react';

import { IPhaseData } from 'api/phases/types';
import { canContainIdeas } from 'api/phases/utils';

import T from 'components/T';

interface Props {
  phase: IPhaseData;
  active: boolean;
  onClick: () => void;
  phaseNumber: number;
}

const FilterSidebarPhasesItem = ({
  phase,
  active,
  onClick,
  phaseNumber,
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

  const disabled = !canContainIdeas(phase);

  return (
    <div ref={drop}>
      <Menu.Item
        active={active || (isOver && canDrop)}
        onClick={onClick}
        disabled={disabled}
      >
        <Label circular={true} basic={true} color={disabled ? 'grey' : 'teal'}>
          {phaseNumber}
        </Label>
        <T value={phase.attributes.title_multiloc} />
      </Menu.Item>
    </div>
  );
};

export default FilterSidebarPhasesItem;
