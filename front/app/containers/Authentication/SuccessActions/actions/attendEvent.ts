import { IEventData } from 'api/events/types';
import { IUserData } from 'api/users/types';

export interface AttendEventParams {
  event: IEventData;
}

export const attendEvent = (_: AttendEventParams) => {
  return async (authUser: IUserData) => {
    // attendFunction(authUser);
  };
};
