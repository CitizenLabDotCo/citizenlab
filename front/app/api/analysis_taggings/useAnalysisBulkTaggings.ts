import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import taggingsKeys from './keys';
import { ITagging } from './types';
import tagsKeys from 'api/analysis_tags/keys';
import { IInputsFilterParams } from 'api/analysis_inputs/types';

type IAddBulkTagging = {
  analysisId: string;
  tagId: string;
  filters: IInputsFilterParams;
};

const addAnalysisTagging = async ({
  analysisId,
  tagId,
  filters,
}: IAddBulkTagging) =>
  fetcher<ITagging>({
    path: `/analyses/${analysisId}/taggings/bulk_create`,
    action: 'post',
    body: {
      tag_id: tagId,
      filters,
    },
  });

const useAddAnalysisBulkTagging = () => {
  const queryClient = useQueryClient();
  return useMutation<ITagging, CLErrors, IAddBulkTagging>({
    mutationFn: addAnalysisTagging,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taggingsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: tagsKeys.lists(),
      });
    },
  });
};

export default useAddAnalysisBulkTagging;
