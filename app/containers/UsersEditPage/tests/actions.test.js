import {
  loadCurrentUserSuccess,
} from '../actions';
import { stringMock } from 'utils/testing/constants';

describe('UsersEditPage actions', () => {
  describe('loadCurrentUserSuccess', () => {
    const apiResponse = {
      data: {
        attributes: {
          avatar: {
            medium: `${stringMock}a`,
          },
        },
        id: `${stringMock}b`,
      },
    };

    it('should should avatar as a string', () => {
      expect(loadCurrentUserSuccess(apiResponse).payload.avatar).toEqual(`${stringMock}a`);
    });

    it('should should userId not null', () => {
      expect(loadCurrentUserSuccess(apiResponse).userId).toEqual(`${stringMock}b`);
    });
  });
});
