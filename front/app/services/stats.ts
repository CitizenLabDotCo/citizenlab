import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

const apiEndpoint = `${API_PATH}/stats`;

export type IResourceByTime =
  | IIdeasByTime
  | IUsersByTime
  | ICommentsByTime
  | IVotesByTime;

// Ideas
export interface IIdeasByTime {
  series: {
    ideas: {
      [key: string]: number;
    };
  };
}
export interface IIdeasByStatus {
  series: {
    ideas: {
      [key: string]: number;
    };
  };
  idea_status: {
    [key: string]: {
      title_multiloc: Multiloc;
      color: string;
      ordering: number;
    };
  };
}

export interface IIdeasByTopic {
  series: {
    ideas: {
      [key: string]: number;
    };
  };
  topics: {
    [key: string]: {
      title_multiloc: Multiloc;
    };
  };
}

export interface IIdeasByProject {
  series: {
    ideas: {
      [key: string]: number;
    };
  };
  projects: {
    [key: string]: {
      title_multiloc: Multiloc;
    };
  };
}

export interface IIdeasCount {
  count: number;
}

export interface ICount {
  count: number;
}

export function ideasByStatusStream(streamParams: IStreamParams | null = null) {
  return streams.get<IIdeasByStatus>({
    apiEndpoint: `${apiEndpoint}/ideas_by_status`,
    ...streamParams,
  });
}
export const ideasByStatusXlsxEndpoint = `${apiEndpoint}/ideas_by_status_as_xlsx`;

export const ideasByTimeXlsxEndpoint = `${apiEndpoint}/ideas_by_time_as_xlsx`;

export function ideasByTimeStream(streamParams: IStreamParams | null = null) {
  return streams.get<IIdeasByTime>({
    apiEndpoint: `${apiEndpoint}/ideas_by_time`,
    ...streamParams,
  });
}

export const ideasByTimeCumulativeXlsxEndpoint = `${apiEndpoint}/ideas_by_time_cumulative_as_xlsx`;

export function ideasByTimeCumulativeStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IIdeasByTime>({
    apiEndpoint: `${apiEndpoint}/ideas_by_time_cumulative`,
    ...streamParams,
  });
}

export const ideasByTopicXlsxEndpoint = `${apiEndpoint}/ideas_by_topic_as_xlsx`;

export function ideasByTopicStream(streamParams: IStreamParams | null = null) {
  return streams.get<IIdeasByTopic>({
    apiEndpoint: `${apiEndpoint}/ideas_by_topic`,
    ...streamParams,
  });
}

export const ideasByProjectXlsxEndpoint = `${apiEndpoint}/ideas_by_project_as_xlsx`;

export function ideasByProjectStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IIdeasByProject>({
    apiEndpoint: `${apiEndpoint}/ideas_by_project`,
    ...streamParams,
  });
}

export function ideasCount(streamParams: IStreamParams | null = null) {
  return streams.get<IIdeasCount>({
    apiEndpoint: `${apiEndpoint}/ideas_count`,
    ...streamParams,
  });
}

export function ideasCountForUser(userId: string) {
  return streams.get<ICount>({
    apiEndpoint: `${API_PATH}/users/${userId}/ideas_count`,
  });
}

// Users

export interface IUsersCount {
  count: number;
}

export interface IUsersByTime {
  series: {
    users: {
      [key: string]: number;
    };
  };
}
export interface IUserEngagementScores {
  data: IUserEngagementScore[];
}

export interface IUserEngagementScore {
  id: string;
  type: string;
  attributes: {
    sum_score: number;
  };
  relationships: {
    user: {
      data: {
        id: string;
        type: 'user';
      };
    };
  };
}

export const userXlsxEndpoint = `${apiEndpoint}/users_count_as_xlsx`;

export function usersCount(streamParams: IStreamParams | null = null) {
  return streams.get<IUsersCount>({
    apiEndpoint: `${apiEndpoint}/users_count`,
    ...streamParams,
  });
}

export const usersByTimeXlsxEndpoint = `${apiEndpoint}/users_by_time_as_xlsx`;

export function usersByTimeStream(streamParams: IStreamParams | null = null) {
  return streams.get<IUsersByTime>({
    apiEndpoint: `${apiEndpoint}/users_by_time`,
    ...streamParams,
  });
}

export function commentsByTimeStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<ICommentsByTime>({
    apiEndpoint: `${apiEndpoint}/comments_by_time`,
    ...streamParams,
  });
}

export const usersByTimeCumulativeXlsxEndpoint = `${apiEndpoint}/users_by_time_cumulative_as_xlsx`;

