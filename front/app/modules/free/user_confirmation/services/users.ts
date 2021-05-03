import 'services/users';

declare module 'services/users' {
  export interface IUserAttributes {
    requires_confirmation: boolean | null;
  }
}
