import React from 'react';

// components
import BaseProjectFilter from 'components/UI/ProjectFilter';

// typings
import { IOption } from 'typings';

interface Props {
  currentProjectFilter?: string | null;
  hideLabel?: boolean;
  placeholder?: string;
  onProjectFilter: (filter: IOption) => void;
}

const ProjectFilter = ({
  currentProjectFilter,
  hideLabel,
  placeholder,
  onProjectFilter,
}: Props) => {
  return (
    <BaseProjectFilter
      className="intercom-admin-project-filter"
      projectId={currentProjectFilter ?? undefined}
      hideLabel={hideLabel}
      placeholder={placeholder}
      onProjectFilter={onProjectFilter}
    />
  );
};

export default ProjectFilter;
