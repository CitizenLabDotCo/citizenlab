import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import inputsKeys from './keys';
import { IInputs, IInputsQueryParams, InputsKeys } from './types';

const defaultPageSize = 20;
const fetchInfiniteInputs = (
  analysisId: string,
  { pageNumber, pageSize, ...queryParams }: IInputsQueryParams
) =>
  fetcher<IInputs>({
    path: `/analyses/${analysisId}/inputs`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || defaultPageSize,
      ...queryParams,
    },
  });

const useInfiniteAnalysisInputs = ({
  analysisId,
  queryParams,
}: {
  analysisId: string;
  queryParams?: IInputsQueryParams;
}) => {
  return useInfiniteQuery<
    IInputs,
    CLErrors,
    InfiniteData<IInputs>,
    InputsKeys,
    number
  >({
    queryKey: inputsKeys.list({ analysisId, filters: queryParams }),
    queryFn: ({ pageParam }) =>
      fetchInfiniteInputs(analysisId, {
        ...queryParams,
        pageNumber: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const hasNextPage = lastPage.links?.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
    enabled: !!analysisId,
  });
};

export default useInfiniteAnalysisInputs;
