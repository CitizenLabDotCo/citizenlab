import { SupportedLocale } from 'typings';

export type CreateAccountWithPasswordProperties = {
  [x: string]: {
    email: string;
    password: string;
    locale: SupportedLocale;
    first_name: string;
    last_name: string;
  };
};

export type CreateEmailOnlyAccountProperties = {
  user: { email: string; locale: SupportedLocale };
};

export type CreatePhoneOnlyAccountProperties = {
  user: {
    phone: string;
    locale: SupportedLocale;
    claim_tokens?: string[];
  };
};
