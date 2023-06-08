import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

export const apiEndpoint = `${API_PATH}/stats`;

// Ideas
export interface IIdeasByStatus {
  data: {
    type: 'ideas_by_status';
    attributes: {
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
    };
  };
}

export interface IIdeasByTopic {
  data: {
    type: 'ideas_by_topics';
    attributes: {
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
    };
  };
}

export interface IIdeasByProject {
  data: {
    type: 'ideas_by_project';
    attributes: {
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
    };
  };
}

export function ideasByStatusStream(streamParams: IStreamParams | null = null) {
  return streams.get<IIdeasByStatus>({
    apiEndpoint: `${apiEndpoint}/ideas_by_status`,
    ...streamParams,
  });
}
export const ideasByStatusXlsxEndpoint = `${apiEndpoint}/ideas_by_status_as_xlsx`;

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

// Users

export interface IUsersByTime {
  series: {
    users: {
      [key: string]: number;
    };
  };
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

// Comments
export interface ICommentsByTopic {
  data: {
    type: 'comments_by_topic';
    attributes: {
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
    };
  };
}

export interface ICommentsByProject {
  data: {
    type: 'comments_by_project';
    attributes: {
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
    };
  };
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

// Reactions
export interface IReactionsByTopic {
  data: {
    type: 'reactions_by_topic';
    attributes: {
      series: {
        reactions: {
          [key: string]: number;
        };
      };
      topics: {
        [key: string]: {
          title_multiloc: Multiloc;
        };
      };
    };
  };
}

export interface IReactionsByProject {
  data: {
    type: 'reactions_by_project';
    attributes: {
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
    };
  };
}

export const reactionsByTopicXlsxEndpoint = `${apiEndpoint}/reactions_by_topic_as_xlsx`;

export function reactionsByTopicStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IReactionsByTopic>({
    apiEndpoint: `${apiEndpoint}/reactions_by_topic`,
    ...streamParams,
  });
}

export const reactionsByProjectXlsxEndpoint = `${apiEndpoint}/reactions_by_project_as_xlsx`;

export function reactionsByProjectStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IReactionsByProject>({
    apiEndpoint: `${apiEndpoint}/reactions_by_project`,
    ...streamParams,
  });
}
// -----
