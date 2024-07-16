import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IIdeas } from 'api/ideas/types';

import fetcher from 'utils/cl-react-query/fetcher';

import { importedIdeasKeys } from './keys';
import { QueryParams, ImportedIdeasKeys } from './types';

const fetchImportedIdeas = ({ phaseId }: QueryParams) =>
  fetcher<IIdeas>({
    path: `/phases/${phaseId}/importer/draft_records/idea`,
    action: 'get',
  });
const useImportedIdeas = (
  queryParams: QueryParams,
  { pollingEnabled }: { pollingEnabled?: boolean } = {}
) => {
  return useQuery<IIdeas, CLErrors, IIdeas, ImportedIdeasKeys>({
    queryKey: importedIdeasKeys.list(queryParams),
    queryFn: () => fetchImportedIdeas(queryParams),
    refetchInterval: pollingEnabled ? 5000 : false,
  });
};

export default useImportedIdeas;
