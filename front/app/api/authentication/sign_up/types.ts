import { SupportedLocale } from 'typings';

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
