import { IRelationship } from 'typings';

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

export type FollowableType = 'projects' | 'folders' | 'ideas' | 'initiatives';

export type FollowerAdd = {
  followableType: FollowableType;
  followableId: string;
};

export type FollowerDelete = {
  followerId: string;
  followableId: string;
  followableType: FollowableType;
};
