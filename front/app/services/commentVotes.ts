import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

export interface ICommentVoteData {
  id: string;
  type: 'vote';
  attributes: {
    mode: 'up';
  };
  relationships: {
    votable: {
      data: {
        id: string;
        type: 'comment';
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
export interface ICommentVote {
  data: ICommentVoteData;
}

export interface INewCommentVote {
  user_id?: string;
  mode: 'up';
}

export function commentVoteStream(
  voteId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<ICommentVote>({
    apiEndpoint: `${API_PATH}/votes/${voteId}`,
    ...streamParams,
  });
}

export async function addCommentVote(
  postId: string,
  postType: 'idea' | 'initiative',
  commentId: string,
  object: INewCommentVote
) {
  const response = await streams.add<ICommentVote>(
    `${API_PATH}/comments/${commentId}/votes`,
    { vote: object }
  );
  const voteId = response.data.id;
  await streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/${postType}s/${postId}/comments`,
      `${API_PATH}/comments/${commentId}`,
      `${API_PATH}/votes/${voteId}`,
    ],
  });
  return response;
}

export async function deleteCommentVote(commentId: string, voteId: string) {
  const response = await streams.delete(`${API_PATH}/votes/${voteId}`, voteId);
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/comments/${commentId}`],
  });
  return response;
}
