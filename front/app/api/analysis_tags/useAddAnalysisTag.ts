import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import tagsKeys from './keys';
import { ITag, ITagAdd } from './types';

const addAnalysisTag = async ({ name, analysisId }: ITagAdd) =>
  fetcher<ITag>({
    path: `/analyses/${analysisId}/tags`,
    action: 'post',
    body: { name },
  });

const useAddAnalysisTag = () => {
  const queryClient = useQueryClient();
  return useMutation<ITag, CLErrors, ITagAdd>({
    mutationFn: addAnalysisTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
    },
  });
};

export default useAddAnalysisTag;
