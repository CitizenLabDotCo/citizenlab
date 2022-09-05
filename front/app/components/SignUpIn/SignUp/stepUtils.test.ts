import { getDefaultSteps, getActiveStep, getEnabledSteps } from './stepUtils';
import { IUserData } from 'services/users';
import { ISignUpInMetaData } from 'components/SignUpIn';
import { isNilOrError } from 'utils/helperUtils';
import { TSignUpConfiguration, TSignUpStepConfigurationObject } from './';
import { TAuthUser } from 'hooks/useAuthUser';

const baseConfiguration = getDefaultSteps();

const isActive = (authUser: TAuthUser) => {
  return !isNilOrError(authUser) && authUser.attributes.confirmation_required;
};

const confirmationConfiguration: TSignUpStepConfigurationObject = {
  key: 'confirmation',
  position: 4,
  isEnabled: (authUser, __, { emailSignUpSelected }) => {
    if (emailSignUpSelected) return true;
    return isActive(authUser);
  },
  isActive,
  canTriggerRegistration: true,
};

const verificationConfiguration: TSignUpStepConfigurationObject = {
  key: 'verification',
  position: 5,
  isEnabled: (_, metaData) => !!metaData.verification,
  isActive: (authUser, metaData) => {
    if (isNilOrError(authUser)) return false;
    const verificationFlow = !!metaData.verification;
    return verificationFlow && !authUser.attributes.verified;
  },
  canTriggerRegistration: true,
};

interface GetAuthUserArgs {
  confirmationRequired?: boolean;
  verified?: boolean;
  registrationCompleted?: boolean;
}

const getAuthUser = ({
  confirmationRequired = false,
  verified = false,
  registrationCompleted = false,
}: GetAuthUserArgs) =>
  ({
    attributes: {
      confirmation_required: confirmationRequired,
      verified,
      registration_completed_at: registrationCompleted ? '2020/11/08' : null,
    },
  } as IUserData);

interface GetMetaDataProps {
  requiresVerification?: boolean;
  isInvitation?: boolean;
  inModal?: boolean;
  token?: string;
}

const getMetaData = ({
  requiresVerification = false,
  isInvitation = false,
  inModal = true,
  token = undefined,
}: GetMetaDataProps) =>
  ({
    flow: 'signup',
    pathname: '',
    verification: requiresVerification,
    isInvitation,
    token: token ?? undefined,
    inModal,
  } as ISignUpInMetaData);

