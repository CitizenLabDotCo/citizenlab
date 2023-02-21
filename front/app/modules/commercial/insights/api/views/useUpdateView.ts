import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import viewsKeys from './keys';
import { IInsightsView } from './types';

interface IInsightViewUpdateObject {
  id: string;
  requestBody: { view: { name: string } };
}

const updateView = ({ id, requestBody }: IInsightViewUpdateObject) =>
  fetcher<IInsightsView>({
    path: `/insights/views/${id}`,
    action: 'patch',
    body: requestBody,
  });

const useUpdateView = () => {
  const queryClient = useQueryClient();
  return useMutation<IInsightsView, CLErrors, IInsightViewUpdateObject>({
    mutationFn: updateView,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: viewsKeys.lists() });
    },
  });
};

export default useUpdateView;
