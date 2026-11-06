import { IUpdatedPhaseProperties } from 'api/phases/types';

export type UpdatePhaseArguments = Omit<
  IUpdatedPhaseProperties,
  'project_id' | 'placement_type'
> & {
  phase_id: string;
};