export function usersByTimeCumulativeStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUsersByTime>({
    apiEndpoint: `${apiEndpoint}/users_by_time_cumulative`,
    ...streamParams,
  });
}

export const activeUsersByTimeXlsxEndpoint = `${apiEndpoint}/active_users_by_time_as_xlsx`;

export function activeUsersByTimeStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUsersByTime>({
    apiEndpoint: `${apiEndpoint}/active_users_by_time`,
    ...streamParams,
  });
}

export const activeUsersByTimeCumulativeXlsxEndpoint = `${apiEndpoint}/active_users_by_time_cumulative_as_xlsx`;

export function activeUsersByTimeCumulativeStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUsersByTime>({
    apiEndpoint: `${apiEndpoint}/active_users_by_time_cumulative`,
    ...streamParams,
  });
}

export function userEngagementScoresStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUserEngagementScores>({
    apiEndpoint: `${apiEndpoint}/users_engagement_scores`,
    ...streamParams,
  });
}

// Comments
export interface ICommentsByTime {
  series: {
    comments: {
      [key: string]: number;
    };
  };
}

export interface ICommentsByTopic {
  series: {
    comments: {
      [key: string]: number;
    };
  };
  topics: {
    [key: string]: {
      title_multiloc: Multiloc;
    };
  };
}

export interface ICommentsByProject {
  series: {
    comments: {
      [key: string]: number;
    };
  };
  projects: {
    [key: string]: {
      title_multiloc: Multiloc;
    };
  };
}

export const commentsByTimeCumulativeXlsxEndpoint = `${apiEndpoint}/comments_by_time_cumulative_as_xlsx`;

export function commentsByTimeCumulativeStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<ICommentsByTime>({
    apiEndpoint: `${apiEndpoint}/comments_by_time_cumulative`,
    ...streamParams,
  });
}

export const commentsByTopicXlsxEndpoint = `${apiEndpoint}/comments_by_topic_as_xlsx`;

export function commentsByTopicStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<ICommentsByTopic>({
    apiEndpoint: `${apiEndpoint}/comments_by_topic`,
    ...streamParams,
  });
}

export const commentsByProjectXlsxEndpoint = `${apiEndpoint}/comments_by_project_as_xlsx`;

export function commentsByProjectStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<ICommentsByProject>({
    apiEndpoint: `${apiEndpoint}/comments_by_project`,
    ...streamParams,
  });
}

export function commentsCountForUser(userId: string) {
  return streams.get<ICount>({
    apiEndpoint: `${API_PATH}/users/${userId}/comments_count`,
  });
}

// Votes
export interface IVotesByTime {
  series: {
    up: { [key: string]: number };
    down: { [key: string]: number };
    total: { [key: string]: number };
  };
}

export interface IVotesByTopic {
  series: {
    votes: {
      [key: string]: number;
    };
  };
  topics: {
    [key: string]: {
      title_multiloc: Multiloc;
    };
  };
}

export interface IVotesByProject {
  series: {
    total: {
      [key: string]: number;
    };
  };
  projects: {
    [key: string]: {
      title_multiloc: Multiloc;
    };
  };
}

export interface IVotesByTimeCumulative {
  series: {
    up: { [key: string]: number };
    down: { [key: string]: number };
    total: { [key: string]: number };
  };
}

export function votesByTimeCumulativeStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IVotesByTimeCumulative>({
    apiEndpoint: `${apiEndpoint}/votes_by_time_cumulative`,
    ...streamParams,
  });
}
export const votesByTimeXlsxEndpoint = `${apiEndpoint}/votes_by_time_as_xlsx`;

export function votesByTimeStream(streamParams: IStreamParams | null = null) {
  return streams.get<IVotesByTime>({
    apiEndpoint: `${apiEndpoint}/votes_by_time`,
    ...streamParams,
  });
}

export const votesByTopicXlsxEndpoint = `${apiEndpoint}/votes_by_topic_as_xlsx`;

export function votesByTopicStream(streamParams: IStreamParams | null = null) {
  return streams.get<IVotesByTopic>({
    apiEndpoint: `${apiEndpoint}/votes_by_topic`,
    ...streamParams,
  });
}

export const votesByProjectXlsxEndpoint = `${apiEndpoint}/votes_by_project_as_xlsx`;

export function votesByProjectStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IVotesByProject>({
    apiEndpoint: `${apiEndpoint}/votes_by_project`,
    ...streamParams,
  });
}

export interface IInitiativesCount {
  count: number;
}

export function initiativesCount(streamParams: IStreamParams | null = null) {
  return streams.get<IInitiativesCount>({
    apiEndpoint: `${apiEndpoint}/initiatives_count`,
    ...streamParams,
  });
}

// -----
