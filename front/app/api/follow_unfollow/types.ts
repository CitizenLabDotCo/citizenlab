import { ILinks, IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

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
  links: ILinks;
}

export type FollowableType =
  | 'projects'
  | 'project_folders'
  | 'ideas'
  | 'global_topics'
  | 'areas';

export type FollowableObject =
  | 'Idea'
  | 'ProjectFolders::Folder'
  | 'Project'
  | 'GlobalTopic'
  | 'Area';

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
  pageNumber?: number;
  pageSize?: number;
}
