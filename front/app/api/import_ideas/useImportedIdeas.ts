import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { QueryParams, ImportedIdeasKeys } from './types';
import { importedIdeasKeys } from './keys';
import { IIdeas } from 'api/ideas/types';

const fetchImportedIdeas = ({ projectId }: QueryParams) =>
  fetcher<IIdeas>({
    path: `/import_ideas/${projectId}/draft_ideas`,
    action: 'get',
  });

const useImportedIdeas = (queryParams: QueryParams) => {
  return useQuery<IIdeas, CLErrors, IIdeas, ImportedIdeasKeys>({
    queryKey: importedIdeasKeys.list(queryParams),
    queryFn: () => fetchImportedIdeas(queryParams),
  });
};

export default useImportedIdeas;
