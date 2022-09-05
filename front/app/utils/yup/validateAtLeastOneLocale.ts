import { object, lazy, string } from 'yup';

// Show error message if all locales are empty
const validateAtLeastOneLocale = (message: string) => {
  return lazy((obj) => {
    const keys = Object.keys(obj);

    return object(
      keys.reduce(
        (acc, curr) => ((acc[curr] = string().required(message)), acc),
        {}
      )
    ).test('all-empty', message, (value) => {
      return Object.values(value).every((v) => v === '');
    });
  });
};

export default validateAtLeastOneLocale;
