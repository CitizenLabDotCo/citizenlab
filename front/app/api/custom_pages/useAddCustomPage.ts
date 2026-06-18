import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';

import navbarKeys from 'api/navbar/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import customPagesKeys from './keys';
import { ICustomPage } from './types';

type AddCustomPage = {
  title_multiloc: Multiloc;
  // Set to scope the new page to a single project (project-scoped page).
  project_id?: string;
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
    onSuccess: async () => {
      // `all()` (not `lists()`) so project-scoped lists, keyed with
      // `parameters: { projectId }`, are also invalidated.
      queryClient.invalidateQueries({ queryKey: customPagesKeys.all() });
      queryClient.invalidateQueries({ queryKey: navbarKeys.lists() });
    },
  });
};

export default useAddCustomPage;
