import appConfigurationKeys from 'api/app_configuration/keys';

import { queryClient } from 'utils/cl-react-query/queryClient';

import seatsKeys from './keys';

const invalidateSeatsCache = () => {
  queryClient.invalidateQueries({ queryKey: seatsKeys.items() });
  queryClient.invalidateQueries({ queryKey: appConfigurationKeys.all() }); // invalidate additional seats that are stored in app config
};

export default invalidateSeatsCache;
