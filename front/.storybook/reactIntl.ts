const locales = ['en'];

const messages = locales.reduce(
  async (acc, lang) => ({
    ...acc,
    [lang]: await import(`../app/translations/${lang}.json`), // whatever the relative path to your messages json is
  }),
  {}
);

const formats = {}; // optional, if you have any formats

export const reactIntl = {
  defaultLocale: 'en',
  locales,
  messages,
  formats,
};
