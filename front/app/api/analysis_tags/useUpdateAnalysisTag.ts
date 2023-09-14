import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import analysesKeys from './keys';
import { ITag, ITagUpdate } from './types';

const updateTag = ({ id, analysisId, name }: ITagUpdate) =>
  fetcher<ITag>({
    path: `/analyses/${analysisId}/tags/${id}`,
    action: 'patch',
    body: { name },
  });

const useUpdateAnalysisTag = () => {
  const queryClient = useQueryClient();
  return useMutation<ITag, CLErrors, ITagUpdate>({
    mutationFn: updateTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analysesKeys.lists() });
    },
  });
};

export default useUpdateAnalysisTag;
