import { Multiloc } from 'typings';

import { IUpdatedPhaseProperties } from 'api/phases/types';

export type CreatePhaseArguments = Omit<
  IUpdatedPhaseProperties,
  'project_id'
> & {
  title_multiloc: Multiloc;
  start_at: string;
};
