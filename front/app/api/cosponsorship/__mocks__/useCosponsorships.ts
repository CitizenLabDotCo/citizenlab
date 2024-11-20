import { ICosponsorshipData } from '../types';

export const cosponsorshipData: ICosponsorshipData[] = [
  {
    id: '1',
    type: 'cosponsorship',
    attributes: {
      status: 'pending',
      created_at: '2021-09-10T12:00:00Z',
      updated_at: '2021-09-10T12:00:00Z',
    },
    relationships: {
      user: {
        data: {
          id: '3',
        },
      },
      idea: {
        data: {
          id: '1',
        },
      },
    },
  },
  {
    id: '2',
    type: 'cosponsorship',
    attributes: {
      status: 'accepted',
      created_at: '2021-09-10T12:00:00Z',
      updated_at: '2021-09-10T12:00:00Z',
    },
    relationships: {
      user: {
        data: {
          id: '4',
        },
      },
      idea: {
        data: {
          id: '2',
        },
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: cosponsorshipData } };
});
