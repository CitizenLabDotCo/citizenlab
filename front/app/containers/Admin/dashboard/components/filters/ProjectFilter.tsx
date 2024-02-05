import React from 'react';

// components
import BaseProjectFilter from 'components/UI/ProjectFilter';

// i18n
import messages from './messages';

// typings
import { IOption } from 'typings';

interface Props {
  projectId?: string;
  hideLabel?: boolean;
  placeholder?: string;
  onProjectFilter: (filter: IOption) => void;
}

const ProjectFilter = ({
  projectId,
  hideLabel,
  placeholder,
  onProjectFilter,
}: Props) => {
  return (
    <BaseProjectFilter
      className="intercom-admin-project-filter"
      projectId={projectId}
      emptyOptionMessage={messages.allProjects}
      hideLabel={hideLabel}
      placeholder={placeholder}
      onProjectFilter={onProjectFilter}
    />
  );
};

export default ProjectFilter;
