import { object } from 'yup';

import { MAX_SMS_SEGMENTS } from 'utils/sms/segments';

import validateSmsBodyMultiloc from './validateSmsBodyMultiloc';

// 153 GSM-7 characters per concatenated segment, 67 once the message is Unicode.
const atLimit = 'a'.repeat(153 * MAX_SMS_SEGMENTS);
const overLimit = 'a'.repeat(153 * MAX_SMS_SEGMENTS + 1);

describe('validateSmsBodyMultiloc', () => {
  const schema = object().shape({
    body_multiloc: validateSmsBodyMultiloc(
      'Please provide a message',
      'Too many segments'
    ),
  });

  const validate = (body_multiloc: Record<string, string>) =>
    schema.validate({ body_multiloc }).catch((err) => err);

  it('should return an error if all locales are empty', async () => {
    expect(await schema.isValid({ body_multiloc: { en: '', fr: '' } })).toBe(
      false
    );

    const error = await validate({ en: '', fr: '' });
    expect(error.message).toBe('Please provide a message');
  });

  it('should return an error if at least one locale is empty', async () => {
    const error = await validate({ en: '', fr: 'Bonjour' });
    expect(error.message).toBe('Please provide a message');
  });

  it('should be valid if all locales have content', async () => {
    expect(
      await schema.isValid({ body_multiloc: { en: 'Hello', fr: 'Bonjour' } })
    ).toBe(true);
  });

  it(`should be valid at exactly ${MAX_SMS_SEGMENTS} segments`, async () => {
    expect(await schema.isValid({ body_multiloc: { en: atLimit } })).toBe(true);
  });

  it(`should return an error above ${MAX_SMS_SEGMENTS} segments`, async () => {
    expect(await schema.isValid({ body_multiloc: { en: overLimit } })).toBe(
      false
    );

    const error = await validate({ en: overLimit });
    expect(error.message).toBe('Too many segments');
  });

  it('should cap each locale independently', async () => {
    expect(
      await schema.isValid({ body_multiloc: { en: 'Short', fr: overLimit } })
    ).toBe(false);
  });

  // The same body costs more segments in a language that falls outside GSM-7, so the
  // limit is hit at well under half the length. A raw character cap would miss this.
  it('should reject a much shorter body in a language that forces Unicode', async () => {
    const unicodeOverLimit = 'ж'.repeat(67 * MAX_SMS_SEGMENTS + 1);
    expect(unicodeOverLimit.length).toBeLessThan(atLimit.length);

    expect(
      await schema.isValid({ body_multiloc: { en: unicodeOverLimit } })
    ).toBe(false);
  });
});
