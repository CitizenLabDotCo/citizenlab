import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import {
  ImportedIdeaMetadataQueryParams,
  ImportedIdeaMetadataResponse,
  ImportedIdeaMetadataKeys,
} from './types';
import fetcher from 'utils/cl-react-query/fetcher';
import { importedIdeaMetadataKeys } from './keys';

const fetchImportedIdeaMetadata = ({ id }: ImportedIdeaMetadataQueryParams) =>
  fetcher<ImportedIdeaMetadataResponse>({
    path: `/dummy_endpoint/${id}`,
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
    keepPreviousData: false,
  });
};

export default useImportedIdeaMetadata;
