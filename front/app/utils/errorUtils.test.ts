import { handleHookFormSubmissionError } from 'utils/errorUtils';

describe('handleHookFormSubmissionError', () => {
  it('calls handle error correctly with JSONCLErrors', () => {
    const handleError = jest.fn();

    handleHookFormSubmissionError(
      { errors: { slug: [{ error: 'taken', value: 'faq' }] } },
      handleError
    );
    expect(handleError).toHaveBeenCalledWith('slug', {
      error: 'taken',
      value: 'faq',
    });
  });
  it('calls handle error correctly with Error', () => {
    const handleError = jest.fn();
    handleHookFormSubmissionError(new Error(), handleError);
    expect(handleError).toHaveBeenCalledWith('submissionError', {
      type: 'server',
    });
  });
});
