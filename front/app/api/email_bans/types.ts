import { Keys } from 'utils/cl-react-query/types';

import emailBansKeys from './keys';

export type EmailBansKeys = Keys<typeof emailBansKeys>;

export interface IEmailBansCount {
  data: {
    type: 'email_bans_count';
    attributes: {
      count: number;
    };
  };
}

export interface IEmailBanDetails {
  data: {
    type: 'email_ban';
    attributes: {
      id: string;
      reason: string | null;
    };
  };
}
