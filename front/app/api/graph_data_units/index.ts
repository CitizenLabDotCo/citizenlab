import {
  ActiveUsersResponse,
  UsersByBirthyearResponse,
  UsersByGenderResponse,
} from './responseTypes';
import { AgeProps, AnalyticsProps, GenderProps } from './requestTypes';
import useGraphDataUnits from './useGraphDataUnits';
import useGraphDataUnitsLive from './useGraphDataUnitsLive';

export const useUsersByGender = (props: GenderProps) => {
  return useGraphDataUnits<UsersByGenderResponse>({
    resolvedName: 'GenderWidget',
    props,
  });
};

export const useUsersByGenderLive = (props: GenderProps) => {
  return useGraphDataUnitsLive<UsersByGenderResponse>({
    resolvedName: 'GenderWidget',
    props,
  });
};

export const useUsersByAge = (props: AgeProps) => {
  return useGraphDataUnits<UsersByBirthyearResponse>({
    resolvedName: 'AgeWidget',
    props,
  });
};

export const useUsersByAgeLive = (props: AgeProps) => {
  return useGraphDataUnitsLive<UsersByBirthyearResponse>({
    resolvedName: 'AgeWidget',
    props,
  });
};

export const useActiveUsers = (
  props: AnalyticsProps,
  { onSuccess }: { onSuccess?: () => void }
) => {
  return useGraphDataUnits<ActiveUsersResponse>(
    {
      resolvedName: 'ActiveUsersWidget',
      props,
    },
    { onSuccess }
  );
};
