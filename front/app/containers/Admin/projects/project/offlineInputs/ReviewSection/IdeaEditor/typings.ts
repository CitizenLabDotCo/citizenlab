export interface UserFormData {
  userState: 'no-user' | 'invalid-email' | 'new-user' | 'existing-user';
  first_name?: string;
  last_name?: string;
  email?: string;
  consent: boolean;
}
