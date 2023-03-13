import React from 'react';
import { ITopicData } from 'services/topics';
import T from 'components/T';
import { Menu } from 'semantic-ui-react';
import { useDrop } from 'react-dnd';

interface Props {
  topic: ITopicData;
  active: boolean;
  onClick: any;
}

const FilterSidebarTopicsItem = ({ topic, active, onClick }: Props) => {
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
      <Menu.Item active={active || (isOver && canDrop)} onClick={onClick}>
        <T value={topic.attributes.title_multiloc} />
      </Menu.Item>
    </div>
  );
};

export default FilterSidebarTopicsItem;
