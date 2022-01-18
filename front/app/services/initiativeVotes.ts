import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export interface IInitiativeVoteData {
  id: string;
  type: 'vote';
  attributes: {
    mode: 'up' | 'down';
  };
  relationships: {
    votable: {
      data: {
        id: string;
        type: 'votable';
      };
    };
    user: {
      data: {
        id: string;
        type: 'user';
      };
    };
  };
}
export interface IInitiativeVote {
  data: IInitiativeVoteData;
}

export interface INewVoteProperties {
  user_id?: string;
  mode: 'up' | 'down';
}

export async function addVote(
  initiativeId: string,
  object: INewVoteProperties
) {
  const response = await streams.add<IInitiativeVote>(
    `${API_PATH}/initiatives/${initiativeId}/votes`,
    { vote: object }
  );
  await streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/initiatives/${initiativeId}`,
      `${API_PATH}/initiative_statuses/${initiativeId}`,
    ],
  });
  return response;
}

export async function deleteVote(initiativeId: string, voteId: string) {
  const response = await streams.delete(`${API_PATH}/votes/${voteId}`, voteId);
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/initiatives/${initiativeId}`],
  });
  return response;
}
