export interface SelectedAuthor {
  email?: string;
  id?: string;
  user_state: 'invalid-email' | 'new-user' | 'existing-user';
}
