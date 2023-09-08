import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { QueryParams, ImportedIdeasKeys } from './types';
import { importedIdeasKeys } from './keys';
import { IIdeas } from 'api/ideas/types';

const fetchImportedIdeas = ({ projectId, phaseId }: QueryParams) =>
  fetcher<IIdeas>({
    path: phaseId
      ? `/phases/${phaseId}/import_ideas/draft_ideas`
      : `/projects/${projectId}/import_ideas/draft_ideas`,
    action: 'get',
  });
const useImportedIdeas = (queryParams: QueryParams) => {
  return useQuery<IIdeas, CLErrors, IIdeas, ImportedIdeasKeys>({
    queryKey: importedIdeasKeys.list(queryParams),
    queryFn: () => fetchImportedIdeas(queryParams),
  });
};

export default useImportedIdeas;
