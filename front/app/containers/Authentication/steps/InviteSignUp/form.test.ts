import { FormatMessage } from 'typings';

import { getPasswordSchema } from './form';

// The schema only needs message ids turned into strings.
const formatMessage = ((message: { defaultMessage?: string; id: string }) =>
  message.defaultMessage ?? message.id) as FormatMessage;

describe('getPasswordSchema strength enforcement', () => {
  it('accepts any sufficiently long password when no minimum strength is set', async () => {
    const schema = getPasswordSchema(8, formatMessage);
    await expect(schema.validate('aaaaaaaaaaaa')).resolves.toBe('aaaaaaaaaaaa');
  });

  it('rejects a weak password when a minimum strength is set', async () => {
    const schema = getPasswordSchema(8, formatMessage, 3);
    await expect(schema.validate('aaaaaaaaaaaa')).rejects.toThrow();
  });

  it('accepts a strong password when a minimum strength is set', async () => {
    const schema = getPasswordSchema(8, formatMessage, 3);
    await expect(schema.validate('correct horse battery staple')).resolves.toBe(
      'correct horse battery staple'
    );
  });
});
