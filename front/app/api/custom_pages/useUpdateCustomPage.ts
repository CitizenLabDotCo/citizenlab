import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import navbarKeys from 'api/navbar/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import customPageKeys from './keys';
import { ICustomPage, ICustomPageUpdate } from './types';

const updateCustomPage = ({
  id,
  ...requestBody
}: ICustomPageUpdate & { id: string }) =>
  fetcher<ICustomPage>({
    path: `/static_pages/${id}`,
    action: 'patch',
    body: { static_page: requestBody },
  });

const useUpdateCustomPage = () => {
  const queryClient = useQueryClient();
  return useMutation<ICustomPage, CLErrors, ICustomPageUpdate & { id: string }>(
    {
      mutationFn: updateCustomPage,
      onSuccess: async () => {
        // `all()` so project-scoped lists are also invalidated.
        queryClient.invalidateQueries({ queryKey: customPageKeys.all() });
        queryClient.invalidateQueries({ queryKey: navbarKeys.lists() });
      },
    }
  );
};

export default useUpdateCustomPage;
