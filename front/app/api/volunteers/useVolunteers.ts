import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import volunteersKeys from './keys';
import { IVolunteers, IVolunteersParameters, VolunteersKeys } from './types';

const fetchVolunteers = ({ phaseId, ...queryParams }: IVolunteersParameters) =>
  fetcher<IVolunteers>({
    path: `/phases/${phaseId}/volunteers`,
    action: 'get',
    queryParams,
  });

const useVolunteers = (parameters: IVolunteersParameters) => {
  return useQuery<IVolunteers, CLErrors, IVolunteers, VolunteersKeys>({
    queryKey: volunteersKeys.list(parameters),
    queryFn: () => fetchVolunteers(parameters),
  });
};

export default useVolunteers;
