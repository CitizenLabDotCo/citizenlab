import { IRelationship, ILinks } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import commentsKeys from './keys';

export type InternalCommentsKeys = Keys<typeof commentsKeys>;

export type IInternalCommentParameters =
  | { type: 'idea'; ideaId: string }
  | { type: 'author'; authorId: string }
  | { type: 'comment'; commentId: string };

interface InternalCommentAttributes {
  created_at: string;
  updated_at: string;
  children_count: number;
}

export interface IPresentInternalComment extends InternalCommentAttributes {
  body: string;
  publication_status: 'published';
}

interface IDeletedInternalComment extends InternalCommentAttributes {
  body: string;
  publication_status: 'deleted';
}

export interface IInternalCommentData {
  id: string;
  type: 'internal_comment';
  attributes: IPresentInternalComment | IDeletedInternalComment;
  relationships: {
    idea: {
      data: IRelationship;
    };
    author: {
      data: IRelationship | null;
    };
    parent: {
      data: IRelationship | null;
    };
  };
}

export interface IInternalComment {
  data: IInternalCommentData;
}

export interface IInternalComments {
  data: IInternalCommentData[];
  links: ILinks;
}

export interface IIdeaNewInternalComment extends INewInternalComment {
  ideaId: string;
}

export interface INewInternalComment {
  author_id: string;
  parent_id?: string;
  body: string;
}

export interface IUpdatedInternalComment {
  commentId: string;
  author_id?: string;
  parent_id?: string;
  body: string;
}

export type InternalCommentSort = '-new' | 'new';

export type IInternalCommentQueryParameters = {
  sort?: InternalCommentSort;
  pageNumber?: number;
  pageSize?: number;
};
