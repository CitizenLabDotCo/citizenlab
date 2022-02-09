import { BehaviorSubject } from 'rxjs';
import { IAvatar } from 'services/avatars';

let mockAvatar: IAvatar | null = null;

export const __setMockAvatars = (avatars: IAvatar) => {
  mockAvatar = avatars;
};

// export const makeAvatar = (id: string): IAvatar => ({
//   data: {
//     id,
//     type: 'avatar',
//     attributes: {
//       avatar: {
//         small: 'temp',
//         medium: 'temp',
//         large: 'temp',
//       },
//     }
//   }
// });

export const avatarsByIdStream = jest.fn((_avatarsId) => {
  const observable = new BehaviorSubject(mockAvatar);
  return {
    observable,
  };
});

export const avatarByIdStream = jest.fn((_avatarsId) => {
  const observable = new BehaviorSubject(mockAvatar);
  return {
    observable,
  };
});

export const randomAvatarsStream = jest.fn((_IStreamAvatarsParams) => {
  const observable = new BehaviorSubject(mockAvatar);
  return {
    observable,
  };
});
