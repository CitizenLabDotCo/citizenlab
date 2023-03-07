import { Keys } from 'utils/cl-react-query/types';
import permissionsKeys from './keys';
import { Multiloc } from 'typings';

export type PermissionsKeys = Keys<typeof permissionsKeys>;

export interface ParticipationConditionsResponse {
  data: {
    id: string;
    type: 'participation_conditions';
    attributes: {
      participation_conditions: ParticipationConditions;
    };
  };
}

export type ParticipationConditions = Multiloc[][];
