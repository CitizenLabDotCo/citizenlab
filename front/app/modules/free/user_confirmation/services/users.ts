import 'services/users';

declare module 'services/users' {
  export interface IUserAttributes {
    confirmation_required: boolean;
  }
}
