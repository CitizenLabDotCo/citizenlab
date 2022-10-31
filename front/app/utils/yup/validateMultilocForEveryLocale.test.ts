import { object } from 'yup';
import validateMultilocForEveryLocale from './validateMultilocForEveryLocale';

describe('validateMultilocForEveryLocale', () => {
  const schema = object().shape({
    title_multiloc: validateMultilocForEveryLocale('Please provide a title'),
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

  it('should return an error if at least one locale is empty', async () => {
    const result = await schema.isValid({
      title_multiloc: {
        en: '',
        fr: 'Bonjour',
      },
    });
    expect(result).toBe(false);

    const error = await schema
      .validate({
        title_multiloc: {
          en: '',
          fr: 'Bonjour',
        },
      })
      .catch((err) => err);
    expect(error.message).toBe('Please provide a title');
  });

  it('should be valid if all locales have content', async () => {
    const result = await schema.isValid({
      title_multiloc: {
        en: 'Hello',
        fr: 'Bonjour',
      },
    });
    expect(result).toBe(true);
  });
});
