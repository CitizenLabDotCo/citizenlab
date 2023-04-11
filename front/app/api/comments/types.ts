import { IRelationship, Multiloc, ILinks } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import commentsKeys from './keys';

export type CommentsKeys = Keys<typeof commentsKeys>;

export type ICommentParameters = {
  ideaId?: string;
  initiativeId?: string;
  userId?: string;
  commentId?: string;
};

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

export interface IComment {
  data: ICommentData;
}

export interface IComments {
  data: ICommentData[];
  links: ILinks;
}

export interface INewComment {
  ideaId?: string;
  initiativeId?: string;
  author_id: string;
  parent_id?: string;
  body_multiloc: Multiloc;
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
  other_reason: string | null;
}

export type CommentsSort = '-new' | 'upvotes_count' | 'new' | '-upvotes_count';

export type ICommentQueryParameters = {
  sort?: CommentsSort;
  pageNumber?: number;
  pageSize?: number;
};
