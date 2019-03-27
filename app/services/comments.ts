import { API_PATH } from 'containers/App/constants';
import request from 'utils/request';
import streams from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';
import { ideaByIdStream } from 'services/ideas';
import { first } from 'rxjs/operators';

interface CommentAttributes {
  upvotes_count: number;
  downvotes_count: number;
  created_at: string;
  updated_at: string;
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
    idea: {
      data: IRelationship;
    };
    author: {
      data: IRelationship | null;
    };
    parent: {
      data: IRelationship;
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

export function commentStream(commentId: string) {
  return streams.get<IComment>({ apiEndpoint: `${API_PATH}/comments/${commentId}` });
}

export function commentsForIdeaStream(ideaId: string) {
  return streams.get<IComments>({ apiEndpoint: `${API_PATH}/ideas/${ideaId}/comments` });
}

export async function addCommentToIdea(ideaId: string, authorId: string, body: { [key: string]: string }) {
  const [idea, comment] = await Promise.all([
    ideaByIdStream(ideaId).observable.pipe(first()).toPromise(),
    streams.add<IComment>(`${API_PATH}/ideas/${ideaId}/comments`, {
      comment: {
        author_id: authorId,
        body_multiloc: body
      }
    })
  ]);
  streams.fetchAllWith({ dataId: [ideaId, idea.data.relationships.project.data.id] });
  return comment;
}

export async function addCommentToComment(ideaId: string, authorId: string, parentCommentId: string, body: { [key: string]: string }) {
  const [idea, comment] = await Promise.all([
    ideaByIdStream(ideaId).observable.pipe(first()).toPromise(),
    streams.add<IComment>(`${API_PATH}/ideas/${ideaId}/comments`, {
      comment: {
        author_id: authorId,
        parent_id: parentCommentId,
        body_multiloc: body
      }
    })
  ]);
  streams.fetchAllWith({ dataId: [ideaId, idea.data.relationships.project.data.id] });
  return comment;
}

export function updateComment(commentId: string, object: IUpdatedComment) {
  return streams.update<IComment>(`${API_PATH}/comments/${commentId}`, commentId, { comment: object });
}

export async function markForDeletion(commentId: ICommentData['id'], reason?: DeleteReason) {
  if (reason && reason.reason_code !== 'other') {
    delete reason.other_reason;
  }

  const comment  = await commentStream(commentId).observable.pipe(first()).toPromise();
  const [idea, response] = await Promise.all([
    ideaByIdStream(comment.data.relationships.idea.data.id).observable.pipe(first()).toPromise(),
    request(`${API_PATH}/comments/${commentId}/mark_as_deleted`, { comment: reason }, { method: 'POST' }, {})
  ]);
  streams.fetchAllWith({ dataId: [commentId, idea.data.relationships.project.data.id] });
  return response;
}
