import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import navbarKeys from 'api/navbar/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import customPageKeys from './keys';
import { ICustomPage, ICustomPageAttributes } from './types';

const updateCustomPage = ({
  id,
  ...requestBody
}: Partial<ICustomPageAttributes> & { id: string }) =>
  fetcher<ICustomPage>({
    path: `/static_pages/${id}`,
    action: 'patch',
    body: { static_page: requestBody },
  });

const useUpdateCustomPage = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ICustomPage,
    CLErrors,
    Partial<ICustomPageAttributes> & { id: string }
  >({
    mutationFn: updateCustomPage,
    onSuccess: async () => {
      // `all()` (not `lists()`) so project-scoped lists, keyed with
      // `parameters: { projectId }`, are also invalidated, plus the item query.
      queryClient.invalidateQueries({ queryKey: customPageKeys.all() });
      queryClient.invalidateQueries({ queryKey: navbarKeys.lists() });
    },
  });
};

export default useUpdateCustomPage;
