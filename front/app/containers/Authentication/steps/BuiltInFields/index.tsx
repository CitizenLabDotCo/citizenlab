import React, { useEffect } from 'react';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocale from 'hooks/useLocale';
import useAuthUser from 'hooks/useAuthUser';
import useAuthenticationRequirements from 'api/authentication/authentication_requirements/useAuthenticationRequirements';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import sharedMessages from '../messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DEFAULT_VALUES, getSchema } from './form';
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
import { Status, AuthenticationData } from 'containers/Authentication/typings';
import { AuthenticationRequirements } from 'api/authentication/authentication_requirements/types';

interface BaseProps {
  status: Status;
  onSubmit: (userId: string, update: BuiltInFieldsUpdate) => void;
}

interface Props extends BaseProps {
  authenticationRequirements: AuthenticationRequirements;
}

const BuiltInFields = ({
  status,
  authenticationRequirements,
  onSubmit,
}: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();

  const loading = status === 'pending';
  const appConfigSettings = appConfiguration?.data.attributes.settings;
  const minimumPasswordLength =
    appConfigSettings?.password_login?.minimum_length ??
    DEFAULT_MINIMUM_PASSWORD_LENGTH;

  const schema = getSchema(
    minimumPasswordLength,
    formatMessage,
    authenticationRequirements
  );

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    trackEventByName(tracks.signUpEmailPasswordStepEntered);
  }, []);

  if (isNilOrError(locale) || isNilOrError(authUser)) return null;

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

  const builtIn = authenticationRequirements.requirements.built_in;
  const askFirstName = builtIn.first_name === 'require';
  const askLastName = builtIn.last_name === 'require';
  const askPassword =
    authenticationRequirements.requirements.special.password === 'require';

  return (
    <Box id="e2e-built-in-fields-container">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Text mt="0px" mb="32px">
            {formatMessage(messages.youNeedToCompleteYourProfile)}
          </Text>
          {askFirstName && (
            <Box id="e2e-firstName-container">
              <Input
                name="first_name"
                id="firstName"
                type="text"
                autocomplete="given-name"
                label={formatMessage(sharedMessages.firstNamesLabel)}
              />
            </Box>
          )}
          {askLastName && (
            <Box id="e2e-lastName-container" mt="16px">
              <Input
                name="last_name"
                id="lastName"
                type="text"
                autocomplete="family-name"
                label={formatMessage(sharedMessages.lastNameLabel)}
              />
            </Box>
          )}
          {askPassword && (
            <Box id="e2e-password-container" mt="16px">
              <PasswordInput
                name="password"
                id="password"
                label={formatMessage(sharedMessages.password)}
                autocomplete="current-password"
              />
            </Box>
          )}
          <Box w="100%" display="flex" mt="24px">
            <Button
              type="submit"
              width="auto"
              disabled={loading}
              processing={loading}
              id="e2e-built-in-fields-submit-button"
            >
              {formatMessage(sharedMessages.continue)}
            </Button>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
};

interface WrapperProps extends BaseProps {
  authenticationData: AuthenticationData;
}

const BuiltInFieldsWrapper = ({
  authenticationData,
  ...otherProps
}: WrapperProps) => {
  const { data: authenticationRequirementsResponse } =
    useAuthenticationRequirements(authenticationData.context);
  if (!authenticationRequirementsResponse) return null;

  return (
    <BuiltInFields
      {...otherProps}
      authenticationRequirements={
        authenticationRequirementsResponse.data.attributes.requirements
      }
    />
  );
};

export default BuiltInFieldsWrapper;
