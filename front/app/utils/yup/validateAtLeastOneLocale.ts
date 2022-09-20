import { object, lazy, string } from 'yup';

const validateAtLeastOneLocale = (message: string) => {
  return lazy((obj) => {
    const keys = Object.keys(obj);

    if (Object.values(obj).every((val) => val === '')) {
      return object(
        keys.reduce(
          (acc, curr) => ((acc[curr] = string().required(message)), acc),
          {}
        )
      );
    }
    return object(
      keys.reduce((acc, curr) => ((acc[curr] = string()), acc), {})
    );
  });
};

export default validateAtLeastOneLocale;
