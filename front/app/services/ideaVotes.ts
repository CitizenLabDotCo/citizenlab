import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { uuidRegExp } from 'utils/helperUtils';

export type TVoteMode = 'up' | 'down';

export interface IIdeaVoteData {
  id: string;
  type: 'vote';
  attributes: {
    mode: TVoteMode;
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

interface ILinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface IIdeaVotes {
  data: IIdeaVoteData[];
  links: ILinks;
}

export interface IIdeaVote {
  data: IIdeaVoteData;
}

export interface INewVoteProperties {
  user_id?: string;
  mode: 'up' | 'down';
}

export function voteStream(
  voteId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IIdeaVote>({
    apiEndpoint: `${API_PATH}/votes/${voteId}`,
    ...streamParams,
  });
}

export function votesStream(
  ideaId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IIdeaVotes>({
    apiEndpoint: `${API_PATH}/ideas/${ideaId}/votes`,
    ...streamParams,
  });
}

export async function addVote(
  ideaId: string,
  object: INewVoteProperties,
  refetchAllActiveIdeas = false
) {
  const response = await streams.add<IIdeaVote>(
    `${API_PATH}/ideas/${ideaId}/votes`,
    { vote: object }
  );

  if (refetchAllActiveIdeas) {
    const ideaEndpointRegexp = new RegExp(`/ideas/${uuidRegExp}$`);
    streams.fetchAllWith({
      regexApiEndpoint: [ideaEndpointRegexp],
      onlyFetchActiveStreams: true,
    });
  }

  return response;
}

export async function deleteVote(
  _ideaId,
  voteId: string,
  refetchAllActiveIdeas = false
) {
  const response = await streams.delete(`${API_PATH}/votes/${voteId}`, voteId);

  if (refetchAllActiveIdeas) {
    const ideaEndpointRegexp = new RegExp(`/ideas/${uuidRegExp}$`);
    streams.fetchAllWith({
      regexApiEndpoint: [ideaEndpointRegexp],
      onlyFetchActiveStreams: true,
    });
  }

  return response;
}
