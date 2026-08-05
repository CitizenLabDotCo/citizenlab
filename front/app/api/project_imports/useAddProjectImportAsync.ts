import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, SupportedLocale } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectImportKeys from './keys';

interface RequestParams {
  file: string;
  locale: SupportedLocale;
  preview?: boolean;
}

export interface IBulkImportProjectsResponse {
  data: {
    id: string;
    type: 'bulk_import_projects';
    attributes: {
      num_imports: number;
      preview: boolean;
    };
  };
}

const addProjectImport = async ({
  file,
  locale,
  preview = false,
}: RequestParams): Promise<IBulkImportProjectsResponse> =>
  fetcher<IBulkImportProjectsResponse>({
    path: `/importer/bulk_create_async/projects/`,
    action: 'post',
    body: { import: { file, locale, preview } },
  });

const useAddProjectImportAsync = () => {
  const queryClient = useQueryClient();

  return useMutation<IBulkImportProjectsResponse, CLErrors, RequestParams>({
    mutationFn: addProjectImport,
    onSuccess: (_) => {
      queryClient.invalidateQueries({
        queryKey: projectImportKeys.list({}),
      });
    },
  });
};

export default useAddProjectImportAsync;
