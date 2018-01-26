import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';

export interface ICommentData {
  id: string;
  type: string;
  attributes: {
    body_multiloc: Multiloc;
    upvotes_count: number;
    downvotes_count: number;
    created_at: string;
    updated_at: string;
  };
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
  };
}

export interface IComment {
  data: ICommentData;
}

export interface IComments {
  data: ICommentData[];
}

export interface IUpdatedComment {
  author_id: string;
  parent_id: string;
  body_multiloc: { [key: string]: string };
}

export function commentStream(commentId: string) {
  return streams.get<IComment>({ apiEndpoint: `${API_PATH}/comments/${commentId}` });
}

export function commentsForIdeaStream(ideaId: string) {
  return streams.get<IComments>({ apiEndpoint: `${API_PATH}/ideas/${ideaId}/comments` });
}

export function addCommentToIdea(ideaId: string, authorId: string, body: { [key: string]: string }) {
  const bodyData = {
    comment: {
      author_id: authorId,
      body_multiloc: body
    }
  };

  return streams.add<IComment>(`${API_PATH}/ideas/${ideaId}/comments`, bodyData);
}

export function addCommentToComment(ideaId: string, authorId: string, parentCommentId: string, body: { [key: string]: string }) {
  const bodyData = {
    comment: {
      author_id: authorId,
      parent_id: parentCommentId,
      body_multiloc: body
    }
  };

  return streams.add<IComment>(`${API_PATH}/ideas/${ideaId}/comments`, bodyData);
}

export function updateComment(commentId: string, object: IUpdatedComment) {
  return streams.update<IComment>(`${API_PATH}/comments/${commentId}`, commentId, { comment: object });
}
