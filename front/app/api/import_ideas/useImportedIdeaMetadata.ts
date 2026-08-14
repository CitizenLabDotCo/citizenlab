import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { NO_PLACEHOLDER_DATA } from 'utils/cl-react-query/queryClient';

import { importedIdeaMetadataKeys } from './keys';
import {
  ImportedIdeaMetadataQueryParams,
  ImportedIdeaMetadataResponse,
  ImportedIdeaMetadataKeys,
} from './types';

const fetchImportedIdeaMetadata = ({ id }: ImportedIdeaMetadataQueryParams) =>
  fetcher<ImportedIdeaMetadataResponse>({
    path: `/idea_imports/${id}`,
    action: 'get',
  });

const useImportedIdeaMetadata = (
  queryParams: ImportedIdeaMetadataQueryParams
) => {
  return useQuery<
    ImportedIdeaMetadataResponse,
    CLErrors,
    ImportedIdeaMetadataResponse,
    ImportedIdeaMetadataKeys
  >({
    queryKey: importedIdeaMetadataKeys.item(queryParams),
    queryFn: () => fetchImportedIdeaMetadata(queryParams),
    enabled: !!queryParams.id,
    placeholderData: NO_PLACEHOLDER_DATA,
  });
};

export default useImportedIdeaMetadata;
