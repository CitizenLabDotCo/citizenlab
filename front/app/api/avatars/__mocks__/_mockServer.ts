import { rest } from 'msw';
import { API_PATH } from 'containers/App/constants';
import { getOrigin } from 'utils/storybook/getOrigin';
import { IAvatarData } from '../types';

const image = `${getOrigin()}/images/female_avatar_5`;

export const avatarsData: IAvatarData[] = [
  {
    id: '1',
    type: 'avatar',
    attributes: {
      avatar: {
        small: image,
        medium: image,
        large: image,
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
