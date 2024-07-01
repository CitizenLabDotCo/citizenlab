import { IUserData } from 'api/users/types';

export interface AttendEventParams {}

export const attendEvent = (_: AttendEventParams) => {
  return async (authUser: IUserData) => {
    // attendFunction(authUser);
  };
};
