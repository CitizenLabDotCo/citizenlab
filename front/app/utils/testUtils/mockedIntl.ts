export const getDummyIntlObject = (messages?: any) => {
  const intl: any = {
    messages,
    defaultLocale: 'en',
    formatDate: jest.fn(),
    formatMessage: ({ defaultMessage }) => defaultMessage as string,
    formatNumber: jest.fn(),
    formatPlural: jest.fn(),
    formatRelativeTime: jest.fn(),
    formatTime: jest.fn(),
    locale: 'en',
    onError: jest.fn(),
  };

  return intl;
};
