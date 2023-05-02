import React, { useMemo } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import SSOButtons from './SSOButtons';

// i18n
import { useIntl } from 'utils/cl-intl';
import sharedMessages from '../messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object } from 'yup';
import Input from 'components/HookForm/Input';

// utils
import { isValidEmail } from 'utils/validate';

// typings
import { SSOProvider } from 'services/singleSignOn';
import { Locale } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  onSubmit: (email: string, locale: Locale) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
}

interface FormValues {
  email: string;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  email: undefined,
};

const LightFlowStart = ({ onSubmit, onSwitchToSSO }: Props) => {
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const locale = useLocale();

  const { formatMessage } = useIntl();

  const schema = useMemo(
    () =>
      object({
        email: string()
          .email(formatMessage(sharedMessages.emailFormatError))
          .required(formatMessage(sharedMessages.emailMissingError))
          .test(
            '',
            formatMessage(sharedMessages.emailFormatError),
            isValidEmail
          ),
      }),
    [formatMessage]
  );

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  if (isNilOrError(locale)) return null;

  const handleSubmit = ({ email }: FormValues) => {
    onSubmit(email, locale);
  };

  return (
    <>
      {passwordLoginEnabled && (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            <Text mt="0px" mb="32px" color="tenantText">
              {formatMessage(sharedMessages.enterYourEmailAddress)}
            </Text>
            <Box>
              <Input
                name="email"
                type="email"
                label={formatMessage(sharedMessages.email)}
              />
            </Box>
            <Box w="100%" display="flex" mt="32px">
              <Button type="submit" width="100%">
                {formatMessage(sharedMessages.continue)}
              </Button>
            </Box>
          </form>
        </FormProvider>
      )}
      <SSOButtons onClickSSO={onSwitchToSSO} />
    </>
  );
};

export default LightFlowStart;
