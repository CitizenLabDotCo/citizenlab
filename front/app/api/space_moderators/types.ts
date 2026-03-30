import { Keys } from 'utils/cl-react-query/types';

import spaceModeratorsKeys from './keys';

export type SpaceModeratorsKeys = Keys<typeof spaceModeratorsKeys>;

export interface Params {
  user_id?: string;
  user_email?: string;
  spaceId: string;
}
