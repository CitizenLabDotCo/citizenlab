import { IRelationship } from 'typings';

export interface IFollowerData {
  id: string;
  type: 'follower';
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

export type FollowableType =
  | 'projects'
  | 'project_folders'
  | 'ideas'
  | 'initiatives';

export type FollowerAdd = {
  followableType: FollowableType;
  followableId: string;
  followableSlug?: string;
};

export type FollowerDelete = {
  followerId: string;
  followableId: string;
  followableType: FollowableType;
  followableSlug?: string;
};
