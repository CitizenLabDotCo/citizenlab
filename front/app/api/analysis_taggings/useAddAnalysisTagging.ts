import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import taggingsKeys from './keys';
import { ITagging, IAddTagging } from './types';
import tagsKeys from 'api/analysis_tags/keys';

const addAnalysisTagging = async ({
  inputId,
  analysisId,
  tagId,
}: IAddTagging) =>
  fetcher<ITagging>({
    path: `/analyses/${analysisId}/taggings`,
    action: 'post',
    body: {
      tagging: {
        tag_id: tagId,
        input_id: inputId,
      },
    },
  });

const useAddAnalysisTagging = () => {
  const queryClient = useQueryClient();
  return useMutation<ITagging, CLErrors, IAddTagging>({
    mutationFn: addAnalysisTagging,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taggingsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: tagsKeys.lists(),
      });
    },
  });
};

export default useAddAnalysisTagging;
