import { IAvatarData } from '../types';

export const avatarsData: IAvatarData[] = [
  {
    id: '1',
    type: 'avatar',
    attributes: {
      avatar: {
        small:
          'https://s3.eu-central-1.amazonaws.com/com-citizenlab-backoffice/avatars/small/missing.png',
        medium:
          'https://s3.eu-central-1.amazonaws.com/com-citizenlab-backoffice/avatars/medium/missing.png',
        large:
          'https://s3.eu-central-1.amazonaws.com/com-citizenlab-backoffice/avatars/large/missing.png',
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: avatarsData } };
});
