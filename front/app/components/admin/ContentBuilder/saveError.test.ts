import { getSaveError } from './saveError';

describe('getSaveError', () => {
  it('recognises a save refused because of a file', () => {
    const error = {
      errors: { base: [{ error: 'unauthorized_file' }] },
    };

    expect(getSaveError(error)).toBe('unauthorizedFile');
  });

  it('treats other API errors as generic', () => {
    const error = { errors: { base: [{ error: 'Unauthorized!' }] } };

    expect(getSaveError(error)).toBe('generic');
  });

  it('treats errors without base errors as generic', () => {
    const error = { errors: { craftjs_json: [{ error: 'invalid' }] } };

    expect(getSaveError(error)).toBe('generic');
  });

  it('treats non-API errors as generic', () => {
    expect(getSaveError(new Error('Network error'))).toBe('generic');
  });
});
