import { API_PATH } from 'containers/App/constants';
import { rest } from 'msw';

import { IAvatarData } from '../types';

export const avatarsData: IAvatarData[] = [
  {
    id: '1',
    type: 'avatar',
    attributes: {
      avatar: {
        small: 'http://localhost:6006/images/female_avatar_5.jpg',
        medium: 'http://localhost:6006/images/female_avatar_5.jpg',
        large: 'http://localhost:6006/images/female_avatar_5.jpg',
      },
    },
  },
];

export const avatarPath = `${API_PATH}/avatars/:id`;
export const avatarsPath = `${API_PATH}/avatars`;

const endpoints = {
  'GET /avatars/:id': rest.get(avatarPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: avatarsData[0] }));
  }),
  'GET /avatars': rest.get(avatarsPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: avatarsData }));
  }),
};

export default endpoints;
