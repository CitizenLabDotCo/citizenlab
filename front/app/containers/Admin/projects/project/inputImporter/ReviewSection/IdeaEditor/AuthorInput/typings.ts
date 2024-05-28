export interface SelectedAuthor {
  email?: string;
  first_name?: string;
  last_name?: string;
  id?: string;
  user_state: 'new-imported-user' | 'existing-user' | 'no-user';
}
