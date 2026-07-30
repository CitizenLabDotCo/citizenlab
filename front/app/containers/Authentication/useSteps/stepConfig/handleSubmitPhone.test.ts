import { checkPhone } from 'api/users/checkUser';

import { handleSubmitPhone } from './utils';

jest.mock('api/users/checkUser', () => ({
  checkEmail: jest.fn(),
  checkPhone: jest.fn(),
}));

const setCurrentStep = jest.fn();
const updateState = jest.fn();

const mockCheckPhone = (action: 'terms' | 'password' | 'confirm') => {
  (checkPhone as jest.Mock).mockResolvedValue({
    data: { type: 'check', attributes: { action } },
  });
};

describe('handleSubmitPhone', () => {
  it('goes to the phone policies step for a number without an account', async () => {
    mockCheckPhone('terms');

    await handleSubmitPhone('+14155552671', setCurrentStep, updateState);

    expect(checkPhone).toHaveBeenCalledWith('+14155552671');
    expect(updateState).toHaveBeenCalledWith({ flow: 'signup' });
    expect(setCurrentStep).toHaveBeenCalledWith('pre-auth:phone-policies');
  });

  it('goes to the (shared) password step when the account has a password', async () => {
    mockCheckPhone('password');

    await handleSubmitPhone('+14155552671', setCurrentStep, updateState);

    expect(updateState).toHaveBeenCalledWith({ flow: 'signin' });
    expect(setCurrentStep).toHaveBeenCalledWith('pre-auth:password');
  });

  it('goes to the phone confirmation step when a code was sent', async () => {
    mockCheckPhone('confirm');

    await handleSubmitPhone('+14155552671', setCurrentStep, updateState);

    expect(updateState).toHaveBeenCalledWith({ flow: 'signin' });
    expect(setCurrentStep).toHaveBeenCalledWith(
      'pre-auth:unauthenticated-phone-confirmation'
    );
  });

  it('rethrows errors so the form can show them', async () => {
    (checkPhone as jest.Mock).mockRejectedValue({
      errors: { phone: [{ error: 'unsupported_country' }] },
    });

    await expect(
      handleSubmitPhone('+14155552671', setCurrentStep, updateState)
    ).rejects.toEqual({
      errors: { phone: [{ error: 'unsupported_country' }] },
    });
    expect(setCurrentStep).not.toHaveBeenCalled();
  });
});
