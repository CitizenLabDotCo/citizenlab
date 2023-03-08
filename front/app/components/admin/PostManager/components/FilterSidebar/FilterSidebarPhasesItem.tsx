import React from 'react';
import { IPhaseData, canContainIdeas } from 'services/phases';
import { Menu, Label } from 'semantic-ui-react';
import { useDrop } from 'react-dnd';
import T from 'components/T';

interface Props {
  phase: IPhaseData;
  active: boolean;
  onClick: any;
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
