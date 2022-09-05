import { INotifications, TNotificationData } from 'services/notifications';
import { BehaviorSubject } from 'rxjs';

let mockNotifications: INotifications[] | null = null;

export const __setMockNotifications = (notifications: INotifications[]) => {
  mockNotifications = notifications;
};

export const notificationsStream = jest.fn((_notification) => {
  const observable = new BehaviorSubject(mockNotifications);
  return {
    observable,
  };
});

export const getMockNotifications = (notifs: TNotificationData[], isLast) => ({
  data: notifs,
  links: {
    fist: 'first',
    self: 'self',
    prev: 'prev',
    last: 'last',
    next: isLast ? null : 'next',
  },
});

export const getNotification = (
  id: string,
  type:
    | 'project_phase_upcoming'
    | 'project_phase_started'
    | 'mention_in_official_feedback'
    | 'official_feedback_on_commented_idea'
    | 'official_feedback_on_voted_idea'
    | 'official_feedback_on_your_idea'
    | 'new_idea_for_admin'
    | 'admin_rights_received'
    | 'project_moderation_rights_received'
    | 'new_comment_for_admin'
    | 'comment_on_your_comment'
    | 'comment_on_your_idea'
    | 'mention_in_comment'
    | 'idea_marked_as_spam'
    | 'comment_marked_as_spam'
    | 'status_change_of_your_idea'
    | 'invite_accepted'
    | 'comment_deleted_by_admin',
  readAt?: undefined | string
) =>
  ({
    id,
    type: 'notification',
    attributes: {
      type,
      read_at: readAt ? readAt : null,
      created_at: '2019-04-16T14:32:17.095Z',
      initiating_user_first_name:
        ['status_change_of_your_idea', 'admin_rights_received'].indexOf(
          type
        ) === -1
          ? 'Initiating'
          : undefined,
      initiating_user_last_name:
        ['status_change_of_your_idea', 'admin_rights_received'].indexOf(
          type
        ) === -1
          ? 'User'
          : undefined,
      initiating_user_slug:
        ['status_change_of_your_idea', 'admin_rights_received'].indexOf(
          type
        ) === -1
          ? 'initiating-user'
          : undefined,
      idea_title: {
        'nl-BE': 'Qui nihil veniam consequatur.',
      },
      reason_code:
        ['comment_deleted_by_admin'].indexOf(type) === -1
          ? undefined
          : 'irrelevant',
    },
    relationships: {
      // recipient: {
      //   data: {
      //     id: '9aae2c12-859d-4abb-ac80-80c005459343',
      //     type: 'users'
      //   }
      // },
      initiating_user: {
        data: {
          id: 'fe947bd3-9c67-40ed-96a3-9a12c4c73b46',
          type: 'user',
        },
      },
      post:
        ['invite_accepted', 'admin_rights_received'].indexOf(type) === -1
          ? {
              data: {
                id: '5dda9f3e-4c3f-45f1-bb09-b88a40776cab',
                type: 'idea',
              },
            }
          : undefined,
      comment:
        ['admin_rights_received', 'invite_accepted'].indexOf(type) === -1
          ? {
              data: {
                id: '13d121b7-ee79-4a17-ac3e-c4ee51beb980',
                type: 'comment',
              },
            }
          : undefined,
      idea_status:
        ['status_change_of_your_idea'].indexOf(type) !== -1
          ? {
              data: {
                id: 'status',
                type: 'idea_status',
              },
            }
          : undefined,
      invite:
        ['invite_accepted'].indexOf(type) !== -1
          ? {
              data: {
                id: 'iviteId',
                type: 'invite',
              },
            }
          : undefined,
      project:
        [
          'comment_on_your_idea',
          'invite_accepted',
          'admin_rights_received',
        ].indexOf(type) === -1
          ? {
              data: {
                id: '747dcdb1-f547-409f-8b90-8296d36d560a',
                type: 'project',
              },
            }
          : undefined,
    },
  } as TNotificationData);
