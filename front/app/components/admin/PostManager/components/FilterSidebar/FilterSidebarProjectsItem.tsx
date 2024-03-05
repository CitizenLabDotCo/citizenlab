import React from 'react';

import { useDrop } from 'react-dnd';
import { Menu } from 'semantic-ui-react';

import { IProjectData } from 'api/projects/types';

import T from 'components/T';

interface Props {
  project: IProjectData;
  active: boolean;
  onClick: any;
}

const FilterSidebarProjectsItem = ({ project, active, onClick }: Props) => {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'IDEA',
    drop: () => ({
      type: 'project',
      id: project.id,
    }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div ref={drop}>
      <Menu.Item
        className="e2e-idea-manager-project-filter-item"
        active={active || (isOver && canDrop)}
        onClick={onClick}
      >
        <T value={project.attributes.title_multiloc} />
      </Menu.Item>
    </div>
  );
};

export default FilterSidebarProjectsItem;
