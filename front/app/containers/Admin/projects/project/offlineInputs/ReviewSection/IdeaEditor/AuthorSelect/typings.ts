export interface SelectedAuthor {
  email?: string;
  id?: string;
  userState: 'no-user' | 'new-user' | 'existing-user';
}
