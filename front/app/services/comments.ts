import { API_PATH } from 'containers/App/constants';
import request from 'utils/request';
import streams from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';

interface CommentAttributes {
  upvotes_count: number;
  downvotes_count: number;
  created_at: string;
  updated_at: string;
  children_count: number;
}

interface IPresentComment extends CommentAttributes {
  body_multiloc: Multiloc;
  publication_status: 'published';
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
    user_vote?: {
      data: IRelationship | null;
    };
  };
}

export interface ICommentLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface IComment {
  data: ICommentData;
}

export interface IComments {
  data: ICommentData[];
  links: ICommentLinks;
}

export const DeleteReasonCode = {
  irrelevant: 'irrelevant',
  inappropriate: 'inappropriate',
  other: 'other',
};

export interface DeleteReason {
  reason_code: keyof typeof DeleteReasonCode;
  other_reason: string | null;
}

export type CommentsSort = '-new' | 'upvotes_count' | 'new' | '-upvotes_count';
