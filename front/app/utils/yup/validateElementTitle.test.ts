import { object, string } from 'yup';

import validateElementTitle from './validateElementTitle';

describe('validateElementTitle', () => {
  const schema = object().shape({
    input_type: string(),
    title_multiloc: validateElementTitle('Please provide a title'),
  });

  it('should not return an error if page element and all locales are empty', async () => {
    const result = await schema.isValid({
      input_type: 'page',
      title_multiloc: {
        en: '',
        fr: '',
      },
    });
    expect(result).toBe(true);
  });

  it('should return an error if field element and all locales are empty', async () => {
    const result = await schema.isValid({
      input_type: 'text',
      title_multiloc: {
        en: '',
        fr: '',
      },
    });
    expect(result).toBe(false);
  });

  it('should not return an error if at least one locale is not empty', async () => {
    const result = await schema.isValid({
      input_type: 'text',
      title_multiloc: {
        en: 'Title',
        fr: '',
      },
    });
    expect(result).toBe(true);
  });
});
