import { ILinks } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import causesKeys from './keys';

export type CosponsorshipsKeys = Keys<typeof causesKeys>;

export interface ICosponsorshipData {
  id: string;
  type: 'cosponsorship';
  attributes: {
    status: 'pending' | 'accepted';
    created_at: string;
    updated_at: string;
  };
  relationships: {
    user: {
      data: {
        id: string;
      };
    };
    idea: {
      data: null | {
        id: string;
      };
    };
  };
}

export interface ICosponsorships {
  data: ICosponsorshipData[];
  links: ILinks;
}

export interface ICosponsorship {
  data: ICosponsorshipData;
}

export interface ICosponsorshipParameters {
  ideaId: string;
}
