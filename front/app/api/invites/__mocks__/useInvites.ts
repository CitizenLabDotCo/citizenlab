import { IInviteData } from '../types';

export const invitesData: IInviteData[] = [
  {
    id: 'ce2bdc6a-eaf1-463a-9fef-8b69e9add0e6',
    type: 'invite',
    attributes: {
      token: '4nce3671h',
      accepted_at: null,
      updated_at: '2023-06-01T14:06:25.686Z',
      created_at: '2023-06-01T14:06:25.686Z',
      activate_invite_url: 'http://localhost:3000/en/invite?token=4nce3671h',
    },
    relationships: {
      invitee: {
        data: { id: '1bd4975d-b1ac-477e-a7ee-44a72b38c02c', type: 'user' },
      },
      inviter: {
        data: { id: '386d255e-2ff1-4192-8e50-b3022576be50', type: 'user' },
      },
    },
  },
  {
    id: '6c48435f-5467-4ec9-81de-89dcda91c295',
    type: 'invite',
    attributes: {
      token: '0q9h8po6v',
      accepted_at: null,
      updated_at: '2023-06-01T12:41:47.471Z',
      created_at: '2023-06-01T12:41:47.471Z',
      activate_invite_url: 'http://localhost:3000/en/invite?token=0q9h8po6v',
    },
    relationships: {
      invitee: {
        data: { id: 'd23013c6-ec05-4e26-8c3a-f4ab9f7c1c7f', type: 'user' },
      },
      inviter: { data: null },
    },
  },
  {
    id: 'f4ba809e-0c10-46ec-a24d-046a1e6a2224',
    type: 'invite',
    attributes: {
      token: '0qyim13pb',
      accepted_at: null,
      updated_at: '2023-06-01T12:41:47.425Z',
      created_at: '2023-06-01T12:41:47.425Z',
      activate_invite_url: 'http://localhost:3000/en/invite?token=0qyim13pb',
    },
    relationships: {
      invitee: {
        data: { id: '168008a4-eee1-4a6f-9e5a-54dfd6296e89', type: 'user' },
      },
      inviter: { data: null },
    },
  },
  {
    id: '5485879e-1719-49fc-820c-514111921314',
    type: 'invite',
    attributes: {
      token: 'bmnugo2dy',
      accepted_at: null,
      updated_at: '2023-06-01T12:41:47.370Z',
      created_at: '2023-06-01T12:41:47.370Z',
      activate_invite_url: 'http://localhost:3000/en/invite?token=bmnugo2dy',
    },
    relationships: {
      invitee: {
        data: { id: '2716a09b-e875-41ab-b440-6254ddb11c8a', type: 'user' },
      },
      inviter: { data: null },
    },
  },
  {
    id: '814778a0-532d-436f-a9be-14b3f0d15305',
    type: 'invite',
    attributes: {
      token: 'yae6tfbrc',
      accepted_at: null,
      updated_at: '2023-06-01T12:41:47.325Z',
      created_at: '2023-06-01T12:41:47.325Z',
      activate_invite_url: 'http://localhost:3000/en/invite?token=yae6tfbrc',
    },
    relationships: {
      invitee: {
        data: { id: '7cc642b1-301e-4606-9006-86e8ea6653e8', type: 'user' },
      },
      inviter: { data: null },
    },
  },
  {
    id: '0a7f4a8f-260e-48e7-8184-07b73a1fec5b',
    type: 'invite',
    attributes: {
      token: 'ze5gdqc9v',
      accepted_at: null,
      updated_at: '2023-06-01T12:41:47.278Z',
      created_at: '2023-06-01T12:41:47.278Z',
      activate_invite_url: 'http://localhost:3000/en/invite?token=ze5gdqc9v',
    },
    relationships: {
      invitee: {
        data: { id: 'b0a6c494-575f-4d61-ac81-656d97239c8d', type: 'user' },
      },
      inviter: { data: null },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: invitesData } };
});
