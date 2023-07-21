import { Keys } from 'utils/cl-react-query/types';
import { IRelationship } from 'typings';
import followerKeys from './keys';

export type FollowerKeys = Keys<typeof followerKeys>;

export interface IFollowerData {
  id: string;
  type: string;
  attributes: {
    created_at: string;
    updated_at: string;
  };
  relationships: {
    user: {
      data: IRelationship;
    };
    followable: {
      data: IRelationship;
    };
  };
}

export interface IFollower {
  data: IFollowerData;
}

export type FollowableType = 'projects' | 'folders' | 'ideas' | 'proposals';

export type FollowerAdd = {
  followableType: FollowableType;
  followableId: string;
};

export type FollowerDelete = {
  followerId: string;
  followableId: string;
  followableType: FollowableType;
};
