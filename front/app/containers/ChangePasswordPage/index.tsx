import React from 'react';
import { adopt } from 'react-adopt';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import PasswordInput from 'components/HookForm/PasswordInput';
import PasswordIconTooltip from 'components/UI/PasswordInput/PasswordInputIconTooltip';
import { Helmet } from 'react-helmet';
import ContentContainer from 'components/ContentContainer';
import { FormLabel } from 'components/UI/FormComponents';
// import ChangePasswordFail from './ChangePasswordFail'
// import ChangePasswordSuccess from './ChangePasswordSuccess'

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, ref } from 'yup';

// style
import styled from 'styled-components';
import messages from './messages';
import { fontSizes, stylingConsts } from 'utils/styleUtils';

// i18n
import { useIntl } from 'utils/cl-intl';

// services
import { changePassword } from 'services/users';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 100px;
`;

const Title = styled.h1`
  width: 100%;
  color: #333;
  font-size: ${fontSizes.xxxxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 60px;
  margin-bottom: 50px;
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
  margin-bottom: 10px;
`;

const Form = styled.form`
  width: 100%;
  max-width: 380px;
  padding-left: 20px;
  padding-right: 20px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
`;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  &.margin-top {
    margin-top: 33px;
  }
`;

const StyledPasswordIconTooltip = styled(PasswordIconTooltip)`
  margin-bottom: 6px;
`;

type FormValues = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

type Props = {
  authUser: GetAuthUserChildProps;
  tenant: GetAppConfigurationChildProps;
};

const ChangePassword = ({ authUser, tenant }: Props) => {
  const { formatMessage } = useIntl();

  const minimumPasswordLength =
    (!isNilOrError(tenant) &&
      tenant.attributes.settings.password_login?.minimum_length) ||
    0;

  const schema = object({
    current_password: string().required(
      formatMessage(messages.currentPasswordRequired)
    ),
    new_password: string()
      .test(
        'length',
        'Value can be empty or contain a string at with least the minimum password length',
        (value, { createError, path }) => {
          if (
            value &&
            value.length > 0 &&
            value.length < minimumPasswordLength
          ) {
            return createError({
              path,
              message: formatMessage(messages.minimumPasswordLengthError, {
                minimumPasswordLength,
              }),
            });
          } else return true;
        }
      )
      .required(formatMessage(messages.newPasswordRequired)),
    confirm_password: string()
      .oneOf(
        [ref('new_password'), null],
        formatMessage(messages.passwordsDontMatch)
      )
      .required(formatMessage(messages.confirmPasswordRequired)),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
    resolver: yupResolver(schema),
  });

  if (isNilOrError(authUser)) return null;

  const onFormSubmit = async ({
    confirm_password,
    ...formValues
  }: FormValues) => {
    console.log(formValues);
    try {
      await changePassword(authUser.id, { ...formValues });
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  // if (fail) <ChangePasswordFail />
  // if (success) <ChangePasswordSuccess />
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
            <Title>{formatMessage(messages.title)}</Title>

            <Form>
              <LabelContainer>
                <FormLabel
                  width="max-content"
                  margin-right="5px"
                  labelMessage={messages.currentPasswordLabel}
                  htmlFor="password"
                />
              </LabelContainer>
              <PasswordInput
                name="current_password"
                autocomplete="current-password"
                isLoginPasswordInput={true}
              />
              <LabelContainer className="margin-top">
                <FormLabel
                  width="max-content"
                  margin-right="5px"
                  labelMessage={messages.newPasswordLabel}
                  htmlFor="password"
                />
                <StyledPasswordIconTooltip />
              </LabelContainer>
              <PasswordInput name="new_password" autocomplete="new-password" />
              <LabelContainer>
                <FormLabel
                  width="max-content"
                  margin-right="5px"
                  labelMessage={messages.confirmPasswordLabel}
                  htmlFor="password"
                />
              </LabelContainer>
              <PasswordInput
                name="confirm_password"
                autocomplete="new-password"
              />

              <StyledButton
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

const Data = adopt({
  authUser: <GetAuthUser />,
  tenant: <GetAppConfiguration />,
});

export default () => (
  <Data>{(dataProps) => <ChangePassword {...dataProps} />}</Data>
);
