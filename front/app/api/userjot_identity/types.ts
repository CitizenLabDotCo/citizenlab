import { Keys } from 'utils/cl-react-query/types';

import userjotIdentityKeys from './keys';

export type UserjotIdentityKeys = Keys<typeof userjotIdentityKeys>;

export interface IUserjotIdentity {
  data: {
    type: 'userjot_identity';
    attributes: {
      project_id: string;
      signature: string;
    };
  };
}
