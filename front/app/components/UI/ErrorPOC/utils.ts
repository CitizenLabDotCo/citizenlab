import { uniqBy } from 'lodash-es';
import { CLError } from 'typings';

import { IInviteError } from 'api/invites/types';

// Some api errors can be returned multiple times, we want to deduplicate them
export const dedupApiErrors = (errors: (CLError | IInviteError)[]) => {
  return uniqBy(errors, 'error');
};
