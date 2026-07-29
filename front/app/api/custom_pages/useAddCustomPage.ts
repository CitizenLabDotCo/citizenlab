import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';

import navbarKeys from 'api/navbar/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import customPagesKeys from './keys';
import { ICustomPage } from './types';

type AddCustomPage = {
  title_multiloc: Multiloc;
  project_id?: string; // Set to scope the page to a project, otherwise global
  top_info_section_multiloc?: Multiloc;
  top_info_section_enabled?: boolean;
  files_section_enabled?: boolean;
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
      // `all()` so project-scoped lists are also invalidated.
      queryClient.invalidateQueries({ queryKey: customPagesKeys.all() });
      queryClient.invalidateQueries({ queryKey: navbarKeys.lists() });
    },
  });
};

export default useAddCustomPage;
