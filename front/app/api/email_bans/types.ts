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

export interface IEmailBanData {
  id: string;
  type: 'email_ban';
  attributes: {
    reason: string | null;
    created_at: string;
  };
  relationships: {
    banned_by: {
      data: { id: string; type: 'user' } | null;
    };
  };
}

export interface IEmailBanDetails {
  data: IEmailBanData;
}
