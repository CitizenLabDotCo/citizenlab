import { TNotificationData } from 'api/notifications/types';

export const notificationsData: TNotificationData[] = [
  {
    id: '1c28d41d-3ae2-45c3-bb36-209be4abd55b',
    type: 'idea_assigned_to_you',
    attributes: {
      read_at: '2023-05-30T12:49:33.519Z',
      created_at: '2023-05-30T12:48:40.288Z',
      type: 'idea_assigned_to_you',
      initiating_user_first_name: 'Sylvester',
      initiating_user_last_name: 'Kalinoski',
      initiating_user_slug: 'sylvester-kalinoski',
      post_title_multiloc: { 'nl-BE': 'Iure sit eos placeat labore amet.' },
      post_slug: 'iure-sit-eos-placeat-labore-amet-1',
    },
    relationships: {
      recipient: {
        data: { id: '49c274c2-8ce8-4f0d-9cea-d91e25ef604d', type: 'user' },
      },
    },
  },
  {
    id: 'abf9dc3c-20a2-45d5-abec-14b11e21f343',
    type: 'comment_on_your_comment',
    attributes: {
      read_at: '2023-05-30T12:49:33.519Z',
      created_at: '2023-05-30T12:48:30.174Z',
      type: 'comment_on_your_comment',
      initiating_user_first_name: 'Sylvester',
      initiating_user_last_name: 'Kalinoski',
      initiating_user_slug: 'sylvester-kalinoski',
      post_title_multiloc: { en: 'Charlie Idea' },
      post_slug: 'charlie-idea',
    },
    relationships: {
      recipient: {
        data: { id: '49c274c2-8ce8-4f0d-9cea-d91e25ef604d', type: 'user' },
      },
    },
  },
];

export const links = {
  self: 'http://localhost:3000/web_api/v1/notifications/?page%5Bnumber%5D=1&page%5Bsize%5D=20',
  last: 'http://localhost:3000/web_api/v1/notifications/?page%5Bnumber%5D=2&page%5Bsize%5D=20',
  next: 'http://localhost:3000/web_api/v1/notifications/?page%5Bnumber%5D=2&page%5Bsize%5D=20',
  first:
    'http://localhost:3000/web_api/v1/notifications/?page%5Bnumber%5D=1&page%5Bsize%5D=20',
  prev: null,
};

export default jest.fn(() => {
  return { data: { data: notificationsData, links } };
});
