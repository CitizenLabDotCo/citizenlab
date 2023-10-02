export type UserFormData = NewUserFormData | ExistingUserFormData;

interface NewUserFormData {
  newUser: true;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface ExistingUserFormData {
  newUser: false;
  email: string;
}