describe('getActiveStep', () => {
  describe('with invites', () => {
    it("returns 'password-signup' when isInvitation and token was provided", () => {
      const authUser = null;
      const metaData = getMetaData({ isInvitation: true, token: '1234' });

      expect(
        getActiveStep(baseConfiguration, authUser, metaData, {
          emailSignUpSelected: false,
          accountCreated: false,
        })
      ).toBe('password-signup');
    });
    it("returns 'password-signup' when isInvitation and no token was provided", () => {
      const authUser = null;
      const metaData = getMetaData({ isInvitation: true });

      expect(
        getActiveStep(baseConfiguration, authUser, metaData, {
          emailSignUpSelected: false,
          accountCreated: false,
        })
      ).toBe('password-signup');
    });
  });
  it("returns 'auth-providers' at beginning of flow", () => {
    const authUser = null;
    const metaData = getMetaData({});

    expect(
      getActiveStep(baseConfiguration, authUser, metaData, {
        emailSignUpSelected: false,
        accountCreated: false,
      })
    ).toBe('auth-providers');
  });

  it("returns 'password-signup' if emailSignUpSelected (confirmation disabled)", () => {
    const authUser = null;
    const metaData = getMetaData({});

    expect(
      getActiveStep(baseConfiguration, authUser, metaData, {
        emailSignUpSelected: true,
        accountCreated: false,
      })
    ).toBe('password-signup');
  });

  it("returns 'password-signup' if emailSignUpSelected (confirmation enabled)", () => {
    const configuration = {
      ...baseConfiguration,
      confirmation: confirmationConfiguration,
    } as TSignUpConfiguration;

    const authUser = null;
    const metaData = getMetaData({});

    expect(
      getActiveStep(configuration, authUser, metaData, {
        emailSignUpSelected: true,
        accountCreated: false,
      })
    ).toBe('password-signup');
  });

  it("returns 'confirmation' if confirmation required after email signup", () => {
    const configuration = {
      ...baseConfiguration,
      confirmation: confirmationConfiguration,
    } as TSignUpConfiguration;

    const authUser = getAuthUser({ confirmationRequired: true });
    const metaData = getMetaData({});

    expect(
      getActiveStep(configuration, authUser, metaData, {
        emailSignUpSelected: true,
        accountCreated: true,
      })
    ).toBe('confirmation');
  });

  it("returns 'account-created' if returning after user refreshes page/return from SSO", () => {
    const configuration = {
      ...baseConfiguration,
      confirmation: confirmationConfiguration,
    } as TSignUpConfiguration;

    const authUser = getAuthUser({});
    const metaData = getMetaData({});

    expect(
      getActiveStep(configuration, authUser, metaData, {
        emailSignUpSelected: false,
        accountCreated: false,
      })
    ).toBe('account-created');
  });

  it("returns 'account-created' if returning after user refreshes page/return from SSO, even if confirmation is active", () => {
    const configuration = {
      ...baseConfiguration,
      confirmation: confirmationConfiguration,
    } as TSignUpConfiguration;

    const authUser = getAuthUser({ confirmationRequired: true });
    const metaData = getMetaData({});

    expect(
      getActiveStep(configuration, authUser, metaData, {
        emailSignUpSelected: false,
        accountCreated: false,
      })
    ).toBe('account-created');
  });

  it("returns 'confirmation' if confirmation required without email signup (e.g. after refresh) after 'account-created'", () => {
    const configuration = {
      ...baseConfiguration,
      confirmation: confirmationConfiguration,
    } as TSignUpConfiguration;

    const authUser = getAuthUser({ confirmationRequired: true });
    const metaData = getMetaData({});

    expect(
      getActiveStep(configuration, authUser, metaData, {
        emailSignUpSelected: false,
        accountCreated: true,
      })
    ).toBe('confirmation');
  });

  it("returns 'verification' if !verified and metaData.verification", () => {
    const configuration = {
      ...baseConfiguration,
      confirmation: confirmationConfiguration,
      verification: verificationConfiguration,
    } as TSignUpConfiguration;

    const authUser = getAuthUser({});
    const metaData = getMetaData({ requiresVerification: true });

    expect(
      getActiveStep(configuration, authUser, metaData, {
        emailSignUpSelected: true,
        accountCreated: true,
      })
    ).toBe('verification');
  });

  it("returns 'success' if verified, registration completed and metaData.verification", () => {
    const configuration = {
      ...baseConfiguration,
      confirmation: confirmationConfiguration,
      verification: verificationConfiguration,
    } as TSignUpConfiguration;

    const authUser = getAuthUser({
      verified: true,
      registrationCompleted: true,
    });
    const metaData = getMetaData({});

    expect(
      getActiveStep(configuration, authUser, metaData, {
        emailSignUpSelected: true,
        accountCreated: true,
      })
    ).toBe('success');
  });

  it("returns 'success' if !verified, registration completed and !metaData.verification", () => {
    const configuration = {
      ...baseConfiguration,
      confirmation: confirmationConfiguration,
      verification: verificationConfiguration,
    } as TSignUpConfiguration;

    const authUser = getAuthUser({ registrationCompleted: true });
    const metaData = getMetaData({});

    expect(
      getActiveStep(configuration, authUser, metaData, {
        emailSignUpSelected: true,
        accountCreated: true,
      })
    ).toBe('success');
  });
});

describe('getEnabledSteps', () => {
  it('returns correct steps for base configuration if in modal', () => {
    const authUser = getAuthUser({});
    const metaData = getMetaData({ inModal: true });

    expect(
      getEnabledSteps(baseConfiguration, authUser, metaData, {
        emailSignUpSelected: true,
        accountCreated: false,
      })
    ).toEqual([
      'auth-providers',
      'password-signup',
      'account-created',
      'success',
    ]);

    expect(
      getEnabledSteps(baseConfiguration, authUser, metaData, {
        emailSignUpSelected: false,
        accountCreated: false,
      })
    ).toEqual(['auth-providers', 'account-created', 'success']);
  });

  it('returns correct steps for base configuration if not in modal', () => {
    const authUser = getAuthUser({});
    const metaData = getMetaData({ inModal: false });

    expect(
      getEnabledSteps(baseConfiguration, authUser, metaData, {
        emailSignUpSelected: true,
        accountCreated: false,
      })
    ).toEqual(['auth-providers', 'password-signup', 'account-created']);

    expect(
      getEnabledSteps(baseConfiguration, authUser, metaData, {
        emailSignUpSelected: false,
        accountCreated: false,
      })
    ).toEqual(['auth-providers', 'account-created']);
  });
});
