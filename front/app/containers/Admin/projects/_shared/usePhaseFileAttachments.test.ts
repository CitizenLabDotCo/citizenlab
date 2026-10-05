import { fileAttachmentErrors } from './usePhaseFileAttachments';

describe('fileAttachmentErrors', () => {
  it('keeps only the whitelist error when the API pairs it with a blank one', () => {
    const reason = {
      errors: {
        file: [{ error: 'blank' }, { error: 'extension_whitelist_error' }],
      },
    };

    expect(fileAttachmentErrors(reason)).toEqual({
      file: [{ error: 'extension_whitelist_error' }],
    });
  });

  it('passes other field errors through untouched', () => {
    const reason = { errors: { base: [{ error: 'too_large' }] } };

    expect(fileAttachmentErrors(reason)).toEqual(reason.errors);
  });

  it('passes file errors through when none is a whitelist error', () => {
    const reason = { errors: { file: [{ error: 'blank' }] } };

    expect(fileAttachmentErrors(reason)).toEqual(reason.errors);
  });

  it('reports a base error for a rejection that carries no errors', () => {
    expect(fileAttachmentErrors(new Error('network'))).toEqual({
      base: [{ error: 'unknown' }],
    });
    expect(fileAttachmentErrors(undefined)).toEqual({
      base: [{ error: 'unknown' }],
    });
  });
});
