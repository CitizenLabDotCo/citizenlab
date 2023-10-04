export interface SelectedAuthor {
  email?: string;
  id?: string;
  userState: 'no-user' | 'invalid-email' | 'new-user' | 'existing-user';
}
