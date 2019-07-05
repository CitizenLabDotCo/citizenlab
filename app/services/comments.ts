import { API_PATH } from 'containers/App/constants';
import request from 'utils/request';
import streams, { IStreamParams } from 'utils/streams';
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
  type: 'comments';
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
    user_vote: {
      data: IRelationship | null;
    }
  };
}

export interface IComment {
  data: ICommentData;
}

export interface IComments {
  data: ICommentData[];
  meta: {
    total: number;
  };
}

export interface IUpdatedComment {
  author_id?: string;
  parent_id?: string;
  body_multiloc: { [key: string]: string };
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

export function commentStream(commentId: string) {
  return streams.get<IComment>({ apiEndpoint: `${API_PATH}/comments/${commentId}` });
}

export function childCommentsStream(commentId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IComments>({ apiEndpoint: `${API_PATH}/comments/${commentId}/children`, ...streamParams });
}

export function commentsForIdeaStream(ideaId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IComments>({ apiEndpoint: `${API_PATH}/ideas/${ideaId}/comments`, ...streamParams });
}

export function commentsForUserStream(userId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IComments>({ apiEndpoint: `${API_PATH}/users/${userId}/comments`, ...streamParams });
}

export async function addCommentToIdea(ideaId: string,  projectId: string, authorId: string, body: { [key: string]: string }) {
  const comment = await streams.add<IComment>(`${API_PATH}/ideas/${ideaId}/comments`, {
    comment: {
      author_id: authorId,
      body_multiloc: body
    }
  }, true);

  // refetch commentsForUser and comments for user count
  streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/users/${authorId}/comments`, `${API_PATH}/users/${authorId}/comments_count`],
    dataId: [ideaId, projectId, comment.data.id]
  });

  return comment;
}

export async function addCommentToComment(
  ideaId: string,
  projectId: string,
  authorId: string,
  parentCommentId: string,
  body: { [key: string]: string },
  waitForChildCommentsRefetch = false
) {
  const comment = await streams.add<IComment>(`${API_PATH}/ideas/${ideaId}/comments`, {
    comment: {
      author_id: authorId,
      parent_id: parentCommentId,
      body_multiloc: body
    }
  }, true);

  // refetch commentsForUser and comments for user count
  streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/users/${authorId}/comments`, `${API_PATH}/users/${authorId}/comments_count`]
  });

  if (waitForChildCommentsRefetch) {
    await streams.fetchAllWith({
      apiEndpoint: [`${API_PATH}/comments/${parentCommentId}/children`] ,
      dataId: [ideaId, projectId, parentCommentId, comment.data.id]
    });
  } else {
    streams.fetchAllWith({
      dataId: [ideaId, projectId, parentCommentId, comment.data.id],
      apiEndpoint: [`${API_PATH}/comments/${parentCommentId}/children`]
    });
  }

  return comment;
}

export async function updateComment(commentId: string, object: IUpdatedComment) {
  const response = await streams.update<IComment>(`${API_PATH}/comments/${commentId}`, commentId, { comment: object });

  // refetch commentsForUser
  if (object.author_id) {
    streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/users/${object.author_id}/comments`] });
  }

  return response;
}

export async function markForDeletion(projectId: string, commentId: string, reason?: DeleteReason, authorId?: string) {
  if (reason && reason.reason_code !== 'other') { delete reason.other_reason; }
  const response = await request(`${API_PATH}/comments/${commentId}/mark_as_deleted`, { comment: reason }, { method: 'POST' }, {});

  // refetch commentsForUser and comments for user count
  if (authorId) {
    streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/users/${authorId}/comments`, `${API_PATH}/users/${authorId}/comments_count`] });
  }

  streams.fetchAllWith({ dataId: [commentId, projectId] });
  return response;
}
