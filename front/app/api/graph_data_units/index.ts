import { UsersByGenderResponse } from './responseTypes';
import { GenderProps } from './requestTypes';
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
