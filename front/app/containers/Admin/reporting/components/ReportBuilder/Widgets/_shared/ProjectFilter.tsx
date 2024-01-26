import React, { useCallback } from 'react';

import useAuthUser from 'api/me/useAuthUser';

// components
import BaseProjectFilter from 'components/UI/ProjectFilter';

// i18n
import { MessageDescriptor } from 'utils/cl-intl';
import dashboardFilterMessages from 'containers/Admin/dashboard/components/filters/messages';

// utils
import { isAdmin } from 'utils/permissions/roles';

interface Option {
  value: string | undefined;
  label: string;
}

interface Props {
  projectId?: string;
  emptyValueMessage?: MessageDescriptor;
  onProjectFilter: (filter: Option) => void;
}

const ProjectFilter = ({
  projectId,
  emptyValueMessage,
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
    if (emptyValueMessage) return emptyValueMessage;
    if (isAdmin(authUser)) return dashboardFilterMessages.allProjects;
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
