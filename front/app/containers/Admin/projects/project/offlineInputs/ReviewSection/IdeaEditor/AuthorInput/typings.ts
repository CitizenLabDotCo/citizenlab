export interface SelectedAuthor {
  email?: string;
  id?: string;
  userState: 'invalid-email' | 'new-user' | 'existing-user';
}
