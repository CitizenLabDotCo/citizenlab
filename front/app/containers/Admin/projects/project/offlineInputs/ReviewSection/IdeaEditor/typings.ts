export interface UserFormData {
  user_state: 'invalid-email' | 'new-user' | 'existing-user';
  first_name?: string;
  last_name?: string;
  email?: string;
  user_id?: string;
  consent: boolean;
}
