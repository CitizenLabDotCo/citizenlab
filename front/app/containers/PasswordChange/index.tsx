import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { Helmet } from 'react-helmet-async';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import meKeys from 'api/me/keys';
import useAuthUser from 'api/me/useAuthUser';
import useChangePassword from 'api/users/useChangePassword';

import PasswordInput from 'components/HookForm/PasswordInput';
import {
  StyledContentContainer,
  Title,
  StyledButton,
  Form,
  LabelContainer,
  StyledPasswordIconTooltip,
} from 'components/smallForm';
import { FormLabel } from 'components/UI/FormComponents';
import GoBackButton from 'components/UI/GoBackButton';

import { useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import clHistory from 'utils/cl-router/history';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';

import ChangePasswordSuccess from './ChangePasswordSuccess';
import messages from './messages';

type FormValues = {
  current_password: string;
  password: string;
};

const ChangePassword = () => {
  const { data: tenant } = useAppConfiguration();
  const { data: authUser } = useAuthUser();
  const { mutateAsync: changePassword } = useChangePassword();
  const { formatMessage } = useIntl();
  const [success, setSuccess] = useState(false);
  const userHasPreviousPassword =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !isNilOrError(authUser) && !authUser.data.attributes?.no_password;
  const pageTitle = userHasPreviousPassword
    ? messages.titleChangePassword
    : messages.titleAddPassword;

  const minimumPasswordLength =
    tenant?.data.attributes.settings.password_login?.minimum_length || 0;

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

  if (isNilOrError(authUser)) {
    return null;
  }

  const onFormSubmit = async ({ ...formValues }: FormValues) => {
    try {
      await changePassword(formValues);
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: meKeys.all() });
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  if (success) return <ChangePasswordSuccess />;

  return (
    <>
      <Helmet
        title={formatMessage(messages.helmetTitle)}
        meta={[
          {
            name: 'description',
            content: formatMessage(messages.helmetDescription),
          },
        ]}
      />
      <Box p="32px" pb="0">
        <GoBackButton
          onClick={() => {
            clHistory.goBack();
          }}
        />
      </Box>
      <main>
        <StyledContentContainer>
          <Title>{formatMessage(pageTitle)}</Title>
          <FormProvider {...methods}>
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
          </FormProvider>
        </StyledContentContainer>
      </main>
    </>
  );
};

export default ChangePassword;
