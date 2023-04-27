import { Keys } from 'utils/cl-react-query/types';
import membershipsKeys from './keys';

export type MembershipsKeys = Keys<typeof membershipsKeys>;

export interface IGroupMembership {
  id: string;
  type: 'membership';
  relationships: {
    user: {
      data: {
        id: string;
        type: 'user';
      };
    };
  };
}

export interface IGroupMemberships {
  data: IGroupMembership[];
}

export type IParameters = {
  groupId: string;
  page: {
    size: number;
    number: number;
  };
};
