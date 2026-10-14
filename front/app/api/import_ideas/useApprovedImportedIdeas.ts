import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IIdeas } from 'api/ideas/types';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import { importedIdeasKeys } from './keys';
import { QueryParams, ImportedIdeasKeys } from './types';

const PAGE_SIZE = 10;

const fetchApprovedImportedIdeas = (
  phaseId: string | undefined,
  pageNumber: number
) =>
  fetcher<IIdeas>({
    path: `/phases/${phaseId}/importer/approved_records/idea`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber,
      'page[size]': PAGE_SIZE,
    },
  });

// The key includes projectId so useUpdateIdea's importedIdeasKeys.list({ projectId })
// invalidation also refreshes this list on every approve and undo.
const useApprovedImportedIdeas = ({ projectId, phaseId }: QueryParams) => {
  return useInfiniteQuery<
    IIdeas,
    CLErrors,
    InfiniteData<IIdeas>,
    ImportedIdeasKeys,
    number
  >({
    queryKey: importedIdeasKeys.list({ projectId, phaseId, approved: true }),
    queryFn: ({ pageParam }) => fetchApprovedImportedIdeas(phaseId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return lastPage.links.next && pageNumber ? pageNumber + 1 : null;
    },
    enabled: !!phaseId,
  });
};

export default useApprovedImportedIdeas;
