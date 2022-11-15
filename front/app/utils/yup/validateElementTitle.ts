import { object } from 'yup';
import validateMultilocForEveryLocale from './validateMultilocForEveryLocale';

const validateElementTitle = (message: string) => {
  return object().when('input_type', (input_type: string, schema) => {
    if (input_type === 'page') {
      return schema.test('input type is page', message, () => {
        return true;
      });
    }
    return validateMultilocForEveryLocale(message);
  });
};

export default validateElementTitle;
