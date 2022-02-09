import { GetAvatarsChildProps } from 'resources/GetAvatars';
import { IAvatarData } from 'services/avatars';

let testData = {
  id: 'AvatarIDRet',
  type: 'avatar',
  attributes: {
    avatar: {
      small: 'temp',
      medium: 'temp',
      large: 'temp',
    },
  },
} as IAvatarData;

export const mockGetAvatars = [testData] as GetAvatarsChildProps;
