import { Multiloc } from 'typings';

import { IEventProperties } from 'api/events/types';

export type CreateEventArguments = Omit<IEventProperties, 'project_id'> & {
  title_multiloc: Multiloc;
  start_at: string;
  end_at: string;
};
