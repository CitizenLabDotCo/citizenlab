import { queryClient } from 'utils/cl-react-query/queryClient';
import initiativeActionDescriptorsKeys from 'api/initiative_action_descriptors/keys';
import ideasKeys from 'api/ideas/keys';
import projectsKeys from 'api/projects/keys';
import { apiEndpoint as projectApiEndpoint } from 'services/projects';
import streams from 'utils/streams';

export const invalidateAllActionDescriptors = () => {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: initiativeActionDescriptorsKeys.all(),
    }),
    queryClient.invalidateQueries({ queryKey: ideasKeys.all() }),
    queryClient.invalidateQueries({ queryKey: projectsKeys.all() }),
    streams.fetchAllWith({
      partialApiEndpoint: [projectApiEndpoint],
    }),
  ]);
};
