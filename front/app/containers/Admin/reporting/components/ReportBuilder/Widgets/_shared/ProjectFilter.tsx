import React, { useCallback } from 'react';

import useAuthUser from 'api/me/useAuthUser';
import { ParticipationMethod } from 'api/phases/types';

import dashboardFilterMessages from 'containers/Admin/dashboard/components/filters/messages';

import BaseProjectFilter from 'components/UI/ProjectFilter';

import { MessageDescriptor } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

interface Option {
  value: string | undefined;
  label: string;
}

interface Props {
  id?: string;
  projectId?: string;
  participationMethods?: ParticipationMethod[];
  placeholder?: string;
  emptyOptionMessage?: MessageDescriptor;
  onProjectFilter: (filter: Option) => void;
}

const ProjectFilter = ({
  id,
  projectId,
  participationMethods,
  placeholder,
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

  if (!authUser) {
    return null;
  }

  const getEmptyOptionMessage = () => {
    if (isAdmin(authUser)) {
      return emptyOptionMessage ?? dashboardFilterMessages.allProjects;
    }

    return undefined;
  };

  return (
    <BaseProjectFilter
      id={id || 'e2e-report-builder-project-filter-box'}
      width="100%"
      mb="20px"
      selectedProjectId={projectId}
      participationMethods={participationMethods}
      placeholder={placeholder}
      emptyOptionMessage={getEmptyOptionMessage()}
      onProjectFilter={handleProjectFilter}
      includeHiddenProjects
      isClearable={isAdmin(authUser)}
    />
  );
};

export default ProjectFilter;
