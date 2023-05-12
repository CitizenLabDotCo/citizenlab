import { queryClient } from 'utils/cl-react-query/queryClient';
import initiativeActionDescriptorsKeys from 'api/initiative_action_descriptors/keys';
import ideasKeys from 'api/ideas/keys';
import projectsKeys from 'api/projects/keys';

export const invalidateAllActionDescriptors = () => {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: initiativeActionDescriptorsKeys.all(),
    }),
    queryClient.invalidateQueries({ queryKey: ideasKeys.all() }),
    queryClient.invalidateQueries({ queryKey: projectsKeys.all() }),
  ]);
};
