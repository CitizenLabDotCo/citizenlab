import { API_PATH } from 'containers/App/constants';
import { IRelationship, Multiloc } from 'typings';
import streams from 'utils/streams';

export type IInitiativeStatusChange = {
  id: string;
  type: string;
  attributes: {
    created_at: string;
    updated_at: string;
  };
  relationships: {
    initiative_status: {
      data: IRelationship;
    };
    initiative: {
      data: IRelationship;
    };
    user: {
      data: IRelationship;
    };
    official_feedback: {
      data: IRelationship;
    };
  };
};

// Types accepted by initiative status changes endpoint
// type IInitiativeStatusChangeAdd = {
//   initiative_status_id: string;
//   official_feedback_id: string;
// } | {
//   initiative_status_id: string;
//   official_feedback_attributes: {
//     body_multiloc: Multiloc;
//     author_multiloc: Multiloc;
//   }
// };

export async function updateInitiativeStatusWithExistingFeedback(
  initiativeId: string,
  statusId: string,
  feedbackId: string
) {
  const response = await streams.add<IInitiativeStatusChange>(
    `${API_PATH}/initiatives/${initiativeId}/initiative_status_changes`,
    {
      initiative_status_change: {
        initiative_status_id: statusId,
        official_feedback_id: feedbackId,
      },
    }
  );
  streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/initiatives`,
      `${API_PATH}/initiatives/${initiativeId}`,
      `${API_PATH}/initiatives/filter_counts`,
      `${API_PATH}/initiatives/${initiativeId}/allowed_transitions`,
    ],
  });
  return response;
}

export async function updateInitiativeStatusAddFeedback(
  initiativeId: string,
  statusId: string,
  body_multiloc: Multiloc,
  author_multiloc: Multiloc
) {
  const response = await streams.add<IInitiativeStatusChange>(
    `${API_PATH}/initiatives/${initiativeId}/initiative_status_changes`,
    {
      initiative_status_change: {
        initiative_status_id: statusId,
        official_feedback_attributes: {
          body_multiloc,
          author_multiloc,
        },
      },
    }
  );
  streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/initiatives`,
      `${API_PATH}/initiatives/${initiativeId}`,
      `${API_PATH}/initiatives/filter_counts`,
      `${API_PATH}/initiatives/${initiativeId}/official_feedback`,
      `${API_PATH}/initiatives/${initiativeId}/allowed_transitions`,
    ],
  });
  return response;
}
