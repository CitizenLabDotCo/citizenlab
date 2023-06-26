import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import experimentsKeys from './keys';
import { IExperiments, ExperimentsKeys } from './types';

const fetchExperiments = () =>
  fetcher<IExperiments>({
    path: '/experiments',
    action: 'get',
  });

const useExperiments = () => {
  return useQuery<IExperiments, CLErrors, IExperiments, ExperimentsKeys>({
    queryKey: experimentsKeys.all(),
    queryFn: fetchExperiments,
  });
};

export default useExperiments;
