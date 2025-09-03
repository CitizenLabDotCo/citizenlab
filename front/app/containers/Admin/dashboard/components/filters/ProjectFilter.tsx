import React from 'react';

import { IOption } from 'typings';

import BaseProjectFilter from 'components/UI/ProjectFilter';

import messages from './messages';

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
      selectedProjectId={projectId}
      emptyOptionMessage={messages.allProjects}
      hideLabel={hideLabel}
      placeholder={placeholder}
      onProjectFilter={onProjectFilter}
    />
  );
};

export default ProjectFilter;
