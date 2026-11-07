import { useQueryClient } from '@tanstack/react-query';

import eventsKeys from 'api/events/keys';
import phasePermissionKeys from 'api/phase_permissions/keys';
import phasesKeys from 'api/phases/keys';
import projectGroupsKeys from 'api/project_groups/keys';
import projectsKeys from 'api/projects/keys';

const useRefreshDraft = () => {
  const queryClient = useQueryClient();

  return () =>
    Promise.all(
      [
        projectsKeys.all(),
        phasesKeys.all(),
        phasePermissionKeys.all(),
        eventsKeys.all(),
        projectGroupsKeys.all(),
      ].map((queryKey) => queryClient.invalidateQueries({ queryKey }))
    );
};

export default useRefreshDraft;
