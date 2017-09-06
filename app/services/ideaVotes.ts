import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

export interface IIdeaVoteData {
  id: string;
  type: 'votes';
  attributes: {
    mode: 'up' | 'down'
  };
  relationships: {
    votable: {
      data: {
        id: string;
        type: 'votables';
      }
    },
    user: {
      data: {
        id: string;
        type: 'users';
      }
    }
  };
}

export interface IIdeaVotes {
  data: IIdeaVoteData[];
}
export interface IIdeaVote {
  data: IIdeaVoteData;
}

/*
export interface INewVoteProperties {
  user_id?: string;
  mode: 'up' | 'down';
}
*/

export function voteStream(voteId: string, streamParams: IStreamParams<IIdeaVote> | null = null) {
  return streams.get<IIdeaVote>({ apiEndpoint: `${API_PATH}/votes/${voteId}`, ...streamParams });
}

export function votesStream(ideaId: string, streamParams: IStreamParams<IIdeaVotes> | null = null) {
  return streams.get<IIdeaVotes>({ apiEndpoint: `${API_PATH}/ideas/${ideaId}/votes`, ...streamParams });
}

export function vote(ideaId: string, mode: 'up' | 'down') {
  return streams.add<IIdeaVote>(`${API_PATH}/ideas/${ideaId}/votes/${mode}`, null);
}

/*
export function upvoteIdea(ideaId: string) {
  return streams.add<IIdeaVote>(`${API_PATH}/ideas/${ideaId}/votes/up`, null);
}

export function downvoteIdea(ideaId: string) {
  return streams.add<IIdeaVote>(`${API_PATH}/ideas/${ideaId}/votes/down`, null);
}

export function addVote(ideaId: string, object: INewVoteProperties) {
  return streams.add<IIdeaVote>(`${API_PATH}/ideas/${ideaId}/votes`, { vote: object });
}

export function deleteVote(voteId: string) {
  return streams.delete(`${API_PATH}/votes/${voteId}`, voteId);
}
*/
