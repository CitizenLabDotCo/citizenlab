import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

import { authUserStream } from './auth';
import { Multiloc } from 'typings';

const apiEndpoint = `${API_PATH}/notifications`;

interface IBaseNotificationData {
  id: string;
  type: string;
}

export interface ICommentOnYourCommentNotificationData extends IBaseNotificationData {
  attributes: {
    type: 'comment_on_your_comment';
    read_at: string;
    created_at: string;
    initiating_user_first_name: string;
    initiating_user_last_name: string;
    initiating_user_slug: string;
    idea_title: Multiloc
  };
  relationships: {
    initiating_user: {
      data?: {
        id: string;
        type: string;
      }
    }
    idea: {
      data?: {
        id: string;
        type: string;
      }
    }
    comment: {
      data?: {
        id: string;
        type: string;
      }
    }
    project: {
      data?: {
        id: string;
        type: string;
      }
    }
  };
}

export interface ICommentOnYourIdeaNotificationData extends IBaseNotificationData {
  attributes: {
    type: 'comment_on_your_idea';
    read_at: string;
    created_at: string;
    initiating_user_first_name: string;
    initiating_user_last_name: string;
    initiating_user_slug: string;
    idea_title: { [key: string]: any; }
  };
  relationships: {
    initiating_user: {
      data?: {
        id: string;
        type: string;
      }
    }
    idea: {
      data?: {
        id: string;
        type: string;
      }
    }
    comment: {
      data?: {
        id: string;
        type: string;
      }
    }
    spam_report: {
      data?: {
        id: string;
        type: string;
      }
    }
  };
}

export interface IMentionInCommentNotificationData extends IBaseNotificationData {
  attributes: {
    type: 'mention_in_comment';
    read_at: string;
    created_at: string;
    initiating_user_first_name: string;
    initiating_user_last_name: string;
    initiating_user_slug: string;
    idea_title: { [key: string]: any; }
  };
  relationships: {
    initiating_user: {
      data?: {
        id: string;
        type: string;
      }
    }
    idea: {
      data?: {
        id: string;
        type: string;
      }
    }
    comment: {
      data?: {
        id: string;
        type: string;
      }
    }
    project: {
      data?: {
        id: string;
        type: string;
      }
    }
  };
}

export interface IIdeaMarkedAsSpamNotificationData extends IBaseNotificationData {
  attributes: {
    type: 'idea_marked_as_spam';
    read_at: string;
    created_at: string;
    initiating_user_first_name: string;
    initiating_user_last_name: string;
    initiating_user_slug: string;
    idea_title: { [key: string]: any; }
  };
  relationships: {
    initiating_user: {
      data?: {
        id: string;
        type: string;
      }
    }
    idea: {
      data?: {
        id: string;
        type: string;
      }
    }
    comment: {
      data?: {
        id: string;
        type: string;
      }
    }
    project: {
      data?: {
        id: string;
        type: string;
      }
    }
  };
}

export interface ICommentMarkedAsSpamNotificationData extends IBaseNotificationData {
  attributes: {
    type: 'comment_marked_as_spam';
    read_at: string;
    created_at: string;
    initiating_user_first_name: string;
    initiating_user_last_name: string;
    initiating_user_slug: string;
    idea_title: { [key: string]: any; }
  };
  relationships: {
    initiating_user: {
      data?: {
        id: string;
        type: string;
      }
    }
    idea: {
      data?: {
        id: string;
        type: string;
      }
    }
    project: {
      data?: {
        id: string;
        type: string;
      }
    }
  };
}

export interface IInviteAcceptedNotificationData extends IBaseNotificationData {
  attributes: {
    type: 'invite_accepted';
    read_at: string;
    created_at: string;
    initiating_user_first_name: string;
    initiating_user_last_name: string;
    initiating_user_slug: string;
  };
  relationships: {
    initiating_user: {
      data?: {
        id: string;
        type: string;
      }
    }
    invite: {
      data?: {
        id: string;
        type: string;
      }
    }
  };
}

export type TNotificationData =
  ICommentOnYourCommentNotificationData |
  ICommentOnYourIdeaNotificationData |
  ICommentMarkedAsSpamNotificationData |
  IIdeaMarkedAsSpamNotificationData |
  IMentionInCommentNotificationData |
  IInviteAcceptedNotificationData;


export interface INotificationLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface INotifications {
  data: TNotificationData[];
  links: INotificationLinks;
}

export interface INotification {
  data: TNotificationData;
}

export function notificationsStream(streamParams: IStreamParams | null = null) {
  return streams.get<INotifications>({ apiEndpoint, ...streamParams });
}

export async function markAllAsRead() {
  const response = await streams.add(`${apiEndpoint}/mark_all_read`, null);
  await authUserStream().fetch();
  return response;
}
