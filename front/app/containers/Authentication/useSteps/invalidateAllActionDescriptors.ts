import ideasKeys from 'api/ideas/keys';
import phasesKeys from 'api/phases/keys';
import phasesMiniKeys from 'api/phases_mini/keys';
import projectsKeys from 'api/projects/keys';

import { queryClient } from 'utils/cl-react-query/queryClient';

export const invalidateAllActionDescriptors = () => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ideasKeys.all() }),
    queryClient.invalidateQueries({ queryKey: projectsKeys.all() }),
    queryClient.invalidateQueries({ queryKey: phasesKeys.all() }),
    queryClient.invalidateQueries({ queryKey: phasesMiniKeys.all() }),
  ]);
};
