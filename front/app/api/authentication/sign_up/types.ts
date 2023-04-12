import { Locale } from '@citizenlab/cl2-component-library';

export type CreateAccountWithPasswordProperties = {
  [x: string]: {
    email: string;
    password: string;
    locale: Locale;
    first_name: string;
    last_name: string;
  };
};

export type CreateEmailOnlyAccountProperties = {
  user: { email: string; locale: Locale };
};
