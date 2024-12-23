import { IRelationship, Multiloc, ILinks } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import commentsKeys from './keys';

export type CommentsKeys = Keys<typeof commentsKeys>;

export type ICommentParameters = {
  ideaId?: string;
  authorId?: string;
  commentId?: string;
};

interface CommentAttributes {
  likes_count: number;
  dislikes_count: number;
  created_at: string;
  updated_at: string;
  children_count: number;
}

export interface IPresentComment extends CommentAttributes {
  body_multiloc: Multiloc;
  publication_status: 'published';
  anonymous?: boolean;
  author_hash?: string;
}

interface IDeletedComment extends CommentAttributes {
  body_multiloc: null;
  publication_status: 'deleted';
}

export interface ICommentData {
  id: string;
  type: 'comment';
  attributes: IPresentComment | IDeletedComment;
  relationships: {
    post: {
      data: IRelationship;
    };
    author: {
      data: IRelationship | null;
    };
    parent: {
      data: IRelationship | null;
    };
    user_reaction?: {
      data: IRelationship | null;
    };
  };
}

export interface IComment {
  data: ICommentData;
}

export interface IComments {
  data: ICommentData[];
  links: ILinks;
}

export interface INewComment {
  ideaId?: string;
  author_id: string;
  parent_id?: string;
  body_multiloc: Multiloc;
  anonymous?: boolean;
}

export interface IUpdatedComment {
  commentId: string;
  author_id?: string;
  parent_id?: string;
  body_multiloc: Multiloc;
}

export const DeleteReasonCode = {
  irrelevant: 'irrelevant',
  inappropriate: 'inappropriate',
  other: 'other',
};

export interface DeleteReason {
  reason_code: keyof typeof DeleteReasonCode;
  // Only here if reason_code is 'other'
  other_reason?: string;
}

// back-end also offers 'likes_count' if needed
export type CommentsSort = '-new' | 'new' | '-likes_count';

export type ICommentQueryParameters = {
  sort?: CommentsSort;
  pageNumber?: number;
  pageSize?: number;
};
