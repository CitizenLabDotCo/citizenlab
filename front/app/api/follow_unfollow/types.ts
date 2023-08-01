import { Keys } from 'utils/cl-react-query/types';
import { IRelationship } from 'typings';
import followUnfollowKeys from './keys';

export type FollowUnfollowKeys = Keys<typeof followUnfollowKeys>;

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

export interface IFollowers {
  data: IFollowerData[];
}

export type FollowableType =
  | 'projects'
  | 'project_folders'
  | 'ideas'
  | 'initiatives';

export type FollowableObject =
  | 'Idea'
  | 'Initiative'
  | 'ProjectFolders::Folder'
  | 'Project';

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

export interface IParameters {
  followableObject?: FollowableObject;
}
