import { Query, QueryClient } from '@tanstack/react-query';

import phasesMiniKeys from 'api/phases_mini/keys';

import phasesKeys from './keys';

type CachedPhase = {
  data?: { relationships?: { project?: { data?: { id: string } } } };
};

const belongsToProject = (projectId: string) => (query: Query) =>
  (query.state.data as CachedPhase | undefined)?.data?.relationships?.project
    ?.data?.id === projectId;

// Invalidates every cached phase (full and mini) of the given project, e.g.
// after publishing an input changed their action descriptors. Item queries are
// keyed by phase id only, so they are matched on the project in their data.
export const invalidateProjectPhases = (
  queryClient: QueryClient,
  projectId: string
) => {
  queryClient.invalidateQueries({ queryKey: phasesKeys.list({ projectId }) });
  queryClient.invalidateQueries({
    queryKey: phasesKeys.items(),
    predicate: belongsToProject(projectId),
  });
  queryClient.invalidateQueries({
    queryKey: phasesMiniKeys.all(),
    predicate: belongsToProject(projectId),
  });
};
