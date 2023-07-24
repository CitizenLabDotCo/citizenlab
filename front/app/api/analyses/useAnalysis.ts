import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import analysesKeys from './keys';
import { IAnalysis, AnalysesKeys } from './types';

const fetchAnalysis = ({ id }: { id: string }) =>
  fetcher<IAnalysis>({ path: `/analyses/${id}`, action: 'get' });

const useAnalysis = (id: string) => {
  return useQuery<IAnalysis, CLErrors, IAnalysis, AnalysesKeys>({
    queryKey: analysesKeys.item({ id }),
    queryFn: () => fetchAnalysis({ id }),
  });
};

export default useAnalysis;
