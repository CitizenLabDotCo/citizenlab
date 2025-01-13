import React from 'react';

import { useDrop } from 'react-dnd';

import { IProjectData } from 'api/projects/types';

import T from 'components/T';

import FilterRadioButton from '../FilterRadioButton';

interface Props {
  project: IProjectData;
  active: boolean;
  onClick: any;
  name: string;
}

const FilterSidebarProjectsItem = ({
  project,
  active,
  onClick,
  name,
}: Props) => {
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
    <div ref={drop} className="e2e-idea-manager-project-filter-item">
      <FilterRadioButton
        id={project.id}
        name={name}
        isSelected={active || (isOver && canDrop)}
        onChange={onClick}
        labelContent={<T value={project.attributes.title_multiloc} />}
      />
    </div>
  );
};

export default FilterSidebarProjectsItem;
