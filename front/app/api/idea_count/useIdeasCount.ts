// import { useQuery } from '@tanstack/react-query';
// import { CLErrors } from 'typings';

// import fetcher from 'utils/cl-react-query/fetcher';

// import ideasCountKeys from './keys';
// import { IdeasCountKeys, IQueryParameters, IIdeasCount } from './types';

// const fetchIdeasCount = (queryParams: IQueryParameters) =>
//   fetcher<IIdeasCount>({
//     path: `/stats/ideas_count`,
//     action: 'get',
//     queryParams,
//   });

// const useIdeasCount = (queryParams: IQueryParameters, enabled = true) => {
//   return useQuery<IIdeasCount, CLErrors, IIdeasCount, IdeasCountKeys>({
//     queryKey: ideasCountKeys.item(queryParams),
//     queryFn: () => fetchIdeasCount(queryParams),
//     enabled,
//   });
// };

// export default useIdeasCount;
