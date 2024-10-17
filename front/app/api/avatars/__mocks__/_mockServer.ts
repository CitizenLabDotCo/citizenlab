import { http, HttpResponse } from 'msw';

import { API_PATH } from 'containers/App/constants';

import { getOrigin } from 'utils/storybook/getOrigin';

import { IAvatarData } from '../types';

const image = `${getOrigin()}/images/female_avatar_5.jpg`;

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
  'GET /avatars/:id': http.get(avatarPath, () => {
    return HttpResponse.json({ data: avatarsData[0] }, { status: 200 });
  }),
  'GET /avatars': http.get(avatarsPath, () => {
    return HttpResponse.json({ data: avatarsData }, { status: 200 });
  }),
};

export default endpoints;
