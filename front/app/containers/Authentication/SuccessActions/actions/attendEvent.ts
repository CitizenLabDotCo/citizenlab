import { IUserData } from 'api/users/types';

export interface AttendEventParams {
  attendFunction: (user) => void;
}

export const attendEvent =
  ({ attendFunction }: AttendEventParams) =>
  async (authUser: IUserData) => {
    attendFunction(authUser);
  };
