import { object } from 'yup';
import validateAtLeastOneLocale from './validateAtLeastOneLocale';

const validateElementTitle = (message: string) => {
  return object().when('input_type', (input_type: string, schema) => {
    if (['page', 'section'].includes(input_type)) {
      return schema.test('input type is page or section', message, () => {
        return true;
      });
    }
    return validateAtLeastOneLocale(message);
  });
};

export default validateElementTitle;
