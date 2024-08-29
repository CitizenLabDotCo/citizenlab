import { Keys } from 'utils/cl-react-query/types';

import apiClientKeys from './keys';

export type APIClientKeys = Keys<typeof apiClientKeys>;

export interface IAPIClients {
  data: {
    id: string;
    type: 'api_client';
    attributes: {
      name: string;
      created_at: string;
      last_used_at: string | null;
      masked_secret: string;
    };
  }[];
}

export interface IAPIClientResponse {
  data: {
    id: string;
    type: 'api_client_unmasked';
    attributes: {
      secret: string;
    };
  };
}
