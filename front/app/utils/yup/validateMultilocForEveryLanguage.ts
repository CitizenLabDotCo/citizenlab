import { object, lazy, string } from 'yup';

// validates that every key passed in (e.g. for a multiloc)
// has a corresponding value. this is based on the input object
// and not the configured locales

const validateMultilocForEveryLanguage = (message: string) =>
  lazy((obj) => {
    const keys = Object.keys(obj);

    return object(
      keys.reduce(
        (acc, curr) => ((acc[curr] = string().required(message)), acc),
        {}
      )
    );
  });

export default validateMultilocForEveryLanguage;
