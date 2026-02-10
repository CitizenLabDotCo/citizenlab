import React from 'react';

import { useDrop } from 'react-dnd';

import { IInputTopicData } from 'api/input_topics/types';

import T from 'components/T';

import FilterRadioButton from '../FilterRadioButton';

interface Props {
  topic: IInputTopicData;
  active: boolean;
  onClick: any;
  name: string;
}

const FilterSidebarTopicsItem = ({ topic, active, onClick, name }: Props) => {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'IDEA',
    drop: () => ({
      type: 'topic',
      id: topic.id,
    }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div ref={drop}>
      <FilterRadioButton
        id={topic.id}
        name={name}
        labelContent={<T value={topic.attributes.full_title_multiloc} />}
        isSelected={active || (isOver && canDrop)}
        onChange={onClick}
      />
    </div>
  );
};

export default FilterSidebarTopicsItem;
