import { object } from 'yup';

import validateAtLeastOneLocale from './validateAtLeastOneLocale';

const validateElementTitle = (message: string) => {
  return object().when('input_type', (input_type: string, schema) => {
    if (input_type === 'page') {
      return schema.test('input type is page', message, () => {
        return true;
      });
    }
    return validateAtLeastOneLocale(message);
  });
};

export default validateElementTitle;
