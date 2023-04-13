import { useMutation, useQueryClient } from '@tanstack/react-query';
import ideaFilterCountsKeys from 'api/ideas_filter_counts/keys';
import ideasCountKeys from 'api/idea_count/keys';
import ideaImagesKeys from 'api/idea_images/keys';
import ideaMarkersKeys from 'api/idea_markers/keys';
import { API_PATH } from 'containers/App/constants';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import streams from 'utils/streams';
import ideasKeys from './keys';
import { IIdea, IIdeaAdd } from './types';

const addIdea = async (requestBody: IIdeaAdd) =>
  fetcher<IIdea>({
    path: `/ideas`,
    action: 'post',
    body: { idea: requestBody },
  });

const useAddIdea = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdea, CLErrors, IIdeaAdd>({
    mutationFn: addIdea,
    onSuccess: (idea) => {
      queryClient.invalidateQueries({ queryKey: ideasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ideaMarkersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ideaFilterCountsKeys.all() });
      queryClient.invalidateQueries({ queryKey: ideasCountKeys.items() });
      queryClient.invalidateQueries({
        queryKey: ideaImagesKeys.list({ ideaId: idea.data.id }),
      });
      queryClient.invalidateQueries({
        queryKey: ideaImagesKeys.item({ ideaId: idea.data.id }),
      });
      streams.fetchAllWith({
        dataId: [idea.data.relationships?.project.data.id],
        apiEndpoint: [`${API_PATH}/analytics`],
      });
    },
  });
};

export default useAddIdea;
