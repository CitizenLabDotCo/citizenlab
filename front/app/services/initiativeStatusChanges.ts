import { API_PATH } from 'containers/App/constants';
import { IRelationship, Multiloc } from 'typings';
import streams from 'utils/streams';
import { queryClient } from 'utils/cl-react-query/queryClient';
import initiativesKeys from 'api/initiatives/keys';
import initiativeFilterCountsKeys from 'api/initiatives_filter_counts/keys';
import initiativesAllowedTransitionsKeys from 'api/initiative_allowed_transitions/keys';

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

  queryClient.invalidateQueries(initiativesKeys.lists());
  queryClient.invalidateQueries(initiativesKeys.item(initiativeId));
  queryClient.invalidateQueries(initiativeFilterCountsKeys.items());
  queryClient.invalidateQueries(
    initiativesAllowedTransitionsKeys.item(initiativeId)
  );

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

  queryClient.invalidateQueries(initiativesKeys.lists());
  queryClient.invalidateQueries(initiativesKeys.item(initiativeId));
  queryClient.invalidateQueries(initiativeFilterCountsKeys.items());
  queryClient.invalidateQueries(
    initiativesAllowedTransitionsKeys.item(initiativeId)
  );

  streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/initiatives/${initiativeId}/official_feedback`],
  });
  return response;
}
