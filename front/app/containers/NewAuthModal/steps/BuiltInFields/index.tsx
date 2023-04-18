import React, { useEffect } from 'react';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocale from 'hooks/useLocale';
import useAuthUser from 'hooks/useAuthUser';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// i18n
import { useIntl } from 'utils/cl-intl';
import sharedMessages from '../messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getDefaultValues, getSchema } from './form';
import Input from 'components/HookForm/Input';
import PasswordInput from 'components/HookForm/PasswordInput';

// tracks
import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

// utils
import { isNilOrError } from 'utils/helperUtils';

// constants
import { DEFAULT_MINIMUM_PASSWORD_LENGTH } from 'components/UI/PasswordInput';

// typings
import { BuiltInFieldsUpdate } from '../../useSteps/stepConfig/typings';
import { Status } from 'containers/NewAuthModal/typings';
import { IUserData } from 'services/users';

interface BaseProps {
  status: Status;
  onSwitchFlow: () => void;
  onGoBack: () => void;
  onSubmit: (userId: string, update: BuiltInFieldsUpdate) => void;
}

interface Props extends BaseProps {
  authUser: IUserData;
}

const BuiltInFields = ({ status, authUser, onSubmit }: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const locale = useLocale();
  const { formatMessage } = useIntl();

  const loading = status === 'pending';
  const appConfigSettings = appConfiguration?.data.attributes.settings;
  const minimumPasswordLength =
    appConfigSettings?.password_login?.minimum_length ??
    DEFAULT_MINIMUM_PASSWORD_LENGTH;

  const schema = getSchema(minimumPasswordLength, formatMessage);

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: getDefaultValues(authUser),
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    trackEventByName(tracks.signUpEmailPasswordStepEntered);
  }, []);

  if (isNilOrError(locale)) return null;

  const handleSubmit = ({
    first_name,
    last_name,
    password,
  }: BuiltInFieldsUpdate) => {
    onSubmit(authUser.id, {
      first_name,
      last_name,
      password,
    });
  };

  return (
    <Box id="e2e-sign-in-email-password-container">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Box id="e2e-firstName-container">
            <Input
              name="first_name"
              id="firstName"
              type="text"
              autocomplete="given-name"
              label={formatMessage(sharedMessages.firstNamesLabel)}
            />
          </Box>
          <Box id="e2e-lastName-container" mt="16px">
            <Input
              name="last_name"
              id="lastName"
              type="text"
              autocomplete="family-name"
              label={formatMessage(sharedMessages.lastNameLabel)}
            />
          </Box>
          <Box id="e2e-password-container" mt="16px">
            <PasswordInput
              name="password"
              id="password"
              label={formatMessage(sharedMessages.password)}
              autocomplete="current-password"
            />
          </Box>
          <Box w="100%" display="flex" mt="24px">
            <Button
              type="submit"
              width="auto"
              disabled={loading}
              processing={loading}
              id="e2e-signup-password-submit-button"
            >
              {formatMessage(sharedMessages.continue)}
            </Button>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
};

const BuiltInFieldsWrapper = (props: BaseProps) => {
  const authUser = useAuthUser();
  if (isNilOrError(authUser)) return null;

  return <BuiltInFields {...props} authUser={authUser} />;
};

export default BuiltInFieldsWrapper;
