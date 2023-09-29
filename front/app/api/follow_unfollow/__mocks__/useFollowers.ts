import { IFollowerData } from '../types';

export const links = {
  last: 'http://localhost:3000/web_api/v1/followers?followable_type=Project&page%5Bnumber%5D=3&page%5Bsize%5D=1',
  next: 'http://localhost:3000/web_api/v1/followers?followable_type=Project&page%5Bnumber%5D=2&page%5Bsize%5D=1',
  self: 'http://localhost:3000/web_api/v1/followers?followable_type=Project&page%5Bnumber%5D=1&page%5Bsize%5D=1',
  first:
    'http://localhost:3000/web_api/v1/followers?followable_type=Project&page%5Bnumber%5D=1&page%5Bsize%5D=1',
  prev: null,
};

export const followersData: IFollowerData[] = [
  {
    id: '1',
    type: 'follower',
    attributes: {
      created_at: '2022-12-18',
      updated_at: '2022-12-19',
    },
    relationships: {
      user: {
        data: {
          id: 'a94f26b0-01e6-4b0e-acf9-a89854c8413f',
          type: 'user',
        },
      },
      followable: {
        data: {
          id: 'c57ef60a-cc83-4c52-acfa-16a4f4d1ae96',
          type: 'project',
        },
      },
    },
  },
  {
    id: '5',
    type: 'follower',
    attributes: {
      created_at: '2022-09-18',
      updated_at: '2022-12-19',
    },
    relationships: {
      user: {
        data: {
          id: 'a94f26b0-01e6-4b0e-acf9-67676',
          type: 'user',
        },
      },
      followable: {
        data: {
          id: 'c57ef60a-cc83-4c52-acfa-457455',
          type: 'project',
        },
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: followersData, links } };
});
