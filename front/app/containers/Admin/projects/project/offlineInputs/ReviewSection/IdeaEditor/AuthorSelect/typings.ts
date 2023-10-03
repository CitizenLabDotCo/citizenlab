interface NewAuthor {
  newUser: true;
  email?: string;
}

interface ExistingAuthor {
  newUser: false;
  email?: string;
  id?: string;
}

export type SelectedAuthor = NewAuthor | ExistingAuthor;
