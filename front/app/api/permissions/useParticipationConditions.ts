import fetcher from 'utils/cl-react-query/fetcher';
import { ParticipationConditionsResponse } from './types';

export const fetchParticipationConditions = ({ type }: Params) => {
  fetcher<ParticipationConditionsResponse>({
    path: `/app_configuration`,
    action: 'get',
  });
};
