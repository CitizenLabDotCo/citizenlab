// The library writes dates day first (dd / mm / yyyy). English is the one
// platform language whose default puts the month first, so it reads as en-GB.
const dayFirstLocale = (locale: string) =>
  /^en(-US)?$/i.test(locale) ? 'en-GB' : locale;

export default dayFirstLocale;
