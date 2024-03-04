import React, { useCallback } from 'react';

import useAuthUser from 'api/me/useAuthUser';

import BaseProjectFilter from 'components/UI/ProjectFilter';

import { MessageDescriptor } from 'utils/cl-intl';
import dashboardFilterMessages from 'containers/Admin/dashboard/components/filters/messages';

import { isAdmin } from 'utils/permissions/roles';

interface Option {
  value: string | undefined;
  label: string;
}

interface Props {
  projectId?: string;
  emptyOptionMessage?: MessageDescriptor;
  onProjectFilter: (filter: Option) => void;
}

const ProjectFilter = ({
  projectId,
  emptyOptionMessage,
  onProjectFilter,
}: Props) => {
  const { data: authUser } = useAuthUser();

  const handleProjectFilter = useCallback(
    (option: Option) => {
      if (option.value === '') {
        onProjectFilter({ value: undefined, label: option.label });
      } else {
        onProjectFilter(option);
      }
    },
    [onProjectFilter]
  );

  const getEmptyOptionMessage = () => {
    if (isAdmin(authUser)) {
      return emptyOptionMessage ?? dashboardFilterMessages.allProjects;
    }

    return undefined;
  };

  return (
    <BaseProjectFilter
      id="e2e-report-builder-project-filter-box"
      width="100%"
      mb="20px"
      projectId={projectId}
      emptyOptionMessage={getEmptyOptionMessage()}
      onProjectFilter={handleProjectFilter}
    />
  );
};

export default ProjectFilter;
