import { getDefaultSteps, getActiveStep, getEnabledSteps } from './stepUtils';
import { IUserData } from 'services/users';
import { ISignUpInMetaData } from 'components/SignUpIn';
import { isNilOrError } from 'utils/helperUtils';
import { TSignUpConfiguration } from './';

const baseConfiguration = getDefaultSteps();

const isActive = (authUser) => {
  return !isNilOrError(authUser) && !!authUser.attributes.confirmation_required;
};

const confirmationConfiguration = {
  key: 'confirmation',
  position: 3,
  isEnabled: (authUser, __, { emailSignUpSelected }) => {
    if (emailSignUpSelected) return true;
    return isActive(authUser);
  },
  isActive,
};

const verificationConfiguration = {
  key: 'verification',
  position: 4,
  isEnabled: (_, metaData) => !!metaData.verification,
  isActive: (authUser, metaData) => {
    if (isNilOrError(authUser)) return false;
    const verificationFlow = !!metaData.verification;
    return verificationFlow && !authUser.attributes.verified;
  },
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
}

const getMetaData = ({
  requiresVerification = false,
  isInvitation = false,
  inModal = true,
}: GetMetaDataProps) =>
  ({
    flow: 'signup',
    pathname: '',
    verification: requiresVerification,
    isInvitation,
    token: isInvitation ? '123' : undefined,
    inModal,
  } as ISignUpInMetaData);

describe('getActiveStep', () => {
  it("returns 'auth-providers' at beginning of flow", () => {
    const authUser = null;
    const metaData = getMetaData({});

    expect(
      getActiveStep(baseConfiguration, authUser, metaData, {
        emailSignUpSelected: false,
      })
    ).toBe('auth-providers');
  });

  it("returns 'password-signup' if emailSignUpSelected (confirmation disabled)", () => {
    const authUser = null;
    const metaData = getMetaData({});

    expect(
      getActiveStep(baseConfiguration, authUser, metaData, {
        emailSignUpSelected: true,
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
      })
    ).toBe('password-signup');
  });

  it("returns 'confirmation' if confirmation required", () => {
    const configuration = {
      ...baseConfiguration,
      confirmation: confirmationConfiguration,
    } as TSignUpConfiguration;

    const authUser = getAuthUser({ confirmationRequired: true });
    const metaData = getMetaData({});

    expect(
      getActiveStep(configuration, authUser, metaData, {
        emailSignUpSelected: true,
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
    const metaData = getMetaData({ requiresVerification: false });

    expect(
      getActiveStep(configuration, authUser, metaData, {
        emailSignUpSelected: true,
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
      })
    ).toEqual(['auth-providers', 'password-signup', 'success']);

    expect(
      getEnabledSteps(baseConfiguration, authUser, metaData, {
        emailSignUpSelected: false,
      })
    ).toEqual(['auth-providers', 'success']);
  });

  it('returns correct steps for base configuration if not in modal', () => {
    const authUser = getAuthUser({});
    const metaData = getMetaData({ inModal: false });

    expect(
      getEnabledSteps(baseConfiguration, authUser, metaData, {
        emailSignUpSelected: true,
      })
    ).toEqual(['auth-providers', 'password-signup']);

    expect(
      getEnabledSteps(baseConfiguration, authUser, metaData, {
        emailSignUpSelected: false,
      })
    ).toEqual(['auth-providers']);
  });
});
