import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import backgroundTasksKeys from './keys';
import { AutoTaggingMethod, IBackgroundTask } from './types';
import { IInputsFilterParams } from 'api/analysis_inputs/types';

interface IAddAnalysis {
  analysisId: string;
  autoTaggingMethod: AutoTaggingMethod;
  tagsIds?: string[];
  filters?: IInputsFilterParams;
}

const launchAutoTagging = async ({
  analysisId,
  autoTaggingMethod,
  tagsIds,
  filters,
}: IAddAnalysis) =>
  fetcher<IBackgroundTask>({
    path: `/analyses/${analysisId}/auto_taggings`,
    action: 'post',
    body: {
      auto_tagging: {
        auto_tagging_method: autoTaggingMethod,
        tags_ids: tagsIds,
        filters,
      },
    },
  });

const useLaunchAnalysisAutotagging = () => {
  const queryClient = useQueryClient();
  return useMutation<IBackgroundTask, CLErrors, IAddAnalysis>({
    mutationFn: launchAutoTagging,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backgroundTasksKeys.lists() });
    },
  });
};

export default useLaunchAnalysisAutotagging;
