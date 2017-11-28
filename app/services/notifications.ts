import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

import { authUserStream } from './auth';

const apiEndpoint = `${API_PATH}/notifications`;

export interface INotificationData {
  id: string;
  type: string;
  attributes: {
    type: 'comment_on_your_comment' | 'comment_on_your_idea';
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

export interface INotificationLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface INotifications {
  data: INotificationData[];
  links: INotificationLinks;
}

export interface INotification {
  data: INotificationData;
}

export function notificationsStream(streamParams: IStreamParams<INotifications> | null = null) {
  return streams.get<INotifications>({ apiEndpoint, ...streamParams });
}

export async function markAllAsRead() {
  const response = await streams.add(`${apiEndpoint}/mark_all_read`, null);
  await authUserStream().fetch();
  return response;
}
