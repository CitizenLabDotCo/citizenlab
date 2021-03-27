import { InjectedIntl } from 'react-intl';

export const getDummyIntlObject = (messages?: any) => {
  const intl: InjectedIntl = {
    messages,
    defaultFormats: undefined,
    defaultLocale: 'en',
    formatDate: jest.fn(),
    formatHTMLMessage: jest.fn(),
    formatMessage: ({ defaultMessage }) => defaultMessage as string,
    formatNumber: jest.fn(),
    formatPlural: jest.fn(),
    formatRelative: jest.fn(),
    formatTime: jest.fn(),
    formats: undefined,
    locale: 'en',
    now: jest.fn(),
    onError: jest.fn(),
  };

  return intl;
};
