import { FormatMessage } from 'typings';

import { getPasswordSchema } from './passwordSchema';

// The schema only needs message ids turned into strings.
const formatMessage = ((message: { defaultMessage?: string; id: string }) =>
  message.defaultMessage ?? message.id) as FormatMessage;

describe('getPasswordSchema strength enforcement', () => {
  it('accepts any sufficiently long password when no minimum strength is set', async () => {
    const schema = getPasswordSchema(formatMessage, {
      minimumPasswordLength: 8,
    });
    await expect(schema.validate('aaaaaaaaaaaa')).resolves.toBe('aaaaaaaaaaaa');
  });

  it('rejects a weak password when a minimum strength is set', async () => {
    const schema = getPasswordSchema(formatMessage, {
      minimumPasswordLength: 8,
      minimumStrength: 3,
    });
    await expect(schema.validate('aaaaaaaaaaaa')).rejects.toThrow();
  });

  it('accepts a strong password when a minimum strength is set', async () => {
    const schema = getPasswordSchema(formatMessage, {
      minimumPasswordLength: 8,
      minimumStrength: 3,
    });
    await expect(schema.validate('correct horse battery staple')).resolves.toBe(
      'correct horse battery staple'
    );
  });

  it('uses a default required message, overridable per form', async () => {
    const defaultSchema = getPasswordSchema(formatMessage, {
      minimumPasswordLength: 8,
    });
    await expect(defaultSchema.validate('')).rejects.toThrow(
      'Please enter your password'
    );

    const overridden = getPasswordSchema(formatMessage, {
      minimumPasswordLength: 8,
      requiredMessage: { id: 'x', defaultMessage: 'Enter your new password' },
    });
    await expect(overridden.validate('')).rejects.toThrow(
      'Enter your new password'
    );
  });
});
