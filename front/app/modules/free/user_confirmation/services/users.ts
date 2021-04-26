import 'services/users';

declare module 'services/users' {
  export interface IUserAttributes {
    email_confirmed_at: string | null;
  }
}
