import messages from '../messages';

// typings
import { TSignUpStep } from '..';
import { ISignUpInMetaData } from 'components/SignUpIn';
import { Multiloc } from 'typings';
import { IUserData } from 'services/users';
import { IAppConfigurationData } from 'services/appConfiguration';

const formatMessage = (message) => message.defaultMessage;

type TSignUpStepDescription = {
  id: TSignUpStep;
  position: number;
  stepName?: string;
  helperText?: (
    tenant: IAppConfigurationData | undefined
  ) => Multiloc | null | undefined;
  isEnabled: (metaData: ISignUpInMetaData) => boolean;
  isActive: (authUser: IUserData | undefined) => boolean;
};

const exampleConfig: TSignUpStepDescription[] = [
  {
    id: 'auth-providers',
    position: 1,
    stepName: formatMessage(messages.createYourAccount),
    helperText: (tenant) =>
      tenant?.attributes?.settings?.core?.signup_helper_text,
    isEnabled: (metaData) => !metaData?.isInvitation,
    isActive: (authUser) => !authUser,
  },
  {
    id: 'password-signup',
    position: 2,
    stepName: formatMessage(messages.createYourAccount),
    helperText: (tenant) =>
      tenant?.attributes?.settings?.core?.signup_helper_text,
    isEnabled: () => true,
    isActive: (authUser) => !authUser,
  },
  {
    id: 'success',
    position: 6,
    isEnabled: (metaData) => !!metaData?.inModal,
    isActive: (authUser) => !!authUser?.attributes?.registration_completed_at,
  },
];

export default exampleConfig;
