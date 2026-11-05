import appConfigurationKeys from 'api/app_configuration/keys';

import { queryClient } from 'utils/cl-react-query/queryClient';

import seatsKeys from './keys';

const invalidateSeatsCache = () => {
  // Since changes to the seat number and stuff are handled async by the backend,
  // it can take a time before these values are updated in the DB. That's why we wait
  // a little bit before invalidating.
  setTimeout(() => {
    queryClient.invalidateQueries({ queryKey: seatsKeys.all() });
    queryClient.invalidateQueries({ queryKey: appConfigurationKeys.all() });
  }, 2000);
};

export default invalidateSeatsCache;
