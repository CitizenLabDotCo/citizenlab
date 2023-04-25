import React, { useState } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import PasswordInput from 'components/HookForm/PasswordInput';
import { Helmet } from 'react-helmet';
import { FormLabel } from 'components/UI/FormComponents';
import ChangePasswordSuccess from './ChangePasswordSuccess';
import {
  StyledContentContainer,
  Title,
  StyledButton,
  Form,
  LabelContainer,
  StyledPasswordIconTooltip,
} from 'components/smallForm';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object } from 'yup';

// style
import messages from './messages';
import { stylingConsts } from 'utils/styleUtils';

// i18n
import { useIntl } from 'utils/cl-intl';

// services
import { changePassword } from 'services/users';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import useAuthUser from 'hooks/useAuthUser';
import GoBackButton from 'components/UI/GoBackButton';
import clHistory from 'utils/cl-router/history';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

type FormValues = {
  current_password: string;
  password: string;
};

type Props = {
  tenant: GetAppConfigurationChildProps;
};

const ChangePassword = ({ tenant }: Props) => {
  const authUser = useAuthUser();
  const { formatMessage } = useIntl();
  const [success, setSuccess] = useState(false);
  const userHasPreviousPassword =
    !isNilOrError(authUser) && !authUser.attributes?.no_password;
  const pageTitle = userHasPreviousPassword
    ? messages.titleChangePassword
    : messages.titleAddPassword;

  const minimumPasswordLength =
    (!isNilOrError(tenant) &&
      tenant.attributes.settings.password_login?.minimum_length) ||
    0;

  const schemaPreviousPasswordExists = object({
    current_password: string().required(
      formatMessage(messages.currentPasswordRequired)
    ),
    password: string()
      .required(formatMessage(messages.newPasswordRequired))
      .min(
        minimumPasswordLength,
        formatMessage(messages.minimumPasswordLengthError, {
          minimumPasswordLength,
        })
      ),
  });

  const schemaNoPreviousPassword = object({
    password: string()
      .required(formatMessage(messages.newPasswordRequired))
      .min(
        minimumPasswordLength,
        formatMessage(messages.minimumPasswordLengthError, {
          minimumPasswordLength,
        })
      ),
  });

  const schema = userHasPreviousPassword
    ? schemaPreviousPasswordExists
    : schemaNoPreviousPassword;

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      current_password: '',
      password: '',
    },
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async ({ ...formValues }: FormValues) => {
    try {
      await changePassword(formValues);
      setSuccess(true);
      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/users/me`],
      });
      await streams.fetchAllWith({
        partialApiEndpoint: [`${API_PATH}/users/custom_fields`],
      });
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  if (isNilOrError(authUser)) {
    return null;
  }

  if (success) return <ChangePasswordSuccess />;
  return (
    <Box
      width="100%"
      minHeight={`calc(100vh - ${
        stylingConsts.menuHeight + stylingConsts.footerHeight
      }px)`}
    >
      <FormProvider {...methods}>
        <Helmet
          title={formatMessage(messages.helmetTitle)}
          meta={[
            {
              name: 'description',
              content: formatMessage(messages.helmetDescription),
            },
          ]}
        />
        <main>
          <StyledContentContainer>
            <Box mt="30px">
              <GoBackButton
                onClick={() => {
                  clHistory.goBack();
                }}
              />
            </Box>
            <Title>{formatMessage(pageTitle)}</Title>
            <Form>
              {userHasPreviousPassword && (
                <>
                  <LabelContainer>
                    <FormLabel
                      width="max-content"
                      margin-right="5px"
                      labelMessage={messages.currentPasswordLabel}
                      htmlFor="current_password"
                    />
                  </LabelContainer>
                  <PasswordInput
                    name="current_password"
                    autocomplete="current-password"
                    isLoginPasswordInput={true}
                  />
                </>
              )}
              <LabelContainer className="margin-top">
                <FormLabel
                  width="max-content"
                  margin-right="5px"
                  labelMessage={messages.newPasswordLabel}
                  htmlFor="password"
                />
                <StyledPasswordIconTooltip />
              </LabelContainer>
              <PasswordInput name="password" autocomplete="new-password" />
              <StyledButton
                id="password-submit-button"
                type="submit"
                size="m"
                processing={methods.formState.isSubmitting}
                onClick={methods.handleSubmit(onFormSubmit)}
                text={formatMessage(messages.submitButton)}
              />
            </Form>
          </StyledContentContainer>
        </main>
      </FormProvider>
    </Box>
  );
};

export default () => (
  <GetAppConfiguration>
    {(tenant) => <ChangePassword tenant={tenant} />}
  </GetAppConfiguration>
);
