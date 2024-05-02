export interface UserFormData {
  user_state: 'new-imported-user' | 'existing-user' | 'no-user';
  first_name?: string;
  last_name?: string;
  email?: string;
  user_id?: string;
  consent: boolean;
}
