import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import customPagesKeys from './keys';
import { ICustomPage } from './types';

type AddCustomPage = {
  title_multiloc: Multiloc;
};

const addCustomPage = async (requestBody: AddCustomPage) =>
  fetcher<ICustomPage>({
    path: '/static_pages',
    action: 'post',
    body: { static_page: requestBody },
  });

const useAddCustomPage = () => {
  const queryClient = useQueryClient();
  return useMutation<ICustomPage, CLErrors, AddCustomPage>({
    mutationFn: addCustomPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customPagesKeys.lists() });
    },
  });
};

export default useAddCustomPage;
