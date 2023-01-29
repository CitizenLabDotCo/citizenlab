import { object } from 'yup';
import validateAtLeastOneLocale from './validateAtLeastOneLocale';

describe('validateAtLeastOneLocale', () => {
  const schema = object().shape({
    title_multiloc: validateAtLeastOneLocale('Please provide a title'),
  });

  it('should return an error if all locales are empty', async () => {
    const result = await schema.isValid({
      title_multiloc: {
        en: '',
        fr: '',
      },
    });
    expect(result).toBe(false);

    const error = await schema
      .validate({
        title_multiloc: { en: '', fr: '' },
      })
      .catch((err) => err);
    expect(error.message).toBe('Please provide a title');
  });

  it('should not return an error if at least one locale is not empty', async () => {
    const result = await schema.isValid({
      title_multiloc: {
        en: '',
        fr: 'Bonjour',
      },
    });
    expect(result).toBe(true);
  });
});
