import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';

interface IAdminFeedbackPost {
  body_multiloc: Multiloc;
  author_multiloc: Multiloc;
  created_at: string;
  updated_at: string;
}

export interface IAdminFeedbackData {
  id: string;
  type: 'admin_feedbacks';
  attributes: IAdminFeedbackPost;
  relationships: {
    idea: {
      data: IRelationship;
    };
    user: {
      data: IRelationship | null;
    };
  };
}

export interface IAdminFeedback {
  data: IAdminFeedbackData[];
}

export interface IUpdatedAdminFeedback {
  author_id: Multiloc;
  body_multiloc: Multiloc;
}

export function adminFeedbackStream(adminFeedbackId: string) {
  return streams.get<IAdminFeedback>({ apiEndpoint: `${API_PATH}/admin_feedback/${adminFeedbackId }` });
}

export function adminFeedbackForIdeaStream(ideaId: string) {
  return streams.get<IAdminFeedback>({ apiEndpoint: `${API_PATH}/ideas/${ideaId}/admin_feedback` });
}

export async function addAdminFeedbackToIdea(ideaId: string, author_multiloc: Multiloc, body_multiloc: Multiloc) {
  const bodyData = {
    admin_feedback: {
      author_multiloc,
      body_multiloc
    }
  };

  return streams.add<IAdminFeedback>(`${API_PATH}/ideas/${ideaId}/admin_feedback`, bodyData);
}

export function updateAdminFeedback(adminFeedbackId: string, object: IUpdatedAdminFeedback) {
  return streams.update<IAdminFeedback>(`${API_PATH}/admin_feedback/${adminFeedbackId}`, adminFeedbackId, { comment: object });
}

export function deleteAdminfeedback(projectId: string) {
  return streams.delete(`${API_PATH}/admin_feedback/${projectId}`, projectId);
}
